"use server";

import { revalidatePath } from "next/cache";

import { getUser } from "@/lib/auth/get-user";
import { currentUserWithRole } from "@/lib/auth/require-role";
import { callEdgeFunction } from "@/lib/edge";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types";

/**
 * Student "Pay" button. Goes through the simulate-payment edge function, which
 * settles via apply_payment(), the same path Razorpay will use later.
 */
export async function payNow(input: {
  enrollmentId: string;
  amount: number;
  installmentId?: string | null;
  purpose: "registration" | "installment" | "full" | "balance";
}): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Log in again to pay." };

  const result = await callEdgeFunction<{ status: string }>("simulate-payment", {
    enrollment_id: input.enrollmentId,
    amount: input.amount,
    installment_id: input.installmentId ?? undefined,
    purpose: input.purpose,
  });
  if (!result.ok) return result;
  if (result.data.status !== "success") return { ok: false, error: "The payment did not go through. Nothing was charged." };

  revalidatePath("/dashboard", "layout");
  return { ok: true, data: undefined };
}

/**
 * Admin verifies an offline UPI payment. apply_payment() checks is_admin()
 * itself, so this runs on the caller's own session, no service role needed.
 */
export async function verifyPayment(paymentId: string): Promise<ActionResult> {
  const user = await currentUserWithRole("admin");
  if (!user) return { ok: false, error: "Only admins can verify payments." };

  const supabase = await createClient();

  const { data: payment } = await supabase.from("payments").select("id, status").eq("id", paymentId).single();
  if (!payment) return { ok: false, error: "Payment not found." };
  if (payment.status === "success") return { ok: false, error: "This payment is already verified." };

  const { error } = await supabase.rpc("apply_payment", { p_payment_id: paymentId, p_method: "upi" });
  if (error) return { ok: false, error: error.message };

  await supabase.from("payments").update({ verified_by: user.id, verified_at: new Date().toISOString() }).eq("id", paymentId);

  revalidatePath("/admin/payments");
  revalidatePath("/admin/students");
  return { ok: true, data: undefined };
}

export async function rejectPayment(paymentId: string, reason: string): Promise<ActionResult> {
  const user = await currentUserWithRole("admin");
  if (!user) return { ok: false, error: "Only admins can reject payments." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("payments")
    .update({
      status: "failed",
      notes: reason.trim() || "Rejected during verification",
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    })
    .eq("id", paymentId)
    .neq("status", "success");
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/payments");
  return { ok: true, data: undefined };
}

/** Link an offline payment logged against a lead to that student's enrolment, before verifying. */
export async function linkPaymentToEnrollment(paymentId: string, enrollmentId: string): Promise<ActionResult> {
  const user = await currentUserWithRole("admin");
  if (!user) return { ok: false, error: "Only admins can edit payments." };
  const supabase = await createClient();
  const { data: enr } = await supabase.from("enrollments").select("id, user_id").eq("id", enrollmentId).single();
  if (!enr) return { ok: false, error: "Enrolment not found." };
  const { error } = await supabase
    .from("payments")
    .update({ enrollment_id: enr.id, user_id: enr.user_id })
    .eq("id", paymentId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/payments");
  return { ok: true, data: undefined };
}
