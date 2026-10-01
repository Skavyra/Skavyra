import type { Metadata } from "next";

import { SignupForm } from "./SignupForm";
import { safeNextPath } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Create an account" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <SignupForm next={safeNextPath(next)} />;
}
