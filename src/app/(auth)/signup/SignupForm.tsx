"use client";

import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { GoogleButton } from "@/components/marketing/GoogleButton";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";
import { normalizePhone } from "@/lib/utils";
import { safeNextPath } from "@/lib/auth/redirect";

const GOOGLE_LOGIN_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_LOGIN === "on";

/**
 * Signs up with email and password. The handle_new_user trigger creates the
 * profile from this metadata and gives the student role.
 */
export function SignupForm({ next }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const submitting = useRef(false);

  async function onSubmit(formData: FormData) {
    if (submitting.current) return;
    setError(null);
    if (!agreed) {
      setError("Tick the box to accept the terms and privacy policy.");
      return;
    }
    const password = String(formData.get("password") ?? "");
    if (password.length < 8) {
      setError("Use a password of at least 8 characters.");
      return;
    }
    const phone = normalizePhone(String(formData.get("phone") ?? ""));
    if (phone.length !== 10) {
      setError("Enter a 10 digit mobile number.");
      return;
    }

    submitting.current = true;
    setPending(true);
    const email = String(formData.get("email") ?? "").trim();
    try {
      const supabase = createClient();
      const redirect = new URL("/auth/callback", window.location.origin);
      if (next) redirect.searchParams.set("next", next);

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirect.toString(),
          data: {
            first_name: String(formData.get("first_name") ?? "").trim(),
            last_name: String(formData.get("last_name") ?? "").trim(),
            phone,
          },
        },
      });

      if (authError) {
        const message = authError.message.toLowerCase();
        setError(message.includes("already registered") || message.includes("already exists")
          ? "An account with this email already exists. Log in instead."
          : message.includes("password")
            ? "That password doesn’t meet the account requirements. Use at least 8 characters and try again."
            : message.includes("email")
              ? "Check the email address and try again."
              : message.includes("network") || message.includes("fetch")
                ? "We couldn’t reach the sign-up service. Check your connection and try again."
                : "We couldn’t create your account. Please try again.");
        return;
      }

      // A session means email confirmation is switched off, so go straight in.
      if (data.session) {
        router.push(next || "/dashboard");
        router.refresh();
        return;
      }

      const checkEmail = new URLSearchParams({ email });
      if (next) checkEmail.set("next", safeNextPath(next) ?? "");
      router.push(`/check-email?${checkEmail.toString()}`);
    } catch {
      setError("We couldn’t reach the sign-up service. Check your connection and try again.");
    } finally {
      setPending(false);
      submitting.current = false;
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1>Create your account</h1>
        <p className="mt-2 text-base text-muted-foreground">One account for your courses, payments and certificates.</p>
      </div>

      {GOOGLE_LOGIN_ENABLED && (
        <>
          <GoogleButton next={next} label="Sign up with Google" />

          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      <form action={onSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field" htmlFor="first_name">First name<input id="first_name" name="first_name" autoComplete="given-name" required /></label>
          <label className="field" htmlFor="last_name">Last name<input id="last_name" name="last_name" autoComplete="family-name" /></label>
        </div>
        <label className="field" htmlFor="email">Email<input id="email" name="email" type="email" autoComplete="email" required /></label>
        <label className="field" htmlFor="phone">Mobile number<small>Your counsellor uses this to reach you.</small><input id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" required /></label>
        <label className="field" htmlFor="password">Password<small>At least 8 characters.</small><span className="pw"><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required /><button type="button" aria-label="Show password" onClick={() => setShowPassword((shown) => !shown)}>{showPassword ? <EyeOff className="ic" strokeWidth={1.75} /> : <Eye className="ic" strokeWidth={1.75} />}</button></span></label>

        <label className="flex items-start gap-3 rounded-xl border border-ink/10 bg-background/60 p-3.5 text-sm">
          <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} className="mt-0.5" />
          <span className="text-muted-foreground">
            I accept the{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              privacy policy
            </Link>
            .
          </span>
        </label>

        {error && (
          <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-3.5 py-3 text-sm font-medium leading-relaxed text-destructive">
            {error}
          </p>
        )}
        <button className="btn btn--ink btn--block btn--lg" type="submit" disabled={pending}>Create account <ArrowRight className="ic" strokeWidth={1.75} /></button>
      </form>

      <p className="auth__alt">
        Already have an account?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="alink">
          Log in
        </Link>
      </p>
    </div>
  );
}
