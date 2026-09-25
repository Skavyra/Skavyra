import { Award, GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { AccessBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { formatInr, percent } from "@/lib/utils";

export const metadata: Metadata = { title: "My courses" };

export default async function MyCoursesPage() {
  const user = await requireRole("student");
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, course_id, access_status, balance_amount, course:courses(title, subtitle, duration_weeks)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const list = enrollments ?? [];

  const [{ data: outline }, { data: progress }, { data: certificates }] = await Promise.all([
    list.length
      ? supabase.from("course_outline").select("course_id, lesson_id").in("course_id", list.map((e) => e.course_id))
      : Promise.resolve({ data: [] as { course_id: string | null; lesson_id: string | null }[] }),
    supabase.from("progress").select("lesson_id, completed").eq("user_id", user.id),
    list.length
      ? supabase.from("certificates").select("enrollment_id").in("enrollment_id", list.map((e) => e.id))
      : Promise.resolve({ data: [] as { enrollment_id: string }[] }),
  ]);

  const done = new Set((progress ?? []).filter((p) => p.completed).map((p) => p.lesson_id));
  const totals = new Map<string, { total: number; done: number }>();
  for (const row of outline ?? []) {
    const t = totals.get(row.course_id!) ?? { total: 0, done: 0 };
    t.total += 1;
    if (done.has(row.lesson_id!)) t.done += 1;
    totals.set(row.course_id!, t);
  }
  const certified = new Set((certificates ?? []).map((c) => c.enrollment_id));

  return (
    <>
      <PageHeader title="My courses" description="Everything you are enrolled in." />
      {list.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No courses yet"
          description="Once a counsellor sets up your enrolment, your course appears here."
          action={
            <Button asChild>
              <Link href="/courses">Browse courses</Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((e) => {
            const t = totals.get(e.course_id) ?? { total: 0, done: 0 };
            const balance = Number(e.balance_amount ?? 0);
            return (
              <li key={e.id} className="flex flex-col gap-3 rounded-xl border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-display text-lg font-bold leading-tight">{e.course?.title}</p>
                  <AccessBadge status={e.access_status} />
                </div>
                {e.course?.subtitle && <p className="line-clamp-2 text-sm text-muted-foreground">{e.course.subtitle}</p>}
                <Progress value={percent(t.done, t.total)} />
                <p className="text-xs text-muted-foreground">
                  {t.done} of {t.total} lessons complete
                  {balance > 0 ? ` · ${formatInr(balance)} outstanding` : ""}
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  {e.access_status === "suspended" ? (
                    <Button asChild size="sm">
                      <Link href="/dashboard/payments">Pay to unlock</Link>
                    </Button>
                  ) : (
                    <Button asChild size="sm">
                      <Link href={`/dashboard/courses/${e.course_id}`}>Open</Link>
                    </Button>
                  )}
                  {certified.has(e.id) && (
                    <Button asChild size="sm" variant="outline">
                      <Link href="/dashboard/certificates">
                        <Award /> Certificate
                      </Link>
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
