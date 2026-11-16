"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { reassignLead, softDeleteLead } from "@/actions/leads";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "@/hooks/use-toast";

import type { Counsellor } from "./DistributeDialog";

/** Admin and HR: change this lead's counsellor (or unassign). Admin only: delete the lead. */
export function LeadManageBar({
  leadId,
  assignedId,
  counsellors,
  canDelete,
  onDeleted,
}: {
  leadId: string;
  assignedId: string | null;
  counsellors: Counsellor[];
  canDelete: boolean;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [value, setValue] = useState(assignedId ?? "");
  const [confirming, setConfirming] = useState(false);

  function save(next: string) {
    const previous = value;
    setValue(next);
    start(async () => {
      const result = await reassignLead(leadId, next || null);
      if (!result.ok) {
        setValue(previous);
        toast.error(result.error);
        return;
      }
      toast.success(next ? "Employee changed" : "Lead unassigned");
      router.refresh();
    });
  }

  function remove() {
    start(async () => {
      const result = await softDeleteLead(leadId);
      setConfirming(false);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Lead deleted");
      onDeleted();
      router.refresh();
    });
  }

  return (
    <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border bg-muted/40 p-3">
      <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Employee
        <NativeSelect value={value} disabled={pending} onChange={(e) => save(e.target.value)} className="text-sm normal-case">
          <option value="">Unassigned</option>
          {counsellors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </NativeSelect>
      </label>
      {canDelete && (
        <Button variant="outline" size="sm" onClick={() => setConfirming(true)} disabled={pending} className="text-destructive">
          <Trash2 /> Delete lead
        </Button>
      )}
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Delete this lead?"
        description="It disappears from every list. This can't be undone from the app."
        confirmLabel="Delete lead"
        destructive
        loading={pending}
        onConfirm={remove}
      />
    </div>
  );
}
