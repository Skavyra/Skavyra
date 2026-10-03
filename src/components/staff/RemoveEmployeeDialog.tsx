"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { removeEmployee } from "@/actions/staff";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "@/hooks/use-toast";

export function RemoveEmployeeDialog({ employee, others }: {
  employee: { id: string; name: string };
  others: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [inheritor, setInheritor] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Dialog open={open} onOpenChange={(value) => { if (!pending) setOpen(value); }}>
      <DialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 /> Remove</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove {employee.name}?</DialogTitle>
          <DialogDescription>Delete their staff record and revoke employee access. Their login, profile, student access, and historical records remain. This does not reactivate a blocked account.</DialogDescription>
        </DialogHeader>
        <Field label="Move any open leads to" htmlFor={`remove-inheritor-${employee.id}`}>
          <NativeSelect id={`remove-inheritor-${employee.id}`} value={inheritor} onChange={(event) => setInheritor(event.target.value)} disabled={pending}>
            <option value="">Leave unassigned</option>
            {others.map((other) => <option key={other.id} value={other.id}>{other.name}</option>)}
          </NativeSelect>
        </Field>
        <DialogFooter>
          <Button variant="outline" disabled={pending} onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" loading={pending} onClick={() => start(async () => {
            const result = await removeEmployee(employee.id, inheritor || null);
            if (!result.ok) { toast.error(result.error); return; }
            toast.success("Employee removed");
            setOpen(false);
            router.refresh();
          })}>Remove employee</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
