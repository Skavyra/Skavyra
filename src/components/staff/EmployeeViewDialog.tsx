"use client";

import { Eye, PhoneCall } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDate, formatPhone } from "@/lib/utils";

import type { EmployeeRecord } from "./EmployeeDialog";

const TYPE_LABEL = { full_time: "Full time", intern: "Intern", contract: "Contract" } as const;

/** Read-only profile of one staff member, with a shortcut to the leads they hold. */
export function EmployeeViewDialog({
  employee,
  name,
  isActive,
  roleLabels,
  openLeads,
  reportingManager,
  leadsHref,
}: {
  employee: EmployeeRecord;
  name: string;
  isActive: boolean;
  roleLabels: string[];
  openLeads: number;
  reportingManager: string | null;
  leadsHref: string;
}) {
  const rows: [string, React.ReactNode][] = [
    ["Email", employee.email || "—"],
    ["Phone", employee.phone ? formatPhone(employee.phone) : "—"],
    ["Employee code", <span key="c" className="font-mono">{employee.employee_code ?? "—"}</span>],
    ["Designation", employee.designation ?? "—"],
    ["Department", employee.department ?? "—"],
    ["Employment type", TYPE_LABEL[employee.employment_type]],
    ["Date of joining", formatDate(employee.date_of_joining)],
    ["Reports to", reportingManager ?? "No manager"],
    ["Open leads", String(openLeads)],
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" title="View" aria-label="View details">
          <Eye />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2">
            {roleLabels.map((r) => (
              <Badge key={r} tone="ink">
                {r}
              </Badge>
            ))}
            <Badge tone={isActive ? "success" : "muted"}>{isActive ? "Active" : "Inactive"}</Badge>
          </DialogDescription>
        </DialogHeader>
        <dl className="grid gap-4 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 break-words text-sm">{value}</dd>
            </div>
          ))}
        </dl>
        {openLeads > 0 && (
          <Button asChild variant="outline" className="self-start">
            <Link href={leadsHref}>
              <PhoneCall /> See their leads
            </Link>
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
