"use client";

import { Shuffle, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { assignLeads } from "@/actions/leads";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

export type Counsellor = { id: string; name: string; openLeads: number };

/**
 * "Assign" gives every selected lead to one counsellor. "Distribute evenly"
 * splits them round robin, which is what assign_leads() does with several ids.
 */
export function DistributeDialog({
  leadIds,
  counsellors,
  mode,
  onDone,
}: {
  leadIds: string[];
  counsellors: Counsellor[];
  mode: "assign" | "distribute";
  onDone?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [pending, start] = useTransition();

  const chosen = mode === "assign" ? picked.slice(0, 1) : picked;
  const each = chosen.length ? Math.floor(leadIds.length / chosen.length) : 0;
  const remainder = chosen.length ? leadIds.length % chosen.length : 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setPicked([]);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant={mode === "assign" ? "default" : "outline"}>
          {mode === "assign" ? (
            <>
              <UserPlus /> Assign
            </>
          ) : (
            <>
              <Shuffle /> Distribute evenly
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "assign" ? "Assign to a counsellor" : "Distribute evenly"}</DialogTitle>
          <DialogDescription>
            {mode === "assign"
              ? `All ${leadIds.length} selected leads go to one counsellor.`
              : "Pick the counsellors to share these leads between."}
          </DialogDescription>
        </DialogHeader>

        {counsellors.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active counsellors yet. Add one under Employees first.</p>
        ) : (
          <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
            {counsellors.map((c) => (
              <li key={c.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-muted">
                  <Checkbox
                    checked={picked.includes(c.id)}
                    onCheckedChange={(v) =>
                      setPicked((p) =>
                        v === true ? (mode === "assign" ? [c.id] : [...p, c.id]) : p.filter((id) => id !== c.id),
                      )
                    }
                  />
                  <span className="flex-1">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.openLeads} open</span>
                </label>
              </li>
            ))}
          </ul>
        )}

        {chosen.length > 0 && (
          <p className="rounded-lg bg-muted p-3 text-sm">
            {mode === "assign"
              ? `${leadIds.length} leads to ${counsellors.find((c) => c.id === chosen[0])?.name}.`
              : `${leadIds.length} leads across ${chosen.length} counsellors, ${each}${remainder ? ` or ${each + 1}` : ""} each.`}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            loading={pending}
            disabled={chosen.length === 0}
            onClick={() =>
              start(async () => {
                const result = await assignLeads(leadIds, chosen);
                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }
                toast.success(`${result.data.count} leads assigned`);
                setOpen(false);
                setPicked([]);
                onDone?.();
                router.refresh();
              })
            }
          >
            {mode === "assign" ? "Assign leads" : "Distribute"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
