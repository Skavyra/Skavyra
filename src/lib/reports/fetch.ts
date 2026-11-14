import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { fullName } from "@/lib/utils";
import type { Database, LeadStatus } from "@/types";

import type { ActivityIn, CourseIn, EmployeeIn, EnrollmentIn, LeadIn, PaymentIn, StudentIn } from "./compute";

const PAGE = 1000;

/** Supabase returns at most 1000 rows a call, so read page by page until a short page comes back. */
async function all<T>(page: (from: number, to: number) => PromiseLike<{ data: T[] | null }>): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data } = await page(from, from + PAGE - 1);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

/**
 * Everything the reports need. Row level security decides what each role may read; admin and HR can read all of
 * it. Activities are limited to the last ~13 months unless the report is "All time".
 */
export async function fetchReportData(supabase: SupabaseClient<Database>, allTime: boolean) {
  const since = new Date();
  since.setMonth(since.getMonth() - 13);
  const sinceIso = since.toISOString();

  const [leads, activities, payments, enrollments, coursesRes, employeesRes] = await Promise.all([
    all<LeadIn>((a, b) =>
      supabase
        .from("student_leads")
        .select("id, status, assigned_employee_id, assigned_at, created_at, last_contacted_at")
        .is("deleted_at", null)
        .order("created_at")
        .range(a, b) as unknown as PromiseLike<{ data: LeadIn[] | null }>,
    ),
    all<ActivityIn>((a, b) => {
      let q = supabase.from("lead_activities").select("lead_id, actor_id, action, old_status, new_status, created_at").order("created_at");
      if (!allTime) q = q.gte("created_at", sinceIso);
      return q.range(a, b) as unknown as PromiseLike<{ data: ActivityIn[] | null }>;
    }),
    all<PaymentIn>((a, b) =>
      supabase
        .from("payments")
        .select("amount, status, paid_at, created_at, lead_id, enrollment_id")
        .eq("status", "success")
        .order("created_at")
        .range(a, b) as unknown as PromiseLike<{ data: PaymentIn[] | null }>,
    ),
    all<EnrollmentIn>((a, b) =>
      supabase
        .from("enrollments")
        .select("id, user_id, course_id, lead_id, enrolled_by, total_amount, amount_paid, payment_status, created_at")
        .order("created_at")
        .range(a, b) as unknown as PromiseLike<{ data: EnrollmentIn[] | null }>,
    ),
    supabase.from("courses").select("id, title, price").order("sort_order"),
    supabase.from("employees").select("id, is_active, profile:profiles!employees_id_fkey(first_name, last_name)"),
  ]);

  const courses: CourseIn[] = (coursesRes.data ?? []).map((c) => ({ id: c.id, title: c.title, price: Number(c.price) }));
  const employees: EmployeeIn[] = (employeesRes.data ?? []).map((e) => ({
    id: e.id,
    name: fullName(e.profile) || "Unnamed",
    active: e.is_active,
  }));

  // student names, for the per course lists
  const studentIds = [...new Set(enrollments.map((e) => e.user_id))];
  const students: StudentIn[] = [];
  for (let i = 0; i < studentIds.length; i += 200) {
    const { data } = await supabase.from("profiles").select("id, first_name, last_name, email").in("id", studentIds.slice(i, i + 200));
    for (const p of data ?? []) students.push({ id: p.id, name: fullName(p), email: p.email });
  }

  return { leads: leads as LeadIn[], activities: activities as (ActivityIn & { new_status: LeadStatus | null })[], payments, enrollments, courses, employees, students };
}
