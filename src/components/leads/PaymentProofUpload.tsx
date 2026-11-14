"use client";

import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { uploadPaymentProof } from "@/actions/leads";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "@/hooks/use-toast";
import { paymentOptions, PAYMENT_RULES } from "@/lib/payment-plan";
import { formatDate, formatInr, getOfferPricing } from "@/lib/utils";

export type PayCourse = { id: string; title: string; price: number; offer_price?: number | null; offer_ends_at?: string | null };
export type LeadPayment = { course_id: string | null; purpose: string; amount: number | string; status: string; created_at: string };

const KIND_OF_PURPOSE: Record<string, string> = { full: "Full fee", registration: `First ${PAYMENT_RULES.firstPercent}%`, balance: "Balance" };

/**
 * Counsellors log a UPI payment with its screenshot. The amount is not typed: it comes from the course's fee in the
 * courses table and from what is already logged, so only a full fee, the first 30% or the remaining balance can be
 * chosen. It is saved as pending and only an admin's verification makes it count, through apply_payment().
 */
export function PaymentProofUpload({
  leadId,
  courses,
  preferredCourseIds,
  payments,
}: {
  leadId: string;
  courses: PayCourse[];
  /** The courses ticked as interests on this lead; they are offered first. */
  preferredCourseIds: string[];
  payments: LeadPayment[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const ordered = useMemo(() => {
    const first = courses.filter((c) => preferredCourseIds.includes(c.id));
    return first.length > 0 ? first : courses;
  }, [courses, preferredCourseIds]);

  const [courseId, setCourseId] = useState(ordered[0]?.id ?? "");
  const course = courses.find((c) => c.id === courseId);
  const fee = course ? getOfferPricing(course).current : 0;
  const mine = payments.filter((p) => p.course_id === courseId);
  const { options, balanceDueBy, note } = paymentOptions(fee, mine);
  const [kind, setKind] = useState<string>("");
  const chosen = options.find((o) => o.kind === kind) ?? options[0];

  return (
    <form
      className="flex flex-col gap-4 rounded-xl border bg-muted/40 p-4"
      action={(formData) => {
        setError(null);
        formData.set("course_id", courseId);
        formData.set("kind", chosen?.kind ?? "");
        start(async () => {
          const result = await uploadPaymentProof(leadId, formData);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          toast.success("Payment logged. An admin will verify it.");
          setFileName(null);
          setKind("");
          router.refresh();
        });
      }}
    >
      <div>
        <h3 className="font-display text-sm font-bold">Log a payment</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          The amount comes from the course fee. Upload the UPI screenshot; an admin verifies it before it counts.
        </p>
      </div>

      {courses.length === 0 ? (
        <p className="text-sm text-muted-foreground">There are no published courses to take a payment for.</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Course" htmlFor={`course-${leadId}`} className="sm:col-span-2">
              <NativeSelect
                id={`course-${leadId}`}
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  setKind("");
                }}
              >
                {ordered.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} — {formatInr(getOfferPricing(c).current)}
                  </option>
                ))}
              </NativeSelect>
            </Field>

            {options.length > 0 ? (
              <>
                <Field label="Payment" htmlFor={`kind-${leadId}`}>
                  <NativeSelect id={`kind-${leadId}`} value={chosen?.kind ?? ""} onChange={(e) => setKind(e.target.value)}>
                    {options.map((o) => (
                      <option key={o.kind} value={o.kind}>
                        {o.label} — {formatInr(o.amount)}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
                <Field label="Amount to collect" htmlFor={`amount-${leadId}`}>
                  <Input id={`amount-${leadId}`} value={chosen ? formatInr(chosen.amount) : ""} readOnly aria-readonly className="bg-muted font-semibold" />
                </Field>
                <Field label="UPI reference" htmlFor={`ref-${leadId}`}>
                  <Input id={`ref-${leadId}`} name="transaction_ref" required />
                </Field>
                <Field label="Screenshot" htmlFor={`proof-${leadId}`}>
                  <Input
                    id={`proof-${leadId}`}
                    name="proof"
                    type="file"
                    accept="image/*,application/pdf"
                    required
                    className="file:mr-3 file:rounded file:bg-muted file:px-2 file:py-1 file:text-xs"
                    onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                  />
                </Field>
              </>
            ) : null}
          </div>

          {chosen?.kind === "balance" && balanceDueBy && (
            <p className="rounded-lg bg-card p-3 text-sm">
              The balance is due by <strong>{formatDate(balanceDueBy)}</strong>, {PAYMENT_RULES.balanceDays} days after the first payment.
            </p>
          )}
          {note && <p className="text-sm text-muted-foreground">{note}</p>}

          {mine.length > 0 && (
            <ul className="flex flex-col gap-1 text-sm">
              {mine.map((p, i) => (
                <li key={i} className="flex flex-wrap justify-between gap-2 text-muted-foreground">
                  <span>
                    {KIND_OF_PURPOSE[p.purpose] ?? p.purpose} · {formatInr(p.amount)}
                  </span>
                  <span>{p.status === "success" ? "Verified" : p.status === "failed" ? "Rejected" : "Waiting for verification"}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {fileName && <p className="text-xs text-muted-foreground">Selected: {fileName}</p>}
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      {options.length > 0 && (
        <Button type="submit" size="sm" loading={pending} className="self-start">
          <Upload /> Save payment
        </Button>
      )}
    </form>
  );
}
