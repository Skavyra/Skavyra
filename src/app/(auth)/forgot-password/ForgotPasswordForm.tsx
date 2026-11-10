"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

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
        <h1>Reset your password</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Enter the email you signed up with and we will send a link to set a new password.
        </p>
      </div>
      <form action={onSubmit} className="flex flex-col gap-4">
        <label className="field" htmlFor="email">Email<input id="email" name="email" type="email" autoComplete="email" required /></label>
        {error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}
        <button className="btn btn--ink btn--block btn--lg" type="submit" disabled={pending}>Send reset link <ArrowRight className="ic" strokeWidth={1.75} /></button>
      </form>
      <p className="auth__row"><Link href="/login" className="alink">Back to log in</Link></p>
    </div>
  );
}
