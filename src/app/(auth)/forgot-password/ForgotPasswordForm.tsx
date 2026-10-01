"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);

  async function onSubmit(formData: FormData) {
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setError(null);
    try {
      const email = String(formData.get("email") ?? "").trim();
      const supabase = createClient();
      const callback = new URL("/auth/callback", window.location.origin);
      callback.searchParams.set("next", "/reset-password");
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: callback.toString(),
      });
      if (authError) {
        setError("We couldn’t send a password reset link. Check the address and try again.");
        return;
      }
      router.push(`/check-email?email=${encodeURIComponent(email)}&mode=reset`);
    } catch {
      setError("We couldn’t reach the password reset service. Check your connection and try again.");
    } finally {
      setPending(false);
      submitting.current = false;
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-fluid-2xl">Reset your password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the email you signed up with and we will send a link to set a new password.
        </p>
      </div>
      <form action={onSubmit} className="flex flex-col gap-4">
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        {error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" loading={pending}>
          Send reset link
        </Button>
      </form>
      <Link href="/login" className="text-sm font-semibold text-gold-700 hover:underline">
        Back to log in
      </Link>
    </div>
  );
}
