import type { Metadata } from "next";

import { SignupForm } from "./SignupForm";
import { safeNextPath } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <SignupForm next={safeNextPath(next)} />;
}
