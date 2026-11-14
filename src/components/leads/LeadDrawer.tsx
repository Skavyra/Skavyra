"use client";

import { Eye, Pencil } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { LeadStatusBadge } from "@/components/dashboard/StatusBadge";
import { formatPhone } from "@/lib/utils";
import type { StudentLead } from "@/types";

import { ActivityTimeline, type ActivityRow } from "./ActivityTimeline";
import type { Counsellor } from "./DistributeDialog";
import { LeadManageBar } from "./LeadManageBar";
import { LeadDetailForm } from "./LeadDetailForm";
import type { LeadPayment, PayCourse } from "./PaymentProofUpload";
import { LeadSummary } from "./LeadSummary";

/** Right-side panel opened by ?lead=<id>; closing it clears the parameter. */
export function LeadDrawer({
  lead,
  activities,
  courses,
  selectedCourseIds,
  payments = [],
  assigneeName,
  readOnly = false,
  counsellors,
  canDelete = false,
}: {
  lead: StudentLead;
  activities: ActivityRow[];
  courses: PayCourse[];
  payments?: LeadPayment[];
  selectedCourseIds: string[];
  assigneeName?: string | null;
  /** HR can read a lead but the database refuses their edits, so show a summary instead of the form. */
  readOnly?: boolean;
  /** When given, shows the change-counsellor control (admin and HR). */
  counsellors?: Counsellor[];
  /** Admin only. */
  canDelete?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // The table's View and Edit icons set ?mode=. Anyone who may not edit always gets the read-only view.
  const editing = !readOnly && params.get("mode") === "edit";

  function go(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function close() {
    go({ lead: null, mode: null });
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
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <LeadStatusBadge status={lead.status} />
            {!readOnly && (
              <Button size="sm" variant="outline" onClick={() => go({ mode: editing ? "view" : "edit" })}>
                {editing ? <Eye /> : <Pencil />}
                {editing ? "View only" : "Edit"}
              </Button>
            )}
          </div>
          {counsellors && (
            <LeadManageBar
              key={`${lead.id}-${lead.assigned_employee_id ?? ""}`}
              leadId={lead.id}
              assignedId={lead.assigned_employee_id}
              counsellors={counsellors}
              canDelete={canDelete}
              onDeleted={close}
            />
          )}
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_260px]">
          {editing ? (
            <LeadDetailForm lead={lead} courses={courses} selectedCourseIds={selectedCourseIds} payments={payments} />
          ) : (
            <LeadSummary lead={lead} courses={courses.filter((c) => selectedCourseIds.includes(c.id))} />
          )}
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
