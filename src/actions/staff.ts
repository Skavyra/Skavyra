"use server";

import { revalidatePath } from "next/cache";

import { dbError } from "@/lib/errors";

import { currentUserWithRole } from "@/lib/auth/require-role";
import { callEdgeFunction } from "@/lib/edge";
import { createClient } from "@/lib/supabase/server";
import { firstError, formToObject, optionalPhone, optionalText } from "@/lib/validations/common";
import { createStaffSchema } from "@/lib/validations/staff";
import type { ActionResult } from "@/types";
import { z } from "zod";

const MANAGERS = ["admin", "hr"] as const;

/** HR may not act on admins or other HR users. The database enforces it too; this gives a readable error first. */
async function hrBlockedTarget(actorRoles: string[], targetId: string): Promise<boolean> {
  if (actorRoles.includes("admin")) return false;
  const supabase = await createClient();
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", targetId);
  return (data ?? []).some((r) => r.role === "admin" || r.role === "hr");
}

/** Creates the login through the create-user edge function (Admin API, service role). */
export async function createUserAccount(
  formData: FormData,
): Promise<ActionResult<{ user_id: string; invited: boolean; employee_code?: string }>> {
  const user = await currentUserWithRole([...MANAGERS]);
  if (!user) return { ok: false, error: "Only admins and HR can create accounts." };

  const parsed = createStaffSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  if (!user.roles.includes("admin") && parsed.data.role !== "employee") {
    return { ok: false, error: "HR can only create counsellor accounts." };
  }

  const body = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== null && v !== undefined && v !== ""));
  const result = await callEdgeFunction<{ user_id: string; invited: boolean; employee_code?: string }>("create-user", body);
  if (!result.ok) return result;

  revalidatePath("/admin/employees");
  revalidatePath("/admin/students");
  revalidatePath("/hr/employees");
  return { ok: true, data: result.data };
}

const employeeUpdateSchema = z.object({
  first_name: z.string().trim().min(1, "Enter a first name"),
  last_name: z.string().trim(),
  phone: optionalPhone,
  designation: optionalText,
  department: optionalText,
  employee_code: optionalText,
  date_of_joining: optionalText,
  employment_type: z.enum(["intern", "full_time", "contract"]),
  reporting_manager_id: z.string().uuid().nullable().optional().or(z.literal("").transform(() => null)),
});

export async function updateEmployee(employeeId: string, formData: FormData): Promise<ActionResult> {
  const user = await currentUserWithRole([...MANAGERS]);
  if (!user) return { ok: false, error: "Only admins and HR can edit employees." };
  if (await hrBlockedTarget(user.roles, employeeId)) return { ok: false, error: "HR cannot edit admin or HR accounts." };

  const parsed = employeeUpdateSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const { first_name, last_name, phone, ...emp } = parsed.data;

  const supabase = await createClient();
  const { error: pErr } = await supabase.from("profiles").update({ first_name, last_name, phone }).eq("id", employeeId);
  if (pErr) return { ok: false, error: dbError(pErr) };
  const { error: eErr } = await supabase.from("employees").update(emp).eq("id", employeeId);
  if (eErr) return { ok: false, error: eErr.code === "23505" ? "That employee code is already in use." : dbError(eErr) };

  revalidatePath("/admin/employees");
  revalidatePath("/hr/employees");
  return { ok: true, data: undefined };
}

/** Deactivate via the edge function; open leads move to reassignTo. */
export async function deactivateStaff(
  userId: string,
  reassignTo: string | null,
  ban: boolean,
): Promise<ActionResult<{ leads_moved: number }>> {
  const user = await currentUserWithRole([...MANAGERS]);
  if (!user) return { ok: false, error: "Only admins and HR can deactivate staff." };
  if (userId === user.id) return { ok: false, error: "You cannot deactivate your own account." };
  if (await hrBlockedTarget(user.roles, userId)) return { ok: false, error: "HR cannot deactivate admin or HR accounts." };

  const result = await callEdgeFunction<{ leads_moved: number }>("deactivate-staff", {
    user_id: userId,
    reassign_to: reassignTo,
    ban,
  });
  if (!result.ok) return result;

  revalidatePath("/admin", "layout");
  revalidatePath("/hr", "layout");
  return { ok: true, data: { leads_moved: Number(result.data.leads_moved ?? 0) } };
}

/** Removes staff membership through one audited database transaction. */
export async function removeEmployee(userId: string, reassignTo: string | null): Promise<ActionResult> {
  const user = await currentUserWithRole(["admin"]);
  if (!user || !user.profile?.is_active) return { ok: false, error: "Only active admins can remove employees." };
  if (!z.string().uuid().safeParse(userId).success || (reassignTo !== null && !z.string().uuid().safeParse(reassignTo).success)) {
    return { ok: false, error: "Invalid employee selection." };
  }
  if (userId === user.id) return { ok: false, error: "You cannot remove your own account." };
  if (await hrBlockedTarget(user.roles, userId)) return { ok: false, error: "HR cannot remove admin or HR accounts." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("remove_employee", { p_user_id: userId, ...(reassignTo ? { p_reassign_to: reassignTo } : {}) });
  if (error) return { ok: false, error: dbError(error) };
  revalidatePath("/admin", "layout");
  revalidatePath("/hr", "layout");
  revalidatePath("/employee", "layout");
  return { ok: true, data: undefined };
}

/**
 * Switch a deactivated employee back on and lift any login ban. Goes through the edge function because only it can
 * unban. An edge function deployed before this change ignores `action` and would deactivate instead, so the reply is checked.
 */
export async function reactivateStaff(userId: string): Promise<ActionResult> {
  const user = await currentUserWithRole([...MANAGERS]);
  if (!user) return { ok: false, error: "Only admins and HR can reactivate staff." };
  if (await hrBlockedTarget(user.roles, userId)) return { ok: false, error: "HR cannot reactivate admin or HR accounts." };

  const result = await callEdgeFunction<{ reactivated?: boolean }>("deactivate-staff", { action: "reactivate", user_id: userId });
  if (!result.ok) return result;
  if (!result.data.reactivated) return { ok: false, error: "The deactivate-staff function needs redeploying before Reactivate can work." };

  revalidatePath("/admin", "layout");
  revalidatePath("/hr", "layout");
  return { ok: true, data: undefined };
}
