"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { LeadStatusBadge } from "@/components/dashboard/StatusBadge";
import { formatPhone } from "@/lib/utils";
import type { StudentLead } from "@/types";

import { ActivityTimeline, type ActivityRow } from "./ActivityTimeline";
import { LeadDetailForm } from "./LeadDetailForm";

/** Right-side panel opened by ?lead=<id>; closing it clears the parameter. */
export function LeadDrawer({
  lead,
  activities,
  courses,
  selectedCourseIds,
  assigneeName,
}: {
  lead: StudentLead;
  activities: ActivityRow[];
  courses: { id: string; title: string }[];
  selectedCourseIds: string[];
  assigneeName?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function close() {
    const next = new URLSearchParams(params.toString());
    next.delete("lead");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <Sheet open onOpenChange={(open) => !open && close()}>
      <SheetContent side="right" className="p-5 sm:p-6">
        <div className="pr-8">
          <SheetTitle>{lead.full_name}</SheetTitle>
          <SheetDescription>
            {formatPhone(lead.phone)}
            {assigneeName ? ` · ${assigneeName}` : ""}
          </SheetDescription>
          <div className="mt-2">
            <LeadStatusBadge status={lead.status} />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
          <LeadDetailForm lead={lead} courses={courses} selectedCourseIds={selectedCourseIds} />
          <div>
            <h3 className="font-display text-sm font-bold">History</h3>
            <div className="mt-3">
              <ActivityTimeline rows={activities} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
