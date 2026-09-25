"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { saveOfferLetter } from "@/actions/offer-letters";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "@/hooks/use-toast";
import { toDateInput } from "@/lib/utils";
import type { OfferLetter } from "@/types";

export function LetterForm({
  letter,
  managers,
}: {
  letter: OfferLetter | null;
  managers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(formData: FormData, thenPreview: boolean) {
    setError(null);
    start(async () => {
      const result = await saveOfferLetter(letter?.id ?? null, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success("Letter saved");
      router.push(thenPreview ? `/admin/offer-letters?preview=${result.data.id}` : "/admin/offer-letters");
    });
  }

  return (
    <form className="flex max-w-3xl flex-col gap-5 rounded-xl border bg-card p-5" action={(fd) => submit(fd, false)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Candidate name" htmlFor="candidate_name">
          <Input id="candidate_name" name="candidate_name" defaultValue={letter?.candidate_name} required autoFocus />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" defaultValue={letter?.email} required />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input id="phone" name="phone" inputMode="numeric" defaultValue={letter?.phone ?? ""} />
        </Field>
        <Field label="Role" htmlFor="role_title">
          <Input id="role_title" name="role_title" defaultValue={letter?.role_title} required />
        </Field>
        <Field label="Department" htmlFor="department">
          <Input id="department" name="department" defaultValue={letter?.department ?? ""} />
        </Field>
        <Field label="Employment type" htmlFor="employment_type">
          <NativeSelect id="employment_type" name="employment_type" defaultValue={letter?.employment_type ?? "full_time"}>
            <option value="full_time">Full time</option>
            <option value="intern">Intern</option>
            <option value="contract">Contract</option>
          </NativeSelect>
        </Field>
        <Field label="Salary" htmlFor="ctc_amount">
          <Input id="ctc_amount" name="ctc_amount" inputMode="decimal" defaultValue={letter?.ctc_amount ?? ""} required />
        </Field>
        <Field label="Per" htmlFor="ctc_period">
          <NativeSelect id="ctc_period" name="ctc_period" defaultValue={letter?.ctc_period ?? "month"}>
            <option value="month">Month</option>
            <option value="year">Year</option>
            <option value="total">Total for the term</option>
          </NativeSelect>
        </Field>
        <Field label="Joining date" htmlFor="joining_date">
          <Input id="joining_date" name="joining_date" type="date" defaultValue={toDateInput(letter?.joining_date)} required />
        </Field>
        <Field label="Issue date" htmlFor="issue_date">
          <Input
            id="issue_date"
            name="issue_date"
            type="date"
            defaultValue={toDateInput(letter?.issue_date) || new Date().toISOString().slice(0, 10)}
            required
          />
        </Field>
        <Field label="Reporting manager" htmlFor="reporting_manager_id">
          <NativeSelect id="reporting_manager_id" name="reporting_manager_id" defaultValue={letter?.reporting_manager_id ?? ""}>
            <option value="">Not set</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Manager name on the letter" htmlFor="reporting_manager_name" hint="Used if the manager has no account.">
          <Input id="reporting_manager_name" name="reporting_manager_name" defaultValue={letter?.reporting_manager_name ?? ""} />
        </Field>
        <Field label="Work location" htmlFor="work_location" className="sm:col-span-2">
          <Input id="work_location" name="work_location" defaultValue={letter?.work_location ?? ""} />
        </Field>
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="outline" loading={pending}>
          Save draft
        </Button>
        <Button
          type="submit"
          loading={pending}
          formAction={(fd) => submit(fd, true)}
        >
          Save and preview
        </Button>
      </div>
    </form>
  );
}
