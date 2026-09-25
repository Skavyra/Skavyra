"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { AppRole } from "@/types";

import { useUser } from "./use-user";

export function useRole() {
  const { user, loading: userLoading } = useUser();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }
    createClient()
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setRoles((data ?? []).map((r) => r.role));
        setLoading(false);
      });
  }, [user, userLoading]);

  return {
    roles,
    loading,
    isAdmin: roles.includes("admin"),
    isEmployee: roles.includes("employee"),
    isStudent: roles.includes("student"),
  };
}
