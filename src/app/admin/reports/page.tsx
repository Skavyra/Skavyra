import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ReportTabs, type CounsellorRow, type FunnelPoint, type RevenuePoint } from "@/components/reports/ReportTabs";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { formatInr, fullName, percent } from "@/lib/utils";

export const metadata: Metadata = { title: "Reports" };

const FUNNEL_STAGES: { label: string; statuses: string[] }[] = [
  { label: "All leads", statuses: [] },
  { label: "Contacted", statuses: ["interested", "follow_up", "callback_requested", "called_no_response", "enrolled", "not_interested"] },
  { label: "Interested", statuses: ["interested", "follow_up", "callback_requested", "enrolled"] },
  { label: "Enrolled", statuses: ["enrolled"] },
];

export default async function ReportsPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const [{ data: leads }, { data: employees }, { data: payments }, { data: enrollments }] = await Promise.all([
    supabase.from("student_leads").select("status, assigned_employee_id, last_contacted_at, converted_enrollment_id").is("deleted_at", null),
    supabase.from("employees").select("id, is_active, profile:profiles!employees_id_fkey(first_name, last_name)"),
    supabase.from("payments").select("amount, status, paid_at, created_at"),
    supabase.from("enrollments").select("id, created_at"),
  ]);

  const leadRows = leads ?? [];

  const funnel: FunnelPoint[] = FUNNEL_STAGES.map((stage) => ({
    stage: stage.label,
    count: stage.statuses.length === 0 ? leadRows.length : leadRows.filter((l) => stage.statuses.includes(l.status)).length,
  }));

  const counsellors: CounsellorRow[] = (employees ?? [])
    .map((e) => {
      const mine = leadRows.filter((l) => l.assigned_employee_id === e.id);
      const enrolled = mine.filter((l) => l.status === "enrolled").length;
      return {
        id: e.id,
        name: fullName(e.profile) || "Unnamed",
        assigned: mine.length,
        contacted: mine.filter((l) => l.last_contacted_at).length,
        interested: mine.filter((l) => l.status === "interested" || l.status === "follow_up").length,
        enrolled,
        conversion: percent(enrolled, mine.length),
      };
    })
    .sort((a, b) => b.enrolled - a.enrolled || b.assigned - a.assigned);

  // last 12 months of collected money and new enrolments
  const months: RevenuePoint[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({ month: d.toLocaleString("en-IN", { month: "short", year: "2-digit" }), collected: 0, enrolments: 0 });
    const index = months.length - 1;
    for (const p of payments ?? []) {
      if (p.status !== "success") continue;
      if ((p.paid_at ?? p.created_at).slice(0, 7) === key) months[index].collected += Number(p.amount);
    }
    for (const e of enrollments ?? []) {
      if (e.created_at.slice(0, 7) === key) months[index].enrolments += 1;
    }
  }

  const collected = (payments ?? []).filter((p) => p.status === "success").reduce((s, p) => s + Number(p.amount), 0);
  const enrolled = leadRows.filter((l) => l.status === "enrolled").length;

  return (
    <>
      <PageHeader title="Reports" description="How leads convert, who is converting them, and what has been collected." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Leads" value={leadRows.length} />
        <StatCard label="Enrolled" value={enrolled} hint={`${percent(enrolled, leadRows.length)}% of leads`} />
        <StatCard label="Enrolments" value={(enrollments ?? []).length} />
        <StatCard label="Collected" value={formatInr(collected)} tone="gold" />
      </div>

      <div className="mt-8">
        <ReportTabs
          funnel={funnel}
          counsellors={counsellors}
          revenue={months}
          totals={{ collected, enrolments: (enrollments ?? []).length, leads: leadRows.length }}
        />
      </div>
    </>
  );
}
