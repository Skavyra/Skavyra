"use client";

import { useState, useTransition } from "react";

import { changePassword, updateProfile } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import type { Profile } from "@/types";

export function ProfileForm({ profile, email }: { profile: Profile; email: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-5 rounded-xl border bg-card p-5"
      action={(formData) => {
        setError(null);
        start(async () => {
          const result = await updateProfile(formData);
          if (result.ok) toast.success("Profile saved");
          else setError(result.error);
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" htmlFor="first_name">
          <Input id="first_name" name="first_name" defaultValue={profile.first_name} required />
        </Field>
        <Field label="Last name" htmlFor="last_name">
          <Input id="last_name" name="last_name" defaultValue={profile.last_name} />
        </Field>
        <Field label="Email" htmlFor="email" hint="Contact Skavyra to change your email.">
          <Input id="email" value={email} disabled />
        </Field>
        <Field label="Mobile number" htmlFor="phone">
          <Input id="phone" name="phone" type="tel" inputMode="numeric" defaultValue={profile.phone ?? ""} />
        </Field>
        <Field label="College" htmlFor="college_name">
          <Input id="college_name" name="college_name" defaultValue={profile.college_name ?? ""} />
        </Field>
        <Field label="Degree" htmlFor="degree">
          <Input id="degree" name="degree" defaultValue={profile.degree ?? ""} />
        </Field>
        <Field label="Branch" htmlFor="branch">
          <Input id="branch" name="branch" defaultValue={profile.branch ?? ""} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Started" htmlFor="started_year">
            <Input id="started_year" name="started_year" inputMode="numeric" defaultValue={profile.started_year ?? ""} />
          </Field>
          <Field label="Passing out" htmlFor="passing_out_year">
            <Input id="passing_out_year" name="passing_out_year" inputMode="numeric" defaultValue={profile.passing_out_year ?? ""} />
          </Field>
        </div>
        <Field label="City" htmlFor="city">
          <Input id="city" name="city" defaultValue={profile.city ?? ""} />
        </Field>
        <Field label="State" htmlFor="state">
          <Input id="state" name="state" defaultValue={profile.state ?? ""} />
        </Field>
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" loading={pending} className="self-start">
        Save changes
      </Button>
    </form>
  );
}

export function PasswordForm() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex max-w-sm flex-col gap-4 rounded-xl border bg-card p-5"
      action={(formData) => {
        setError(null);
        start(async () => {
          const result = await changePassword(formData);
          if (result.ok) toast.success("Password changed");
          else setError(result.error);
        });
      }}
    >
      <h2 className="font-display text-base font-bold">Change password</h2>
      <Field label="New password" htmlFor="new_password" hint="At least 8 characters.">
        <Input id="new_password" name="password" type="password" autoComplete="new-password" required />
      </Field>
      <Field label="Confirm new password" htmlFor="confirm_password">
        <Input id="confirm_password" name="confirm" type="password" autoComplete="new-password" required />
      </Field>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" variant="outline" loading={pending} className="self-start">
        Change password
      </Button>
    </form>
  );
}
