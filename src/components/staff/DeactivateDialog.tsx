"use client";

import { UserMinus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deactivateStaff, reactivateStaff } from "@/actions/staff";
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
import { Field } from "@/components/ui/field";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "@/hooks/use-toast";

/**
 * Deactivating a counsellor asks who inherits their open leads, and says how
 * many there are, because leads left behind are invisible to everyone else.
 */
export function DeactivateDialog({
  employee,
  openLeads,
  others,
}: {
  employee: { id: string; name: string; is_active: boolean };
  openLeads: number;
  others: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [ban, setBan] = useState(false);
  const [inheritor, setInheritor] = useState("");
  const [pending, start] = useTransition();

  if (employee.is_active === false) {
    return (
      <Button
        variant="outline"
        size="sm"
        loading={pending}
        onClick={() =>
          start(async () => {
            const result = await reactivateStaff(employee.id);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success(`${employee.name} reactivated`);
            router.refresh();
          })
        }
      >
        Reactivate
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserMinus /> Deactivate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deactivate {employee.name}</DialogTitle>
          <DialogDescription>
            They lose access to the counsellor panel. Their record and history stay for audit.
          </DialogDescription>
        </DialogHeader>

        <p className="rounded-lg bg-muted p-3 text-sm">
          {openLeads > 0
            ? `${openLeads} open ${openLeads === 1 ? "lead is" : "leads are"} assigned to them. Choose who takes over.`
            : "They have no open leads to hand over."}
        </p>

        {openLeads > 0 && (
          <Field label="Move open leads to" htmlFor="inheritor">
            <NativeSelect id="inheritor" value={inheritor} onChange={(e) => setInheritor(e.target.value)}>
              <option value="">Leave them unassigned</option>
              {others.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
        )}

        <label className="flex items-center gap-3 text-sm">
          <Checkbox checked={ban} onCheckedChange={(v) => setBan(v === true)} />
          Also block them from logging in
        </label>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            loading={pending}
            onClick={() =>
              start(async () => {
                const result = await deactivateStaff(employee.id, inheritor || null, ban);
                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }
                toast.success(
                  result.data.leads_moved > 0
                    ? `${employee.name} deactivated, ${result.data.leads_moved} leads moved`
                    : `${employee.name} deactivated`,
                );
                setOpen(false);
                router.refresh();
              })
            }
          >
            Deactivate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
