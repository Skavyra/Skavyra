import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { NewCourseButton } from "@/components/courses/NewCourseButton";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth/require-role";
import { CATEGORY_LABEL } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { cn, formatInr } from "@/lib/utils";
import type { CourseStatus } from "@/types";

export const metadata: Metadata = { title: "Courses" };

const TABS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

type Row = {
  id: string;
  title: string;
  category: "it" | "non_it" | "both";
  duration_weeks: number | null;
  price: number;
  status: CourseStatus;
  enrolled: number;
};

export default async function AdminCoursesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  await requireRole("admin");
  const supabase = await createClient();

  let query = supabase.from("courses").select("id, title, category, duration_weeks, price, status").order("sort_order");
  if (status === "published" || status === "draft") query = query.eq("status", status);
  const [{ data: courses }, { data: enrollments }] = await Promise.all([
    query,
    supabase.from("enrollments").select("course_id"),
  ]);

  const counts = new Map<string, number>();
  for (const e of enrollments ?? []) counts.set(e.course_id, (counts.get(e.course_id) ?? 0) + 1);

  const rows: Row[] = (courses ?? []).map((c) => ({ ...c, price: Number(c.price), enrolled: counts.get(c.id) ?? 0 }));

  const columns: Column<Row>[] = [
    { key: "title", header: "Course", cell: (r) => r.title },
    { key: "category", header: "Stream", cell: (r) => CATEGORY_LABEL[r.category] },
    { key: "duration", header: "Duration", cell: (r) => (r.duration_weeks ? `${r.duration_weeks} weeks` : "—") },
    { key: "price", header: "Fee", cell: (r) => formatInr(r.price) },
    { key: "enrolled", header: "Enrolled", cell: (r) => r.enrolled },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <Badge tone={r.status === "published" ? "success" : r.status === "archived" ? "muted" : "neutral"}>
          {r.status === "published" ? "Published" : r.status === "archived" ? "Archived" : "Draft"}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Courses" description="Build the syllabus, set the fee, then publish." actions={<NewCourseButton />} />

      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <Link
            key={t.label}
            href={t.value ? `/admin/courses?status=${t.value}` : "/admin/courses"}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
              (status ?? "") === t.value ? "border-ink bg-ink text-ivory" : "hover:border-gold-300",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(r) => r.id}
        onRowHref={(r) => `/admin/courses/${r.id}`}
        empty={
          <EmptyState
            icon={BookOpen}
            title="No courses here yet"
            description="Create a course, add its modules and lessons, then publish it to the website."
            action={<NewCourseButton />}
          />
        }
      />
    </>
  );
}
