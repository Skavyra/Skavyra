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
  { value: "flagship", label: "Flagship" },
];

type Row = {
  id: string;
  title: string;
  is_flagship: boolean;
  category: "it" | "non_it" | "both";
  duration_weeks: number | null;
  price: number;
  status: CourseStatus;
  enrolled: number;
};

export default async function AdminCoursesPage({ searchParams }: { searchParams: Promise<{ status?: string; flagship?: string }> }) {
  const { status, flagship } = await searchParams;
  const activeTab = flagship === "1" ? "flagship" : status ?? "";
  await requireRole("admin");
  const supabase = await createClient();

  let query = supabase.from("courses").select("id, title, is_flagship, category, duration_weeks, price, status").order("sort_order");
  if (flagship === "1") query = query.eq("is_flagship", true);
  if (status === "published" || status === "draft") query = query.eq("status", status);
  const [{ data: courses }, { data: enrollments }] = await Promise.all([
    query,
    supabase.from("enrollments").select("course_id"),
  ]);

  const counts = new Map<string, number>();
  for (const e of enrollments ?? []) counts.set(e.course_id, (counts.get(e.course_id) ?? 0) + 1);

  const rows: Row[] = (courses ?? []).map((c) => ({ ...c, price: Number(c.price), enrolled: counts.get(c.id) ?? 0 }));

  const columns: Column<Row>[] = [
    {
      key: "title",
      header: "Course",
      cell: (r) => (
        <span className="inline-flex flex-wrap items-center gap-2">
          {r.title}
          {r.is_flagship && <Badge tone="gold">Flagship</Badge>}
        </span>
      ),
    },
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
      <PageHeader title="Courses" description="Publish your course details and fee. Add modules and classes when ready." actions={<NewCourseButton />} />

      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <Link
            key={t.label}
            href={t.value === "flagship" ? "/admin/courses?flagship=1" : t.value ? `/admin/courses?status=${t.value}` : "/admin/courses"}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
              activeTab === t.value ? "border-ink bg-ink text-ivory" : "hover:border-gold-300",
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
            description="Create a course, fill in its details, and publish it to the website. Modules and lessons are optional."
            action={<NewCourseButton />}
          />
        }
      />
    </>
  );
}
