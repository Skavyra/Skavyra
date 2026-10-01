import type { Metadata } from "next";

import { CheckEmail } from "./CheckEmail";
import { safeNextPath } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Check your email" };

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; mode?: string; next?: string }>;
}) {
  const { email, mode, next } = await searchParams;
  return <CheckEmail email={email ?? ""} mode={mode === "reset" ? "reset" : "signup"} next={safeNextPath(next)} />;
}
