"use client";

import { Eye, Pencil, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { LeadStatusBadge } from "@/components/dashboard/StatusBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { IconAction } from "@/components/ui/icon-action";
import { cn, formatDate, formatPhone } from "@/lib/utils";
import type { LeadStatus } from "@/types";

export type LeadRow = {
  id: string;
  full_name: string;
  phone: string;
  college_name: string | null;
  status: LeadStatus;
  follow_up_on: string | null;
  assigned_employee_id: string | null;
  assignee_name?: string | null;
};

/**
 * Rows open a detail panel through ?lead=<id>, so the URL is shareable and the
 * back button closes the panel.
 */
export function LeadTable({
  leads,
  selected,
  onSelect,
  showAssignee = false,
  canEdit = true,
}: {
  leads: LeadRow[];
  selected?: Set<string>;
  onSelect?: (id: string, checked: boolean) => void;
  showAssignee?: boolean;
  /** False for roles that may look at a lead but not change it (HR). */
  canEdit?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const open = (id: string, mode: "view" | "edit" = "view") => {
    const next = new URLSearchParams(params.toString());
    next.set("lead", id);
    next.set("mode", mode);
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const columns: Column<LeadRow>[] = [
    {
      key: "name",
      header: "Name",
      cell: (row) => (
        <button type="button" onClick={() => open(row.id)} className="text-left font-semibold hover:underline">
          {row.full_name}
        </button>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      cell: (row) => (
        <a href={`tel:+91${row.phone}`} className="font-mono text-sm hover:underline" onClick={(e) => e.stopPropagation()}>
          {formatPhone(row.phone)}
        </a>
      ),
    },
    { key: "college", header: "College", cell: (row) => <span className="truncate">{row.college_name || "—"}</span> },
    { key: "status", header: "Status", cell: (row) => <LeadStatusBadge status={row.status} /> },
    { key: "follow_up", header: "Follow up", cell: (row) => formatDate(row.follow_up_on) },
    ...(showAssignee
      ? [
          {
            key: "assignee",
            header: "Counsellor",
            cell: (row: LeadRow) =>
              row.assignee_name ? (
                <span>{row.assignee_name}</span>
              ) : (
                <span className="font-semibold text-gold-700">Unassigned</span>
              ),
          },
        ]
      : []),
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <IconAction label="View" onClick={() => open(row.id, "view")}>
            <Eye />
          </IconAction>
          {canEdit && (
            <IconAction label="Edit" onClick={() => open(row.id, "edit")}>
              <Pencil />
            </IconAction>
          )}
          <IconAction label="Call" href={`tel:+91${row.phone}`} external>
            <Phone />
          </IconAction>
        </div>
      ),
    },
  ];

  return (
    <div className={cn(showAssignee && "[&_tr[data-unassigned=true]]:bg-gold-100/25")}>
      <DataTable
        rows={leads}
        columns={columns}
        rowKey={(r) => r.id}
        cardTitle={(r) => (
          <button type="button" onClick={() => open(r.id)} className="text-left hover:underline">
            {r.full_name}
          </button>
        )}
        selection={
          onSelect
            ? {
                header: null,
                render: (row) => (
                  <Checkbox
                    checked={selected?.has(row.id) ?? false}
                    onCheckedChange={(v) => onSelect(row.id, v === true)}
                    aria-label={`Select ${row.full_name}`}
                  />
                ),
              }
            : undefined
        }
        empty={
          <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            No leads match these filters. <Link href={pathname} className="text-gold-700 hover:underline">Clear them</Link> to see everything.
          </p>
        }
      />
    </div>
  );
}
