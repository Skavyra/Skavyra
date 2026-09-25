"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createLead } from "@/actions/leads";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

/** Employees add a lead to their own list; admins add it unassigned. */
export function AddLeadForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex max-w-2xl flex-col gap-5 rounded-xl border bg-card p-5"
      action={(formData) => {
        setError(null);
        start(async () => {
          const result = await createLead(formData);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          toast.success("Lead added");
          router.push(`${redirectTo}?lead=${result.data.id}`);
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="full_name">
          <Input id="full_name" name="full_name" required autoFocus />
        </Field>
        <Field label="Phone" htmlFor="phone" hint="10 digits.">
          <Input id="phone" name="phone" inputMode="numeric" required />
        </Field>
        <Field label="Alternate phone" htmlFor="alt_phone">
          <Input id="alt_phone" name="alt_phone" inputMode="numeric" />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" />
        </Field>
        <Field label="College" htmlFor="college_name">
          <Input id="college_name" name="college_name" />
        </Field>
        <Field label="Degree" htmlFor="degree">
          <Input id="degree" name="degree" />
        </Field>
        <Field label="Branch" htmlFor="branch">
          <Input id="branch" name="branch" />
        </Field>
        <Field label="Year of study" htmlFor="current_year">
          <Input id="current_year" name="current_year" inputMode="numeric" />
        </Field>
        <Field label="City" htmlFor="city">
          <Input id="city" name="city" />
        </Field>
        <Field label="State" htmlFor="state">
          <Input id="state" name="state" />
        </Field>
      </div>
      <Field label="Course they asked about" htmlFor="interested_course_text">
        <Input id="interested_course_text" name="interested_course_text" />
      </Field>
      <Field label="Remarks" htmlFor="remarks">
        <Textarea id="remarks" name="remarks" rows={3} />
      </Field>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" loading={pending} className="self-start">
        Add lead
      </Button>
    </form>
  );
}
