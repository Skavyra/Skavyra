import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { LeadStatusBadge } from "@/components/dashboard/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { requireRole } from "@/lib/auth/require-role";
import { LEAD_STATUSES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatInr, percent } from "@/lib/utils";
import type { LeadStatus } from "@/types";

export const metadata: Metadata = { title: "My performance" };

export default async function PerformancePage() {
  const user = await requireRole("employee");
  const supabase = await createClient();

  const { data: leads } = await supabase
    .from("student_leads")
    .select("status, created_at, converted_enrollment_id, last_contacted_at")
    .is("deleted_at", null)
    .eq("assigned_employee_id", user.id);
  const list = leads ?? [];

  const counts = new Map<LeadStatus, number>();
  for (const l of list) counts.set(l.status, (counts.get(l.status) ?? 0) + 1);

  const enrolled = counts.get("enrolled") ?? 0;
  const contacted = list.filter((l) => l.last_contacted_at).length;
  const conversion = percent(enrolled, list.length);

  const enrollmentIds = list.map((l) => l.converted_enrollment_id).filter((id): id is string => Boolean(id));
  const { data: enrollments } = enrollmentIds.length
    ? await supabase
        .from("enrollments")
        .select("id, total_amount, amount_paid, created_at, course:courses(title), profile:profiles!enrollments_user_id_fkey(first_name, last_name)")
        .in("id", enrollmentIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  const revenue = (enrollments ?? []).reduce((s, e) => s + Number(e.amount_paid), 0);

  return (
    <>
      <PageHeader title="My performance" description="How your leads are moving." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Leads assigned" value={list.length} />
        <StatCard label="Contacted" value={contacted} hint={`${percent(contacted, list.length)}% of your leads`} />
        <StatCard label="Enrolled" value={enrolled} tone="gold" />
        <StatCard label="Conversion" value={`${conversion}%`} hint="Enrolled out of assigned" />
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-display text-base font-bold">Your leads by status</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {LEAD_STATUSES.map((s) => {
              const n = counts.get(s.value) ?? 0;
              return (
                <li key={s.value} className="flex items-center gap-3">
                  <span className="w-40 shrink-0">
                    <LeadStatusBadge status={s.value} />
                  </span>
                  <Progress value={percent(n, list.length)} className="flex-1" />
                  <span className="w-8 text-right text-sm font-semibold">{n}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-display text-base font-bold">Enrolments you closed</h2>
          <p className="mt-1 text-sm text-muted-foreground">{formatInr(revenue)} collected so far.</p>
          {(enrollments ?? []).length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No enrolments yet. They appear here as your leads convert.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {(enrollments ?? []).map((e) => (
                <li key={e.id} className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-3 last:border-0">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {[e.profile?.first_name, e.profile?.last_name].filter(Boolean).join(" ")}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {e.course?.title} · {formatDate(e.created_at)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatInr(e.amount_paid)} of {formatInr(e.total_amount)}
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
