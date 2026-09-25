"use server";

import { revalidatePath } from "next/cache";

import { getUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { firstError, formToObject } from "@/lib/validations/common";
import { passwordSchema, profileSchema } from "@/lib/validations/profile";
import type { ActionResult } from "@/types";

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Log in again to save your profile." };

  const parsed = profileSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ ...parsed.data, profile_completed: true })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard", "layout");
  return { ok: true, data: undefined };
}

export async function changePassword(formData: FormData): Promise<ActionResult> {
  const parsed = passwordSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: undefined };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
