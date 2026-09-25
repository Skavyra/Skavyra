"use client";

import { MessageCircle, Phone, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateLead } from "@/actions/leads";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { LEAD_STATUSES, PAYMENT_PROOF_STATUSES } from "@/lib/constants";
import { toDateTimeInput } from "@/lib/utils";
import type { StudentLead } from "@/types";

import { PaymentProofUpload } from "./PaymentProofUpload";

export function LeadDetailForm({
  lead,
  courses,
  selectedCourseIds,
}: {
  lead: StudentLead;
  courses: { id: string; title: string }[];
  selectedCourseIds: string[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(lead.status);
  const [picked, setPicked] = useState<string[]>(selectedCourseIds);

  const showPayment = PAYMENT_PROOF_STATUSES.includes(status);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm">
          <a href={`tel:+91${lead.phone}`}>
            <Phone /> Call
          </a>
        </Button>
        <Button asChild size="sm" variant="outline">
          <a href={`https://wa.me/91${lead.phone}`} target="_blank" rel="noreferrer">
            <MessageCircle /> WhatsApp
          </a>
        </Button>
      </div>

      <form
        className="flex flex-col gap-5"
        action={(formData) => {
          setError(null);
          start(async () => {
            const result = await updateLead(lead.id, formData, picked);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            toast.success("Lead saved");
            router.refresh();
          });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="full_name">
            <Input id="full_name" name="full_name" defaultValue={lead.full_name} required />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <Input id="phone" name="phone" inputMode="numeric" defaultValue={lead.phone} required />
          </Field>
          <Field label="Alternate phone" htmlFor="alt_phone">
            <Input id="alt_phone" name="alt_phone" inputMode="numeric" defaultValue={lead.alt_phone ?? ""} />
          </Field>
          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" defaultValue={lead.email ?? ""} />
          </Field>
          <Field label="College" htmlFor="college_name">
            <Input id="college_name" name="college_name" defaultValue={lead.college_name ?? ""} />
          </Field>
          <Field label="Degree" htmlFor="degree">
            <Input id="degree" name="degree" defaultValue={lead.degree ?? ""} />
          </Field>
          <Field label="Branch" htmlFor="branch">
            <Input id="branch" name="branch" defaultValue={lead.branch ?? ""} />
          </Field>
          <Field label="Year of study" htmlFor="current_year">
            <Input id="current_year" name="current_year" inputMode="numeric" defaultValue={lead.current_year ?? ""} />
          </Field>
          <Field label="City" htmlFor="city">
            <Input id="city" name="city" defaultValue={lead.city ?? ""} />
          </Field>
          <Field label="State" htmlFor="state">
            <Input id="state" name="state" defaultValue={lead.state ?? ""} />
          </Field>
          <Field label="Status" htmlFor="status">
            <NativeSelect id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
              {LEAD_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Follow up on" htmlFor="follow_up_on">
            <Input id="follow_up_on" name="follow_up_on" type="datetime-local" defaultValue={toDateTimeInput(lead.follow_up_on)} />
          </Field>
        </div>

        <Field label="Course interest (free text)" htmlFor="interested_course_text">
          <Input id="interested_course_text" name="interested_course_text" defaultValue={lead.interested_course_text ?? ""} />
        </Field>

        <fieldset>
          <legend className="text-sm font-semibold">Courses interested in</legend>
          {courses.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No published courses yet.</p>
          ) : (
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {courses.map((c) => (
                <li key={c.id}>
                  <label className="flex items-center gap-2.5 text-sm">
                    <Checkbox
                      checked={picked.includes(c.id)}
                      onCheckedChange={(v) => setPicked((p) => (v === true ? [...p, c.id] : p.filter((id) => id !== c.id)))}
                    />
                    {c.title}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        <Field label="Remarks" htmlFor="remarks" hint="What was said on the call. Saved to the history.">
          <Textarea id="remarks" name="remarks" rows={3} defaultValue={lead.remarks ?? ""} />
        </Field>

        {error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" loading={pending} className="self-start">
          <Save /> Save
        </Button>
      </form>

      {showPayment && <PaymentProofUpload leadId={lead.id} />}
    </div>
  );
}
