import "server-only";

import { redirect } from "next/navigation";

import { ROLE_HOME } from "@/lib/constants";
import type { AppRole, SessionUser } from "@/types";

import { getUser, primaryRole } from "./get-user";

/**
 * Used at the top of every panel layout and server action.
 * Signed out -> /login. Wrong role -> that user's own home.
 * The database enforces the same rules through RLS; this keeps the UI honest.
 */
export async function requireRole(role: AppRole | AppRole[], next?: string): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  // A former employee may have no remaining panel role.
  if (user.roles.length === 0) redirect("/");

  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.some((r) => user.roles.includes(r))) redirect(ROLE_HOME[primaryRole(user.roles)]);

  if (user.profile && !user.profile.is_active) redirect("/login?error=inactive");
  return user;
}

/** For server actions: returns null instead of redirecting. */
export async function currentUserWithRole(role: AppRole | AppRole[]) {
  const user = await getUser();
  if (!user) return null;
  const allowed = Array.isArray(role) ? role : [role];
  return allowed.some((r) => user.roles.includes(r)) ? user : null;
}
