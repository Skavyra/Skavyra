import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { AppRole, SessionUser } from "@/types";

/** Current user with roles and profile. Cached per request. */
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: roles }, { data: profile }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", user.id),
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
  ]);

  return {
    id: user.id,
    email: user.email ?? "",
    roles: (roles ?? []).map((r) => r.role as AppRole),
    profile: profile ?? null,
  };
});

export function primaryRole(roles: AppRole[]): AppRole {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("employee")) return "employee";
  return "student";
}
