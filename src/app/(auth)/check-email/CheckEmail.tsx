"use client";

import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/** The resend button waits 60 seconds, which is also Supabase's own rate limit. */
export function CheckEmail({ email, mode }: { email: string; mode: "signup" | "reset" }) {
  const [seconds, setSeconds] = useState(60);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  async function resend() {
    if (!email) return;
    setPending(true);
    setMessage(null);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback${mode === "reset" ? "?next=/reset-password" : ""}`;
    const { error } =
      mode === "reset"
        ? await supabase.auth.resetPasswordForEmail(email, { redirectTo })
        : await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: redirectTo } });
    setMessage(error ? error.message : "Sent. Check your inbox again in a moment.");
    setSeconds(60);
    setPending(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <span className="grid size-12 place-items-center rounded-xl bg-gold-100/50">
        <MailCheck className="size-6 text-gold-700" />
      </span>
      <div>
        <h1 className="text-fluid-2xl">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "reset" ? "We sent a link to set a new password" : "We sent a link to confirm your account"}
          {email ? ` to ${email}` : ""}. Open it on this device to continue.
        </p>
      </div>

      {email && (
        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={resend} disabled={seconds > 0} loading={pending}>
            {seconds > 0 ? `Resend link in ${seconds}s` : "Resend link"}
          </Button>
          {message && <p className="text-xs text-muted-foreground">{message}</p>}
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Wrong address?{" "}
        <Link href={mode === "reset" ? "/forgot-password" : "/signup"} className="font-semibold text-foreground hover:underline">
          Start again
        </Link>
      </p>
    </div>
  );
}
