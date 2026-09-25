"use server";

import { revalidatePath } from "next/cache";

import { currentUserWithRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { firstError, formToObject } from "@/lib/validations/common";
import { offerLetterSchema } from "@/lib/validations/offer-letter";
import type { ActionResult, Json, LetterStatus } from "@/types";

/** New or edited letter. The letter number (SKV/OL/2026/0001) comes from the insert trigger. */
export async function saveOfferLetter(letterId: string | null, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const user = await currentUserWithRole("admin");
  if (!user) return { ok: false, error: "Only admins can manage offer letters." };

  const parsed = offerLetterSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const values = { ...parsed.data, reporting_manager_id: parsed.data.reporting_manager_id || null };

  const supabase = await createClient();
  if (letterId) {
    const { error } = await supabase.from("offer_letters").update(values).eq("id", letterId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/offer-letters");
    return { ok: true, data: { id: letterId } };
  }

  const { data: template } = await supabase
    .from("offer_letter_templates")
    .select("id")
    .eq("is_active", true)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("offer_letters")
    .insert({ ...values, letter_no: "", template_id: template?.id ?? null, created_by: user.id, status: "draft" })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/offer-letters");
  return { ok: true, data: { id: data.id } };
}

export async function importOfferLetters(input: {
  fileName: string;
  sourceType: "csv" | "xlsx";
  mapping: Record<string, string>;
  detectedColumns: string[];
  rows: Record<string, string>[];
}): Promise<ActionResult<{ inserted: number; skipped: number }>> {
  const user = await currentUserWithRole("admin");
  if (!user) return { ok: false, error: "Only admins can import offer letters." };
  const supabase = await createClient();

  const { data: template } = await supabase
    .from("offer_letter_templates")
    .select("id")
    .eq("is_active", true)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase.rpc("import_offer_letters", {
    p_file_name: input.fileName,
    p_source_type: input.sourceType,
    p_column_mapping: input.mapping as Json,
    p_detected_columns: input.detectedColumns,
    p_rows: input.rows as Json,
    ...(template?.id ? { p_template_id: template.id } : {}),
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/offer-letters");
  const summary = data as { inserted: number; skipped: number };
  return { ok: true, data: { inserted: summary.inserted, skipped: summary.skipped } };
}

/** After the browser uploads the PDF to offer-letters/<id>.pdf. */
export async function markLetterGenerated(letterId: string, pdfPath: string): Promise<ActionResult> {
  const user = await currentUserWithRole("admin");
  if (!user) return { ok: false, error: "Only admins can generate letters." };
  const supabase = await createClient();
  const { data: current } = await supabase.from("offer_letters").select("status").eq("id", letterId).single();
  const keepStatus = current && ["sent", "accepted", "declined"].includes(current.status);
  const { error } = await supabase
    .from("offer_letters")
    .update({
      pdf_path: pdfPath,
      generated_at: new Date().toISOString(),
      generated_by: user.id,
      ...(keepStatus ? {} : { status: "generated" as const }),
    })
    .eq("id", letterId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/offer-letters");
  return { ok: true, data: undefined };
}

export async function setLetterStatus(letterId: string, status: LetterStatus): Promise<ActionResult> {
  const user = await currentUserWithRole("admin");
  if (!user) return { ok: false, error: "Only admins can update letters." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("offer_letters")
    .update({ status, ...(status === "sent" ? { sent_at: new Date().toISOString() } : {}) })
    .eq("id", letterId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/offer-letters");
  return { ok: true, data: undefined };
}
