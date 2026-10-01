"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { GoogleButton } from "@/components/marketing/GoogleButton";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const NOTICES: Record<string, string> = {
  inactive: "This account has been switched off. Contact Skavyra if you think that is a mistake.",
  callback: "That sign-in link did not work. Request a new one.",
  reset: "Your password has been changed. Log in with the new one.",
};

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(notice ? (NOTICES[notice] ?? null) : null);
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);

  async function onSubmit(formData: FormData) {
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: String(formData.get("email") ?? "").trim(),
        password: String(formData.get("password") ?? ""),
      });
      if (authError) {
        const message = authError.message.toLowerCase();
        setError(message.includes("invalid") || message.includes("credentials")
          ? "That email and password do not match. Check them and try again."
          : message.includes("confirm") || message.includes("verified")
            ? "Confirm your email before signing in. Check your inbox for the confirmation link."
            : message.includes("network") || message.includes("fetch")
              ? "We couldn’t reach the sign-in service. Check your connection and try again."
              : "We couldn’t sign you in. Please try again.");
        return;
      }
      // middleware sends each role to its own home
      router.push(next || "/dashboard");
      router.refresh();
    } catch {
      setError("We couldn’t reach the sign-in service. Check your connection and try again.");
    } finally {
      setPending(false);
      submitting.current = false;
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-fluid-2xl">Log in</h1>
        <p className="mt-2 text-sm text-muted-foreground">Welcome back. Pick up where you left off.</p>
      </div>

      <GoogleButton next={next} label="Continue with Google" />

      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>

      <form action={onSubmit} className="flex flex-col gap-4">
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </Field>
        {error && (
          <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-3.5 py-3 text-sm font-medium leading-relaxed text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" loading={pending}>
          Log in
        </Button>
      </form>

      <div className="flex flex-col gap-2 text-sm">
        <Link href="/forgot-password" className="font-semibold text-gold-700 hover:underline">
          Forgot your password?
        </Link>
        <p className="text-muted-foreground">
          New to Skavyra?{" "}
          <Link
            href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}
            className="font-semibold text-foreground hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
