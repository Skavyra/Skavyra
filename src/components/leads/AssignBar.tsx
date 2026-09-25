"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { DistributeDialog, type Counsellor } from "./DistributeDialog";

/** Appears once rows are ticked: assign to one counsellor, or split evenly. */
export function AssignBar({
  count,
  leadIds,
  counsellors,
  onClear,
}: {
  count: number;
  leadIds: string[];
  counsellors: Counsellor[];
  onClear: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="sticky bottom-4 z-20 mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-gold-300 bg-card p-3 shadow-lg">
      <span className="text-sm font-semibold">
        {count} {count === 1 ? "lead" : "leads"} selected
      </span>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <DistributeDialog leadIds={leadIds} counsellors={counsellors} mode="assign" onDone={onClear} />
        <DistributeDialog leadIds={leadIds} counsellors={counsellors} mode="distribute" onDone={onClear} />
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X /> Clear
        </Button>
      </div>
    </div>
  );
}
