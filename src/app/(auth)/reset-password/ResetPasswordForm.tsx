"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

/**
 * Reached from the email link, which the callback route turns into a session.
 * Without that session there is nothing to update, so we say so plainly.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setReady(Boolean(data.user)));
  }, []);

  async function onSubmit(formData: FormData) {
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");
    setError(null);
    if (password.length < 8) return setError("Use a password of at least 8 characters.");
    if (password !== confirm) return setError("The two passwords do not match.");

    setPending(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.updateUser({ password });
    if (authError) {
      setError(authError.message);
      setPending(false);
      return;
    }
    await supabase.auth.signOut();
    router.push("/login?error=reset");
  }

  if (ready === false) {
    return (
      <div className="flex flex-col gap-5">
        <h1 className="text-fluid-2xl">This link has expired</h1>
        <p className="text-sm text-muted-foreground">Reset links work once and last one hour. Request a new one.</p>
        <Button asChild size="lg" className="self-start">
          <Link href="/forgot-password">Send a new link</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-fluid-2xl">Set a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">Choose something you have not used here before.</p>
      </div>
      <form action={onSubmit} className="flex flex-col gap-4">
        <Field label="New password" htmlFor="password" hint="At least 8 characters.">
          <Input id="password" name="password" type="password" autoComplete="new-password" required />
        </Field>
        <Field label="Confirm new password" htmlFor="confirm">
          <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
        </Field>
        {error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" loading={pending} disabled={ready === null}>
          Save new password
        </Button>
      </form>
    </div>
  );
}
