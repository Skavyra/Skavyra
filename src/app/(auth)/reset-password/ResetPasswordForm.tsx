"use client";

import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
        <h1>This link has expired</h1>
        <p className="text-base text-muted-foreground">Reset links work once and last one hour. Request a new one.</p>
        <Link className="btn btn--ink btn--lg" href="/forgot-password">Send a new link <ArrowRight className="ic" strokeWidth={1.75} /></Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1>Set a new password</h1>
        <p className="mt-2 text-base text-muted-foreground">Choose something you have not used here before.</p>
      </div>
      <form action={onSubmit} className="flex flex-col gap-4">
        <label className="field" htmlFor="password">New password<small>At least 8 characters.</small><span className="pw"><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required /><button type="button" aria-label="Show password" onClick={() => setShowPassword((shown) => !shown)}>{showPassword ? <EyeOff className="ic" strokeWidth={1.75} /> : <Eye className="ic" strokeWidth={1.75} />}</button></span></label>
        <label className="field" htmlFor="confirm">Confirm new password<span className="pw"><input id="confirm" name="confirm" type={showConfirm ? "text" : "password"} autoComplete="new-password" required /><button type="button" aria-label="Show password" onClick={() => setShowConfirm((shown) => !shown)}>{showConfirm ? <EyeOff className="ic" strokeWidth={1.75} /> : <Eye className="ic" strokeWidth={1.75} />}</button></span></label>
        {error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}
        <button className="btn btn--ink btn--block btn--lg" type="submit" disabled={pending || ready === null}>Save new password <ArrowRight className="ic" strokeWidth={1.75} /></button>
      </form>
    </div>
  );
}
