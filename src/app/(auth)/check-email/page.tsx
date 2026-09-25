import type { Metadata } from "next";

import { CheckEmail } from "./CheckEmail";

export const metadata: Metadata = { title: "Check your email" };

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; mode?: string }>;
}) {
  const { email, mode } = await searchParams;
  return <CheckEmail email={email ?? ""} mode={mode === "reset" ? "reset" : "signup"} />;
}
