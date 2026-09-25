"use server";

import { revalidatePath } from "next/cache";

import { currentUserWithRole } from "@/lib/auth/require-role";
import { BUCKETS } from "@/lib/constants";
import { chunk } from "@/lib/excel/dedupe";
import { createClient } from "@/lib/supabase/server";
import { firstError, formToObject } from "@/lib/validations/common";
import { leadCreateSchema, leadUpdateSchema, paymentProofSchema } from "@/lib/validations/lead";
import { fullName, normalizePhone } from "@/lib/utils";
import type { ActionResult, Json } from "@/types";

function revalidateLeads() {
  revalidatePath("/employee", "layout");
  revalidatePath("/admin", "layout");
}

/** Friendly message for the live-phone unique index, naming who already has the lead. */
async function duplicateMessage(phone: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("find_lead_owner", { p_phone: phone }).maybeSingle();
  if (!data) return "This phone number is already a lead.";
  const owner = fullName({ first_name: data.assignee_first_name, last_name: data.assignee_last_name });
  return owner
    ? `${data.full_name} is already a lead, assigned to ${owner}.`
    : `${data.full_name} is already a lead and waiting to be assigned.`;
}

/**
 * Add lead. An employee's lead is assigned to themselves (the RLS insert
 * policy requires it). An admin's lead stays unassigned until distributed.
 */
export async function createLead(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const user = await currentUserWithRole(["admin", "employee"]);
  if (!user) return { ok: false, error: "Only staff can add leads." };

  const parsed = leadCreateSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  const isAdmin = user.roles.includes("admin");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("student_leads")
    .insert({
      ...parsed.data,
      source: "manual",
      created_by: user.id,
      assigned_employee_id: isAdmin ? null : user.id,
      assigned_at: isAdmin ? null : new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      const isEmail = error.message.includes("email");
      return { ok: false, error: isEmail ? "This email is already on another lead." : await duplicateMessage(parsed.data.phone) };
    }
    return { ok: false, error: error.message };
  }
  revalidateLeads();
  return { ok: true, data: { id: data.id } };
}

/**
 * Save from the lead detail screen. Status changes are logged by the
 * lead_activity_trg trigger; saves without a status change add a "note"
 * activity here, so every save leaves a row in the history.
 */
export async function updateLead(leadId: string, formData: FormData, courseIds: string[]): Promise<ActionResult> {
  const user = await currentUserWithRole(["admin", "employee"]);
  if (!user) return { ok: false, error: "Only staff can update leads." };

  const parsed = leadUpdateSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  const supabase = await createClient();
  const { data: current, error: readErr } = await supabase
    .from("student_leads")
    .select("status, attempts_count")
    .eq("id", leadId)
    .single();
  if (readErr || !current) return { ok: false, error: "This lead is not in your list." };

  const statusChanged = current.status !== parsed.data.status;
  const contacted = parsed.data.status !== "new";

  const { follow_up_on, ...rest } = parsed.data;
  const { error } = await supabase
    .from("student_leads")
    .update({
      ...rest,
      follow_up_on: follow_up_on ? new Date(follow_up_on).toISOString() : null,
      ...(contacted ? { last_contacted_at: new Date().toISOString(), attempts_count: current.attempts_count + 1 } : {}),
    })
    .eq("id", leadId);
  if (error) {
    if (error.code === "23505") return { ok: false, error: await duplicateMessage(parsed.data.phone) };
    return { ok: false, error: error.message };
  }

  if (!statusChanged) {
    await supabase.from("lead_activities").insert({
      lead_id: leadId,
      actor_id: user.id,
      action: "updated",
      notes: parsed.data.remarks ?? null,
    });
  }

  // courses of interest: replace the set
  await supabase.from("lead_courses").delete().eq("lead_id", leadId);
  if (courseIds.length > 0) {
    const { error: lcErr } = await supabase
      .from("lead_courses")
      .insert(courseIds.map((course_id) => ({ lead_id: leadId, course_id })));
    if (lcErr) return { ok: false, error: `Saved, but courses of interest failed: ${lcErr.message}` };
  }

  revalidateLeads();
  return { ok: true, data: undefined };
}

/** Admin only: change who owns one lead. */
export async function reassignLead(leadId: string, employeeId: string | null): Promise<ActionResult> {
  const user = await currentUserWithRole("admin");
  if (!user) return { ok: false, error: "Only admins can reassign leads." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("student_leads")
    .update({
      assigned_employee_id: employeeId,
      assigned_by: employeeId ? user.id : null,
      assigned_at: employeeId ? new Date().toISOString() : null,
    })
    .eq("id", leadId);
  if (error) return { ok: false, error: error.message };
  revalidateLeads();
  return { ok: true, data: undefined };
}

/** Counsellor logs an offline UPI payment. Saved as pending; an admin verifies it. */
export async function uploadPaymentProof(leadId: string, formData: FormData): Promise<ActionResult> {
  const user = await currentUserWithRole(["admin", "employee"]);
  if (!user) return { ok: false, error: "Only staff can log payments." };

  const parsed = paymentProofSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  const file = formData.get("proof");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Attach the payment screenshot." };
  if (file.size > 10 * 1024 * 1024) return { ok: false, error: "The screenshot must be under 10 MB." };

  const supabase = await createClient();
  const { data: lead } = await supabase
    .from("student_leads")
    .select("id, status, converted_enrollment_id")
    .eq("id", leadId)
    .single();
  if (!lead) return { ok: false, error: "This lead is not in your list." };
  if (!["interested", "enrolled"].includes(lead.status)) {
    return { ok: false, error: "Set the status to Interested or Enrolled before logging a payment." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${leadId}/${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage.from(BUCKETS.paymentProofs).upload(path, file, {
    contentType: file.type || undefined,
  });
  if (upErr) return { ok: false, error: `Upload failed: ${upErr.message}` };

  let enrollment: { id: string; user_id: string } | null = null;
  if (lead.converted_enrollment_id) {
    const { data } = await supabase.from("enrollments").select("id, user_id").eq("id", lead.converted_enrollment_id).maybeSingle();
    enrollment = data;
  }

  const { error } = await supabase.from("payments").insert({
    lead_id: leadId,
    enrollment_id: enrollment?.id ?? null,
    user_id: enrollment?.user_id ?? null,
    amount: parsed.data.amount,
    purpose: parsed.data.purpose,
    provider: "manual_upi",
    status: "pending",
    method: "upi",
    transaction_ref: parsed.data.transaction_ref,
    proof_path: path,
    created_by: user.id,
  });
  if (error) return { ok: false, error: error.message };

  revalidateLeads();
  revalidatePath("/admin/payments");
  return { ok: true, data: undefined };
}

/** Round-robin split across the chosen counsellors, via assign_leads(). */
export async function assignLeads(leadIds: string[], employeeIds: string[]): Promise<ActionResult<{ count: number }>> {
  const user = await currentUserWithRole("admin");
  if (!user) return { ok: false, error: "Only admins can assign leads." };
  if (leadIds.length === 0) return { ok: false, error: "Select at least one lead." };
  if (employeeIds.length === 0) return { ok: false, error: "Pick at least one counsellor." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("assign_leads", { p_lead_ids: leadIds, p_employee_ids: employeeIds });
  if (error) return { ok: false, error: error.message };
  revalidateLeads();
  return { ok: true, data: { count: data ?? 0 } };
}

/** Existing live leads for a set of phones, for the red/amber preview. */
export async function findExistingPhones(
  phones: string[],
): Promise<ActionResult<{ phone: string; interested_course_text: string | null }[]>> {
  const user = await currentUserWithRole("admin");
  if (!user) return { ok: false, error: "Only admins can import leads." };
  const supabase = await createClient();
  const unique = Array.from(new Set(phones.map(normalizePhone).filter((p) => p.length === 10)));
  const found: { phone: string; interested_course_text: string | null }[] = [];
  for (const part of chunk(unique, 200)) {
    const { data, error } = await supabase
      .from("student_leads")
      .select("phone, interested_course_text")
      .in("phone", part)
      .is("deleted_at", null);
    if (error) return { ok: false, error: error.message };
    found.push(...(data ?? []));
  }
  return { ok: true, data: found };
}

export type ImportSummary = { batch_id: string; inserted: number; duplicates: number; skipped: number; lead_ids: string[] };

/** One transaction in import_leads(): batch row, dedupe, insert. */
export async function importLeads(input: {
  fileName: string;
  fileType: "csv" | "xlsx";
  mapping: Record<string, string>;
  detectedColumns: string[];
  rows: Record<string, string>[];
}): Promise<ActionResult<ImportSummary>> {
  const user = await currentUserWithRole("admin");
  if (!user) return { ok: false, error: "Only admins can import leads." };
  if (input.rows.length === 0) return { ok: false, error: "There are no rows to import." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("import_leads", {
    p_file_name: input.fileName,
    p_file_type: input.fileType,
    p_column_mapping: input.mapping as Json,
    p_detected_columns: input.detectedColumns,
    p_rows: input.rows as Json,
  });
  if (error) return { ok: false, error: error.message };

  const summary = data as { batch_id: string; inserted: number; duplicates: number; skipped: number };
  const { data: ids } = await supabase.from("student_leads").select("id").eq("batch_id", summary.batch_id);

  revalidateLeads();
  return { ok: true, data: { ...summary, lead_ids: (ids ?? []).map((r) => r.id) } };
}

export async function softDeleteLead(leadId: string): Promise<ActionResult> {
  const user = await currentUserWithRole("admin");
  if (!user) return { ok: false, error: "Only admins can remove leads." };
  const supabase = await createClient();
  const { error } = await supabase.from("student_leads").update({ deleted_at: new Date().toISOString() }).eq("id", leadId);
  if (error) return { ok: false, error: error.message };
  revalidateLeads();
  return { ok: true, data: undefined };
}

