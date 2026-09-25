"use server";

import { revalidatePath } from "next/cache";

import { getUser } from "@/lib/auth/get-user";
import { currentUserWithRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { enrollmentSchema, type EnrollmentInput } from "@/lib/validations/enrollment";
import { fullName } from "@/lib/utils";
import { firstError } from "@/lib/validations/common";
import type { AccessStatus, ActionResult, Json } from "@/types";

/** create_enrollment(): enrolment + installment plan + lead marked converted, in one call. */
export async function createEnrollment(input: EnrollmentInput): Promise<ActionResult<{ id: string }>> {
  const user = await currentUserWithRole(["admin", "employee"]);
  if (!user) return { ok: false, error: "Only staff can enrol students." };

  const parsed = enrollmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const v = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_enrollment", {
    p_user_id: v.user_id,
    p_course_id: v.course_id,
    p_plan: v.plan,
    p_total_amount: v.total_amount,
    p_installments: (v.plan === "partial" ? v.installments : []) as Json,
    ...(v.lead_id ? { p_lead_id: v.lead_id } : {}),
    p_source: user.roles.includes("admin") ? "admin" : "employee",
  });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "This student is already enrolled in this course." };
    return { ok: false, error: error.message };
  }
  revalidatePath("/admin/students");
  return { ok: true, data: { id: data.id } };
}

/** Admin switches access by hand: suspend, reactivate, mark refunded. */
export async function setAccessStatus(enrollmentId: string, status: AccessStatus): Promise<ActionResult> {
  const user = await currentUserWithRole("admin");
  if (!user) return { ok: false, error: "Only admins can change access." };
  const supabase = await createClient();
  const { error } = await supabase.from("enrollments").update({ access_status: status }).eq("id", enrollmentId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/enrollments/${enrollmentId}`);
  revalidatePath("/admin/students");
  return { ok: true, data: undefined };
}

export type CertificateIssue = {
  certificateNo: string;
  verifyToken: string;
  pdfPath: string;
  issuedAt: string;
  studentName: string;
  courseTitle: string;
  durationWeeks: number | null;
  verifyUrl: string;
};

/**
 * issue_certificate() assigns the number and token. The PDF is then built in
 * the browser and uploaded to certificates/<enrollment id>.pdf, the path we
 * record here so the student's download policy matches it.
 */
export async function issueCertificate(enrollmentId: string): Promise<ActionResult<CertificateIssue>> {
  const user = await currentUserWithRole("admin");
  if (!user) return { ok: false, error: "Only admins can issue certificates." };
  const supabase = await createClient();

  const pdfPath = `${enrollmentId}.pdf`;
  const { data: cert, error } = await supabase.rpc("issue_certificate", { p_enrollment_id: enrollmentId, p_pdf_path: pdfPath });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "A certificate has already been issued for this enrolment." };
    return { ok: false, error: error.message };
  }

  const [{ data: enr }, { data: setting }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("profile:profiles!enrollments_user_id_fkey(first_name, last_name), course:courses(title, duration_weeks)")
      .eq("id", enrollmentId)
      .single(),
    supabase.from("app_settings").select("value").eq("key", "certificates").maybeSingle(),
  ]);

  const base = ((setting?.value as { verify_base_url?: string } | null)?.verify_base_url ?? `${process.env.NEXT_PUBLIC_SITE_URL}/verify`).replace(/\/$/, "");

  revalidatePath(`/admin/enrollments/${enrollmentId}`);
  return {
    ok: true,
    data: {
      certificateNo: cert.certificate_no,
      verifyToken: cert.verify_token,
      pdfPath,
      issuedAt: cert.issued_at,
      studentName: fullName(enr?.profile) || "Student",
      courseTitle: enr?.course?.title ?? "",
      durationWeeks: enr?.course?.duration_weeks ?? null,
      verifyUrl: `${base}/${cert.verify_token}`,
    },
  };
}

/** Student ticks a lesson complete. RLS only allows it for courses with active access. */
export async function markLessonComplete(lessonId: string, enrollmentId: string, completed: boolean): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Log in again to save progress." };
  const supabase = await createClient();
  const { error } = await supabase.from("progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      enrollment_id: enrollmentId,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      last_watched_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" },
  );
  if (error) return { ok: false, error: "Progress could not be saved. Your access may be paused." };
  revalidatePath("/dashboard", "layout");
  return { ok: true, data: undefined };
}

/** Records that the student opened a lesson, for "continue learning". Silent on failure. */
export async function touchLesson(lessonId: string, enrollmentId: string) {
  const user = await getUser();
  if (!user) return;
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("progress")
    .select("id")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (existing) {
    await supabase.from("progress").update({ last_watched_at: new Date().toISOString() }).eq("id", existing.id);
  } else {
    await supabase.from("progress").insert({ user_id: user.id, lesson_id: lessonId, enrollment_id: enrollmentId });
  }
}

/** Student search for the enrol dialog. */
export async function searchStudents(
  query: string,
): Promise<ActionResult<{ id: string; name: string; email: string; phone: string | null }[]>> {
  const user = await currentUserWithRole(["admin", "employee"]);
  if (!user) return { ok: false, error: "Only staff can search students." };
  const q = query.trim().replace(/[%,()]/g, "");
  if (q.length < 2) return { ok: true, data: [] };

  const supabase = await createClient();
  const { data: studentIds } = await supabase.from("user_roles").select("user_id").eq("role", "student");
  const ids = (studentIds ?? []).map((r) => r.user_id);
  if (ids.length === 0) return { ok: true, data: [] };

  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, phone")
    .in("id", ids)
    .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
    .limit(10);
  if (error) return { ok: false, error: error.message };
  return {
    ok: true,
    data: (data ?? []).map((p) => ({ id: p.id, name: fullName(p) || p.email, email: p.email, phone: p.phone })),
  };
}
