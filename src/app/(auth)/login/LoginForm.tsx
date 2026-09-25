"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
    });
    if (authError) {
      setError(authError.message.toLowerCase().includes("invalid") ? "That email and password do not match." : authError.message);
      setPending(false);
      return;
    }
    // middleware sends each role to its own home
    router.push(next || "/dashboard");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-fluid-2xl">Log in</h1>
        <p className="mt-2 text-sm text-muted-foreground">Welcome back. Pick up where you left off.</p>
      </div>

      <GoogleButton next={next} label="Continue with Google" />

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
          <p role="alert" className="text-sm font-medium text-destructive">
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
