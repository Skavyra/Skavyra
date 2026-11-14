"use client";

import { UserMinus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setLeadsStatus, unassignLeads } from "@/actions/leads";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "@/hooks/use-toast";
import { LEAD_STATUSES } from "@/lib/constants";
import type { LeadStatus } from "@/types";

import { DistributeDialog, type Counsellor } from "./DistributeDialog";

/** Appears once rows are ticked: assign, split evenly, unassign, and (admin) set a status. */
export function AssignBar({
  count,
  leadIds,
  counsellors,
  onClear,
  isAdmin = false,
}: {
  count: number;
  leadIds: string[];
  counsellors: Counsellor[];
  onClear: () => void;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [ask, setAsk] = useState<{ kind: "unassign" } | { kind: "status"; status: string } | null>(null);
  if (count === 0) return null;

  const noun = `${count} ${count === 1 ? "lead" : "leads"}`;

  function unassign() {
    start(async () => {
      const result = await unassignLeads(leadIds);
      setAsk(null);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`${result.data.count} leads unassigned`);
      onClear();
      router.refresh();
    });
  }

  const statusLabel = (status: string) => LEAD_STATUSES.find((s) => s.value === status)?.label ?? status;

  function changeStatus(status: string) {
    const label = statusLabel(status);
    start(async () => {
      const result = await setLeadsStatus(leadIds, status as LeadStatus);
      setAsk(null);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`${result.data.count} leads set to ${label}`);
      onClear();
      router.refresh();
    });
  }

  return (
    <div className="sticky bottom-4 z-20 mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-gold-300 bg-card p-3 shadow-lg">
      <span className="text-sm font-semibold">
        {count} {count === 1 ? "lead" : "leads"} selected
      </span>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <DistributeDialog leadIds={leadIds} counsellors={counsellors} mode="assign" onDone={onClear} />
        <DistributeDialog leadIds={leadIds} counsellors={counsellors} mode="distribute" onDone={onClear} />
        <Button variant="outline" size="sm" onClick={() => setAsk({ kind: "unassign" })} disabled={pending}>
          <UserMinus /> Unassign
        </Button>
        {isAdmin && (
          <NativeSelect
            aria-label="Set status for selected leads"
            value=""
            disabled={pending}
            onChange={(e) => e.target.value && setAsk({ kind: "status", status: e.target.value })}
            className="h-9 w-40 text-sm"
          >
            <option value="">Set status…</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </NativeSelect>
        )}
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X /> Clear
        </Button>
      </div>
      <ConfirmDialog
        open={ask !== null}
        onOpenChange={(open) => !open && setAsk(null)}
        title={ask?.kind === "status" ? `Set ${noun} to "${statusLabel(ask.status)}"?` : `Unassign ${noun}?`}
        description={
          ask?.kind === "status"
            ? "Each change is saved to the lead's history."
            : "They go back to the unassigned pool, ready to hand out again."
        }
        confirmLabel={ask?.kind === "status" ? "Set status" : "Unassign"}
        loading={pending}
        onConfirm={() => (ask?.kind === "status" ? changeStatus(ask.status) : unassign())}
      />
    </div>
  );
}
