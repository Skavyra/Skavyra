"use client";

import { Check, ExternalLink, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { rejectPayment, verifyPayment } from "@/actions/payments";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { BUCKETS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatInr } from "@/lib/utils";

export type PendingPayment = {
  id: string;
  amount: number;
  purpose: string;
  transaction_ref: string | null;
  proof_path: string | null;
  created_at: string;
  lead_name: string | null;
  student_name: string | null;
  course_title: string | null;
  logged_by: string | null;
};

/** Offline UPI payments waiting for an admin. Verifying calls apply_payment(). */
export function VerifyQueue({ payments }: { payments: PendingPayment[] }) {
  if (payments.length === 0) {
    return (
      <EmptyState
        icon={Check}
        title="Nothing waiting"
        description="Payments logged by counsellors appear here for you to check against the bank."
      />
    );
  }
  return (
    <ul className="grid gap-4 lg:grid-cols-2">
      {payments.map((p) => (
        <li key={p.id}>
          <PaymentCard payment={p} />
        </li>
      ))}
    </ul>
  );
}

function PaymentCard({ payment }: { payment: PendingPayment }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [loadingProof, setLoadingProof] = useState(Boolean(payment.proof_path));

  useEffect(() => {
    if (!payment.proof_path) return;
    const supabase = createClient();
    supabase.storage
      .from(BUCKETS.paymentProofs)
      .createSignedUrl(payment.proof_path, 600)
      .then(({ data }) => {
        setProofUrl(data?.signedUrl ?? null);
        setLoadingProof(false);
      });
  }, [payment.proof_path]);

  const isPdf = payment.proof_path?.toLowerCase().endsWith(".pdf");

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-xl font-bold">{formatInr(payment.amount)}</p>
          <p className="truncate text-sm text-muted-foreground">
            {payment.student_name ?? payment.lead_name ?? "Unlinked"}
            {payment.course_title ? ` · ${payment.course_title}` : ""}
          </p>
        </div>
        <span className="text-xs text-muted-foreground">{formatDate(payment.created_at, true)}</span>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Towards</dt>
          <dd className="capitalize">{payment.purpose}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">UPI reference</dt>
          <dd className="truncate font-mono text-xs">{payment.transaction_ref ?? "—"}</dd>
        </div>
        {payment.logged_by && (
          <div className="col-span-2">
            <dt className="text-xs text-muted-foreground">Logged by</dt>
            <dd>{payment.logged_by}</dd>
          </div>
        )}
      </dl>

      {loadingProof ? (
        <Skeleton className="h-48 w-full" />
      ) : proofUrl ? (
        isPdf ? (
          <a href={proofUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-gold-700 hover:underline">
            Open the PDF proof <ExternalLink className="size-3.5" />
          </a>
        ) : (
          <a href={proofUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={proofUrl} alt="Payment screenshot" className="max-h-64 w-full object-contain bg-muted" />
          </a>
        )
      ) : (
        <p className="text-sm text-muted-foreground">No screenshot attached.</p>
      )}

      {!payment.student_name && (
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
          This payment is against a lead with no enrolment yet. Enrol the student first so the amount is credited to
          their course.
        </p>
      )}

      {rejecting ? (
        <div className="mt-auto flex flex-col gap-2">
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is it being rejected?" aria-label="Rejection reason" />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setRejecting(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              loading={pending}
              onClick={() =>
                start(async () => {
                  const result = await rejectPayment(payment.id, reason);
                  if (!result.ok) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success("Payment rejected");
                  router.refresh();
                })
              }
            >
              Confirm rejection
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-auto flex gap-2">
          <Button
            size="sm"
            loading={pending}
            disabled={!payment.student_name}
            onClick={() =>
              start(async () => {
                const result = await verifyPayment(payment.id);
                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }
                toast.success("Payment verified");
                router.refresh();
              })
            }
          >
            <Check /> Mark verified
          </Button>
          <Button variant="outline" size="sm" onClick={() => setRejecting(true)}>
            <X /> Reject
          </Button>
        </div>
      )}
    </div>
  );
}
