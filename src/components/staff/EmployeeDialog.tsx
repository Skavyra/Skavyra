"use client";

import { Pencil, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createUserAccount, updateEmployee } from "@/actions/staff";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "@/hooks/use-toast";
import { toDateInput } from "@/lib/utils";

export type EmployeeRecord = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  employee_code: string | null;
  designation: string | null;
  department: string | null;
  employment_type: "intern" | "full_time" | "contract";
  date_of_joining: string | null;
};

/**
 * Add creates the login through the create-user edge function. Leaving the
 * password empty sends an invite email instead.
 */
export function EmployeeDialog({
  employee,
  managers,
}: {
  employee?: EmployeeRecord;
  managers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const editing = Boolean(employee);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editing ? (
          <Button variant="outline" size="sm">
            <Pencil /> Edit
          </Button>
        ) : (
          <Button>
            <UserPlus /> Add employee
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit employee" : "Add employee"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Changes apply straight away."
              : "Leave the password empty to send an invite email instead of setting one yourself."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          action={(formData) => {
            setError(null);
            start(async () => {
              const result = employee ? await updateEmployee(employee.id, formData) : await createUserAccount(formData);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              toast.success(editing ? "Employee updated" : "Account created");
              setOpen(false);
              router.refresh();
            });
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" htmlFor="first_name">
              <Input id="first_name" name="first_name" defaultValue={employee?.first_name} required />
            </Field>
            <Field label="Last name" htmlFor="last_name">
              <Input id="last_name" name="last_name" defaultValue={employee?.last_name} />
            </Field>
            {!editing && (
              <>
                <Field label="Email" htmlFor="email">
                  <Input id="email" name="email" type="email" required />
                </Field>
                <Field label="Password" htmlFor="password" hint="At least 10 characters, or leave empty.">
                  <Input id="password" name="password" type="password" autoComplete="new-password" />
                </Field>
                <Field label="Role" htmlFor="role">
                  <NativeSelect id="role" name="role" defaultValue="employee">
                    <option value="employee">Counsellor</option>
                    <option value="admin">Admin</option>
                  </NativeSelect>
                </Field>
              </>
            )}
            <Field label="Phone" htmlFor="phone">
              <Input id="phone" name="phone" inputMode="numeric" defaultValue={employee?.phone ?? ""} />
            </Field>
            <Field label="Employee code" htmlFor="employee_code" hint={editing ? undefined : "Left empty, one is generated."}>
              <Input id="employee_code" name="employee_code" defaultValue={employee?.employee_code ?? ""} />
            </Field>
            <Field label="Designation" htmlFor="designation">
              <Input id="designation" name="designation" defaultValue={employee?.designation ?? ""} />
            </Field>
            <Field label="Department" htmlFor="department">
              <Input id="department" name="department" defaultValue={employee?.department ?? ""} />
            </Field>
            <Field label="Date of joining" htmlFor="date_of_joining">
              <Input id="date_of_joining" name="date_of_joining" type="date" defaultValue={toDateInput(employee?.date_of_joining)} />
            </Field>
            {editing ? (
              <Field label="Employment type" htmlFor="employment_type">
                <NativeSelect id="employment_type" name="employment_type" defaultValue={employee?.employment_type ?? "full_time"}>
                  <option value="full_time">Full time</option>
                  <option value="intern">Intern</option>
                  <option value="contract">Contract</option>
                </NativeSelect>
              </Field>
            ) : (
              <Field label="Reporting manager" htmlFor="reporting_manager_id">
                <NativeSelect id="reporting_manager_id" name="reporting_manager_id" defaultValue="">
                  <option value="">No manager</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={pending}>
              {editing ? "Save changes" : "Create account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
