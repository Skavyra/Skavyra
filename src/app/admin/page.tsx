import { BookOpen, GraduationCap, IndianRupee, PhoneCall, Users } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { LeadStatusBadge } from "@/components/dashboard/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { requireRole } from "@/lib/auth/require-role";
import { LEAD_STATUSES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { formatInr, fullName, percent } from "@/lib/utils";
import type { LeadStatus } from "@/types";

export default async function AdminDashboard() {
  await requireRole("admin");
  const supabase = await createClient();

  const [leadRows, employees, courses, payments, enrollments, unassigned] = await Promise.all([
    supabase.from("student_leads").select("status, assigned_employee_id, converted_enrollment_id").is("deleted_at", null),
    supabase.from("employees").select("id, is_active, profile:profiles!employees_id_fkey(first_name, last_name)").eq("is_active", true),
    supabase.from("courses").select("id, status"),
    supabase.from("payments").select("amount, status"),
    supabase.from("enrollments").select("id"),
    supabase.from("student_leads").select("id", { count: "exact", head: true }).is("deleted_at", null).is("assigned_employee_id", null),
  ]);

  const leads = leadRows.data ?? [];
  const counts = new Map<LeadStatus, number>();
  for (const l of leads) counts.set(l.status, (counts.get(l.status) ?? 0) + 1);

  const collected = (payments.data ?? []).filter((p) => p.status === "success").reduce((s, p) => s + Number(p.amount), 0);
  const awaiting = (payments.data ?? []).filter((p) => p.status === "pending").length;
  const published = (courses.data ?? []).filter((c) => c.status === "published").length;

  // top counsellors by converted leads
  const byEmployee = new Map<string, { assigned: number; enrolled: number }>();
  for (const l of leads) {
    if (!l.assigned_employee_id) continue;
    const row = byEmployee.get(l.assigned_employee_id) ?? { assigned: 0, enrolled: 0 };
    row.assigned += 1;
    if (l.converted_enrollment_id) row.enrolled += 1;
    byEmployee.set(l.assigned_employee_id, row);
  }
  const top = (employees.data ?? [])
    .map((e) => ({
      id: e.id,
      name: fullName(e.profile) || "Unnamed",
      ...(byEmployee.get(e.id) ?? { assigned: 0, enrolled: 0 }),
    }))
    .sort((a, b) => b.enrolled - a.enrolled || b.assigned - a.assigned)
    .slice(0, 5);

  return (
    <>
      <PageHeader title="Dashboard" description="Leads, courses and money across the business." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Leads" value={leads.length} icon={PhoneCall} href="/admin/leads" />
        <StatCard
          label="Unassigned"
          value={unassigned.count ?? 0}
          icon={Users}
          href="/admin/leads?assignee=unassigned"
          tone={(unassigned.count ?? 0) > 0 ? "gold" : "default"}
        />
        <StatCard label="Enrolments" value={(enrollments.data ?? []).length} icon={GraduationCap} href="/admin/students" />
        <StatCard label="Published courses" value={published} icon={BookOpen} href="/admin/courses" />
        <StatCard
          label="Collected"
          value={formatInr(collected)}
          hint={awaiting > 0 ? `${awaiting} awaiting verification` : "Nothing pending"}
          icon={IndianRupee}
          href="/admin/payments"
        />
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-display text-base font-bold">Lead funnel</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {LEAD_STATUSES.map((s) => {
              const n = counts.get(s.value) ?? 0;
              return (
                <li key={s.value} className="flex items-center gap-3">
                  <Link href={`/admin/leads?status=${s.value}`} className="w-40 shrink-0">
                    <LeadStatusBadge status={s.value} />
                  </Link>
                  <Progress value={percent(n, leads.length)} className="flex-1" />
                  <span className="w-10 text-right text-sm font-semibold">{n}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-display text-base font-bold">Top counsellors</h2>
          {top.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No counsellors yet.{" "}
              <Link href="/admin/employees" className="text-gold-700 hover:underline">
                Add one
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {top.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 border-b pb-3 last:border-0">
                  <span className="min-w-0 truncate font-semibold">{t.name}</span>
                  <span className="shrink-0 text-sm text-muted-foreground">
                    {t.enrolled} enrolled of {t.assigned}
                    {t.assigned > 0 ? ` · ${percent(t.enrolled, t.assigned)}%` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
