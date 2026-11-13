import { Upload, UserPlus } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { SearchFilters } from "@/components/dashboard/SearchFilters";
import { AdminLeadList } from "@/components/leads/AdminLeadList";
import { LeadDrawer } from "@/components/leads/LeadDrawer";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { requireRole } from "@/lib/auth/require-role";
import { fetchCounsellors, fetchLeadDetail, fetchLeads, FOLLOW_UP_FILTER, LEAD_STATUS_FILTER, type LeadQuery } from "@/lib/leads-query";
import { createClient } from "@/lib/supabase/server";
import type { PanelProps } from "./types";

/** Admin gets the full lead drawer and Add lead. HR can read, import and assign, but not edit a lead. */
export async function LeadsView({ base, roles, params }: PanelProps & { params: LeadQuery & { lead?: string } }) {
  await requireRole(roles);
  const isHr = base === "/hr";
  const supabase = await createClient();

  const [{ leads, page, pageCount, total }, counsellors] = await Promise.all([
    fetchLeads(supabase, params),
    fetchCounsellors(supabase),
  ]);
  const detail = params.lead ? await fetchLeadDetail(supabase, params.lead) : null;

  const hrefFor = (p: number) => {
    const next = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]);
    next.set("page", String(p));
    return `${base}/leads?${next.toString()}`;
  };

  return (
    <>
      <PageHeader
        title="Leads"
        description={`${total} ${total === 1 ? "lead" : "leads"}. Tick rows to assign them.`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={`${base}/leads/import`}>
                <Upload /> Import data
              </Link>
            </Button>
            {!isHr && (
              <Button asChild>
                <Link href="/admin/leads/new">
                  <UserPlus /> Add lead
                </Link>
              </Button>
            )}
          </>
        }
      />
      <SearchFilters
        placeholder="Search name, phone or college"
        filters={[
          LEAD_STATUS_FILTER,
          FOLLOW_UP_FILTER,
          {
            key: "assignee",
            label: "Any counsellor",
            options: [{ value: "unassigned", label: "Unassigned" }, ...counsellors.map((c) => ({ value: c.id, label: c.name }))],
          },
        ]}
      />
      <AdminLeadList leads={leads} counsellors={counsellors} />
      <div className="mt-4">
        <Pagination page={page} pageCount={pageCount} total={total} hrefFor={hrefFor} />
      </div>
      {detail && (
        <LeadDrawer
          lead={detail.lead}
          activities={detail.activities}
          courses={detail.courses}
          selectedCourseIds={detail.selectedCourseIds}
          assigneeName={detail.assigneeName}
          readOnly={isHr}
        />
      )}
    </>
  );
}
