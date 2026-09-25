"use client";

import { Download } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { downloadSheet } from "@/lib/excel/parse";
import { formatDate } from "@/lib/utils";

import { AssignBar } from "./AssignBar";
import type { Counsellor } from "./DistributeDialog";
import { LeadTable, type LeadRow } from "./LeadTable";

/** Selection, the bulk bar and Export live here so the page stays a server component. */
export function AdminLeadList({ leads, counsellors }: { leads: LeadRow[]; counsellors: Counsellor[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allOnPage = leads.length > 0 && leads.every((l) => selected.has(l.id));

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={allOnPage}
            onCheckedChange={(v) =>
              setSelected((prev) => {
                const next = new Set(prev);
                leads.forEach((l) => (v === true ? next.add(l.id) : next.delete(l.id)));
                return next;
              })
            }
            aria-label="Select every lead on this page"
          />
          Select all on this page
        </label>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() =>
            downloadSheet(
              `skavyra-leads-${new Date().toISOString().slice(0, 10)}.xlsx`,
              "Leads",
              leads.map((l) => ({
                Name: l.full_name,
                Phone: l.phone,
                College: l.college_name ?? "",
                Status: l.status,
                "Follow up": formatDate(l.follow_up_on),
                Counsellor: l.assignee_name ?? "Unassigned",
              })),
            )
          }
        >
          <Download /> Export
        </Button>
      </div>

      <LeadTable
        leads={leads}
        showAssignee
        selected={selected}
        onSelect={(id, checked) =>
          setSelected((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
          })
        }
      />

      <AssignBar
        count={selected.size}
        leadIds={[...selected]}
        counsellors={counsellors}
        onClear={() => setSelected(new Set())}
      />
    </>
  );
}
