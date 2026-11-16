import { History, Upload, UserPlus } from "lucide-react";
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
import { formatDate } from "@/lib/utils";
import type { PanelProps } from "./types";

/**
 * Admin gets the full lead drawer, delete, bulk status and Add lead. HR can read, add, import, assign and
 * unassign, but not edit a lead's details.
 */
export async function LeadsView({ base, roles, params }: PanelProps & { params: LeadQuery & { lead?: string } }) {
  const user = await requireRole(roles);
  const isAdmin = user.roles.includes("admin");
  const isHr = !isAdmin;
  const supabase = await createClient();

  const { data: batch } = params.batch
    ? await supabase.from("lead_upload_batches").select("file_name, created_at, inserted_rows").eq("id", params.batch).maybeSingle()
    : { data: null };

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
              <Link href={`${base}/leads/imports`}>
                <History /> Import history
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`${base}/leads/import`}>
                <Upload /> Import data
              </Link>
            </Button>
            <Button asChild>
              <Link href={`${base}/leads/new`}>
                <UserPlus /> Add lead
              </Link>
            </Button>
          </>
        }
      />
      {params.batch && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-gold-300 bg-gold-100/40 p-3 text-sm">
          <span>
            Showing the import <strong>{batch?.file_name ?? "(unknown file)"}</strong>
            {batch ? `, ${formatDate(batch.created_at)}, ${batch.inserted_rows} leads` : ""}.
          </span>
          <Button asChild size="sm" variant="outline" className="ml-auto">
            <Link href={`${base}/leads`}>Show all leads</Link>
          </Button>
        </div>
      )}
      <SearchFilters
        placeholder="Search name, phone or college"
        filters={[
          LEAD_STATUS_FILTER,
          FOLLOW_UP_FILTER,
          {
            key: "assignee",
            label: "Any employee",
            options: [{ value: "unassigned", label: "Unassigned" }, ...counsellors.map((c) => ({ value: c.id, label: c.name }))],
          },
        ]}
      />
      <AdminLeadList leads={leads} counsellors={counsellors} isAdmin={isAdmin} />
      <div className="mt-4">
        <Pagination page={page} pageCount={pageCount} total={total} hrefFor={hrefFor} />
      </div>
      {detail && (
        <LeadDrawer
          lead={detail.lead}
          activities={detail.activities}
          courses={detail.courses}
          selectedCourseIds={detail.selectedCourseIds}
          payments={detail.payments}
          assigneeName={detail.assigneeName}
          readOnly={isHr}
          counsellors={counsellors}
          canDelete={isAdmin}
        />
      )}
    </>
  );
}
