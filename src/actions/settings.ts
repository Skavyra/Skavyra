"use server";

import { revalidatePath } from "next/cache";

import { currentUserWithRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult, Json } from "@/types";

const KEYS = ["company", "payments", "certificates"] as const;

/** app_settings rows seeded by the SQL: company, payments, certificates. */
export async function saveSetting(key: (typeof KEYS)[number], formData: FormData): Promise<ActionResult> {
  const user = await currentUserWithRole("admin");
  if (!user) return { ok: false, error: "Only admins can change settings." };
  if (!KEYS.includes(key)) return { ok: false, error: "Unknown setting." };

  const value: Record<string, string> = {};
  formData.forEach((v, k) => {
    if (typeof v === "string") value[k] = v.trim();
  });

  const supabase = await createClient();
  const { data: existing } = await supabase.from("app_settings").select("value").eq("key", key).maybeSingle();
  const merged = { ...((existing?.value as Record<string, Json>) ?? {}), ...value };

  const { error } = await supabase
    .from("app_settings")
    .upsert({ key, value: merged, updated_by: user.id, updated_at: new Date().toISOString() });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/settings");
  return { ok: true, data: undefined };
}

/**
 * Saving the offer letter template creates a new version and makes it the
 * active one, so letters already generated keep pointing at their version.
 */
export async function saveLetterTemplate(input: {
  name: string;
  intro: string;
  clauses: string[];
  closing: string;
}): Promise<ActionResult<{ version: number }>> {
  const user = await currentUserWithRole("admin");
  if (!user) return { ok: false, error: "Only admins can change the template." };
  const clauses = input.clauses.map((c) => c.trim()).filter(Boolean);
  if (clauses.length === 0) return { ok: false, error: "Add at least one clause." };

  const supabase = await createClient();
  const { data: latest } = await supabase
    .from("offer_letter_templates")
    .select("version")
    .eq("name", input.name)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  const version = (latest?.version ?? 0) + 1;

  const { error: offErr } = await supabase.from("offer_letter_templates").update({ is_active: false }).eq("is_active", true);
  if (offErr) return { ok: false, error: offErr.message };

  const { error } = await supabase.from("offer_letter_templates").insert({
    name: input.name,
    version,
    is_active: true,
    created_by: user.id,
    body: { intro: input.intro.trim(), clauses, closing: input.closing.trim() },
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/settings");
  return { ok: true, data: { version } };
}
