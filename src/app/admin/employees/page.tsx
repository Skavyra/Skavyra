import { Users } from "lucide-react";
import type { Metadata } from "next";

import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DeactivateDialog } from "@/components/staff/DeactivateDialog";
import { EmployeeDialog, type EmployeeRecord } from "@/components/staff/EmployeeDialog";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth/require-role";
import { OPEN_LEAD_STATUSES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPhone, fullName } from "@/lib/utils";

export const metadata: Metadata = { title: "Employees" };

type Row = EmployeeRecord & { is_active: boolean; is_admin: boolean; openLeads: number };

export default async function EmployeesPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const [{ data: employees }, { data: roles }, { data: openLeads }] = await Promise.all([
    supabase
      .from("employees")
      .select("*, profile:profiles!employees_id_fkey(first_name, last_name, email, phone, is_active)")
      .order("created_at", { ascending: true }),
    supabase.from("user_roles").select("user_id, role"),
    supabase.from("student_leads").select("assigned_employee_id").is("deleted_at", null).in("status", OPEN_LEAD_STATUSES),
  ]);

  const adminIds = new Set((roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));
  const counts = new Map<string, number>();
  for (const l of openLeads ?? []) {
    if (l.assigned_employee_id) counts.set(l.assigned_employee_id, (counts.get(l.assigned_employee_id) ?? 0) + 1);
  }

  const rows: Row[] = (employees ?? []).map((e) => ({
    id: e.id,
    first_name: e.profile?.first_name ?? "",
    last_name: e.profile?.last_name ?? "",
    email: e.profile?.email ?? "",
    phone: e.profile?.phone ?? null,
    employee_code: e.employee_code,
    designation: e.designation,
    department: e.department,
    employment_type: e.employment_type,
    date_of_joining: e.date_of_joining,
    is_active: e.is_active,
    is_admin: adminIds.has(e.id),
    openLeads: counts.get(e.id) ?? 0,
  }));

  const managers = rows.filter((r) => r.is_active).map((r) => ({ id: r.id, name: fullName(r) || r.email }));

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "Name",
      cell: (r) => (
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{fullName(r) || r.email}</span>
          {r.is_admin && <Badge tone="ink">Admin</Badge>}
          {!r.is_active && <Badge tone="muted">Inactive</Badge>}
        </span>
      ),
    },
    { key: "code", header: "Code", cell: (r) => <span className="font-mono text-xs">{r.employee_code ?? "—"}</span> },
    { key: "email", header: "Email", cell: (r) => <span className="truncate">{r.email}</span> },
    { key: "phone", header: "Phone", cell: (r) => formatPhone(r.phone) },
    { key: "designation", header: "Designation", cell: (r) => r.designation ?? "—" },
    { key: "joined", header: "Joined", cell: (r) => formatDate(r.date_of_joining) },
    { key: "leads", header: "Open leads", cell: (r) => r.openLeads },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (r) => (
        <span className="flex justify-end gap-2">
          <EmployeeDialog employee={r} managers={managers} />
          <DeactivateDialog
            employee={{ id: r.id, name: fullName(r) || r.email, is_active: r.is_active }}
            openLeads={r.openLeads}
            others={managers.filter((m) => m.id !== r.id)}
          />
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Employees"
        description="Counsellors and admins, and the leads they hold."
        actions={<EmployeeDialog managers={managers} />}
      />
      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(r) => r.id}
        empty={
          <EmptyState
            icon={Users}
            title="No employees yet"
            description="Add your first counsellor and they can start working leads straight away."
            action={<EmployeeDialog managers={[]} />}
          />
        }
      />
    </>
  );
}
