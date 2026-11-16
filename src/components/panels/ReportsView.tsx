import { PageHeader } from "@/components/dashboard/PageHeader";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportTabs } from "@/components/reports/ReportTabs";
import { requireRole } from "@/lib/auth/require-role";
import { buildReport, resolveRange } from "@/lib/reports/compute";
import { fetchReportData } from "@/lib/reports/fetch";
import { createClient } from "@/lib/supabase/server";
import type { PanelProps } from "./types";

export type ReportParams = { period?: string; from?: string; to?: string; employee?: string; status?: string; tab?: string };

/** Admin and HR only (the panel layouts and middleware already keep everyone else out). */
export async function ReportsView({ roles, params }: PanelProps & { params: ReportParams }) {
  await requireRole(roles);
  const supabase = await createClient();

  const range = resolveRange(params.period, params.from, params.to);
  const data = await fetchReportData(supabase, range.period === "all");

  const employeeId = data.employees.some((e) => e.id === params.employee) ? (params.employee as string) : null;
  const report = buildReport({ ...data, range, employeeId });

  const tabs = ["overview", "employees", "status", "sheets", "courses"];
  const initialTab = tabs.includes(params.tab ?? "") ? (params.tab as string) : "overview";

  return (
    <>
      <PageHeader
        title="Reports"
        description="Employee performance, status breakdowns, day, week and month sheets, and money and students by course."
      />
      <ReportFilters employees={data.employees.map((e) => ({ id: e.id, name: e.name })).sort((a, b) => a.name.localeCompare(b.name))} />
      <ReportTabs report={report} statusFilter={params.status ?? ""} initialTab={initialTab} />
    </>
  );
}
