import { GraduationCap } from "lucide-react";
import type { Metadata } from "next";

import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SearchFilters } from "@/components/dashboard/SearchFilters";
import { AccessBadge, EnrollmentPaymentBadge } from "@/components/dashboard/StatusBadge";
import { EnrollDialog } from "@/components/payments/EnrollDialog";
import { Pagination } from "@/components/ui/pagination";
import { requireRole } from "@/lib/auth/require-role";
import { PAGE_SIZE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { formatInr, fullName } from "@/lib/utils";
import type { AccessStatus } from "@/types";

export const metadata: Metadata = { title: "Students" };

type Row = {
  id: string;
  student: string;
  email: string;
  course: string;
  plan: string;
  paid: number;
  total: number;
  access: AccessStatus;
  payment_status: string;
};

/** One row per enrolment, which is what the admin actually works with. */
export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; access?: string; page?: string }>;
}) {
  const params = await searchParams;
  await requireRole("admin");
  const supabase = await createClient();
  const page = Math.max(1, Number(params.page) || 1);

  let query = supabase
    .from("enrollments")
    .select(
      "id, plan, total_amount, amount_paid, access_status, payment_status, course:courses(title), profile:profiles!enrollments_user_id_fkey(first_name, last_name, email)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });
  if (params.access) query = query.eq("access_status", params.access as AccessStatus);

  const { data, count } = await query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const term = (params.q ?? "").trim().toLowerCase();
  const rows: Row[] = (data ?? [])
    .map((e) => ({
      id: e.id,
      student: fullName(e.profile) || e.profile?.email || "Unknown",
      email: e.profile?.email ?? "",
      course: e.course?.title ?? "",
      plan: e.plan === "partial" ? "Installments" : "Full",
      paid: Number(e.amount_paid),
      total: Number(e.total_amount),
      access: e.access_status,
      payment_status: e.payment_status,
    }))
    .filter((r) => !term || r.student.toLowerCase().includes(term) || r.email.toLowerCase().includes(term) || r.course.toLowerCase().includes(term));

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, price, allows_partial")
    .eq("status", "published")
    .order("sort_order");

  const columns: Column<Row>[] = [
    { key: "student", header: "Student", cell: (r) => r.student },
    { key: "course", header: "Course", cell: (r) => r.course },
    { key: "plan", header: "Plan", cell: (r) => r.plan },
    { key: "paid", header: "Paid", cell: (r) => `${formatInr(r.paid)} of ${formatInr(r.total)}` },
    { key: "payment", header: "Fees", cell: (r) => <EnrollmentPaymentBadge status={r.payment_status} /> },
    { key: "access", header: "Access", cell: (r) => <AccessBadge status={r.access} /> },
  ];

  const total = count ?? 0;
  const hrefFor = (p: number) => {
    const next = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]);
    next.set("page", String(p));
    return `/admin/students?${next.toString()}`;
  };

  return (
    <>
      <PageHeader
        title="Students"
        description="One row per enrolment."
        actions={
          <EnrollDialog
            courses={(courses ?? []).map((c) => ({ id: c.id, title: c.title, price: Number(c.price), allows_partial: c.allows_partial }))}
          />
        }
      />
      <SearchFilters
        placeholder="Search student or course"
        filters={[
          {
            key: "access",
            label: "Any access",
            options: [
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" },
              { value: "completed", label: "Completed" },
              { value: "refunded", label: "Refunded" },
            ],
          },
        ]}
      />
      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(r) => r.id}
        onRowHref={(r) => `/admin/enrollments/${r.id}`}
        empty={
          <EmptyState
            icon={GraduationCap}
            title="No enrolments yet"
            description="Enrol your first student and their payment plan and access appear here."
          />
        }
      />
      <div className="mt-4">
        <Pagination page={page} pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))} total={total} hrefFor={hrefFor} />
      </div>
    </>
  );
}
