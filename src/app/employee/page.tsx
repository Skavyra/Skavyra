import { CalendarClock, CheckCircle2, PhoneCall, Users } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { LeadStatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/require-role";
import { OPEN_LEAD_STATUSES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPhone } from "@/lib/utils";

export default async function EmployeeDashboard() {
  const user = await requireRole("employee");
  const supabase = await createClient();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const mine = () => supabase.from("student_leads").select("id", { count: "exact", head: true }).is("deleted_at", null).eq("assigned_employee_id", user.id);

  const [total, open, enrolled, interested, dueToday, overdue] = await Promise.all([
    mine(),
    mine().in("status", OPEN_LEAD_STATUSES),
    mine().eq("status", "enrolled"),
    mine().eq("status", "interested"),
    supabase
      .from("student_leads")
      .select("id, full_name, phone, status, follow_up_on, college_name")
      .is("deleted_at", null)
      .eq("assigned_employee_id", user.id)
      .gte("follow_up_on", startOfDay.toISOString())
      .lt("follow_up_on", endOfDay.toISOString())
      .order("follow_up_on", { ascending: true }),
    supabase
      .from("student_leads")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("assigned_employee_id", user.id)
      .lt("follow_up_on", startOfDay.toISOString())
      .in("status", OPEN_LEAD_STATUSES),
  ]);

  const callbacks = dueToday.data ?? [];

  return (
    <>
      <PageHeader
        title={`Good to see you, ${user.profile?.first_name || "there"}`}
        description="Your leads and the calls due today."
        actions={
          <Button asChild>
            <Link href="/employee/leads/new">Add lead</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="My leads" value={total.count ?? 0} icon={Users} href="/employee/leads" />
        <StatCard label="Still open" value={open.count ?? 0} icon={PhoneCall} href="/employee/leads" />
        <StatCard label="Interested" value={interested.count ?? 0} icon={CalendarClock} href="/employee/leads?status=interested" />
        <StatCard label="Enrolled" value={enrolled.count ?? 0} icon={CheckCircle2} href="/employee/leads?status=enrolled" tone="gold" />
      </div>

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold">Callbacks due today</h2>
          {(overdue.count ?? 0) > 0 && (
            <Link href="/employee/leads?follow=overdue" className="text-sm font-semibold text-destructive hover:underline">
              {overdue.count} overdue
            </Link>
          )}
        </div>

        {callbacks.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No callbacks today"
            description="Set a follow-up date on a lead and it appears here on the day."
            action={
              <Button asChild variant="outline">
                <Link href="/employee/leads">Open my leads</Link>
              </Button>
            }
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {callbacks.map((lead) => (
              <li key={lead.id} className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/employee/leads?lead=${lead.id}`} className="font-semibold hover:underline">
                    {lead.full_name}
                  </Link>
                  <p className="truncate text-sm text-muted-foreground">
                    {formatPhone(lead.phone)}
                    {lead.college_name ? ` · ${lead.college_name}` : ""} · {formatDate(lead.follow_up_on, true)}
                  </p>
                </div>
                <LeadStatusBadge status={lead.status} />
                <Button asChild size="sm">
                  <a href={`tel:+91${lead.phone}`}>
                    <PhoneCall /> Call
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
