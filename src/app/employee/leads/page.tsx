import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { SearchFilters } from "@/components/dashboard/SearchFilters";
import { LeadDrawer } from "@/components/leads/LeadDrawer";
import { LeadTable } from "@/components/leads/LeadTable";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { requireRole } from "@/lib/auth/require-role";
import { fetchLeadDetail, fetchLeads, FOLLOW_UP_FILTER, LEAD_STATUS_FILTER, type LeadQuery } from "@/lib/leads-query";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My leads" };

export default async function EmployeeLeadsPage({
  searchParams,
}: {
  searchParams: Promise<LeadQuery & { lead?: string }>;
}) {
  const params = await searchParams;
  const user = await requireRole("employee");
  const supabase = await createClient();

  const { leads, page, pageCount, total } = await fetchLeads(supabase, params, { assignedTo: user.id });
  const detail = params.lead ? await fetchLeadDetail(supabase, params.lead) : null;

  const hrefFor = (p: number) => {
    const next = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]);
    next.set("page", String(p));
    return `/employee/leads?${next.toString()}`;
  };

  return (
    <>
      <PageHeader
        title="My leads"
        description={`${total} ${total === 1 ? "lead" : "leads"} assigned to you.`}
        actions={
          <Button asChild>
            <Link href="/employee/leads/new">Add lead</Link>
          </Button>
        }
      />
      <SearchFilters placeholder="Search name, phone or college" filters={[LEAD_STATUS_FILTER, FOLLOW_UP_FILTER]} />
      <LeadTable leads={leads} />
      <div className="mt-4">
        <Pagination page={page} pageCount={pageCount} total={total} hrefFor={hrefFor} />
      </div>
      {detail && (
        <LeadDrawer
          lead={detail.lead}
          activities={detail.activities}
          courses={detail.courses}
          selectedCourseIds={detail.selectedCourseIds}
        />
      )}
    </>
  );
}
