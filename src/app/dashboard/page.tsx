import { BookOpen, CalendarClock, CreditCard, GraduationCap, PlayCircle } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatInr, percent } from "@/lib/utils";

export default async function StudentDashboard() {
  const user = await requireRole("student");
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, course_id, access_status, total_amount, amount_paid, balance_amount, course:courses(id, title, slug, cover_image_url)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const list = enrollments ?? [];
  const courseIds = list.map((e) => e.course_id);

  // lesson counts and completion for each course
  const { data: outline } = courseIds.length
    ? await supabase.from("course_outline").select("course_id, lesson_id").in("course_id", courseIds)
    : { data: [] };
  const { data: progress } = await supabase.from("progress").select("lesson_id, completed, last_watched_at").eq("user_id", user.id);

  const doneLessons = new Set((progress ?? []).filter((p) => p.completed).map((p) => p.lesson_id));
  const totals = new Map<string, { total: number; done: number }>();
  for (const row of outline ?? []) {
    const t = totals.get(row.course_id!) ?? { total: 0, done: 0 };
    t.total += 1;
    if (doneLessons.has(row.lesson_id!)) t.done += 1;
    totals.set(row.course_id!, t);
  }

  // most recently opened lesson, for "continue learning"
  const recent = (progress ?? []).slice().sort((a, b) => (a.last_watched_at < b.last_watched_at ? 1 : -1))[0];
  const recentCourseId = recent ? (outline ?? []).find((o) => o.lesson_id === recent.lesson_id)?.course_id : null;
  const continueEnrollment = list.find((e) => e.course_id === recentCourseId) ?? list.find((e) => e.access_status === "active");

  // next live class across the student's active courses
  const activeCourseIds = list.filter((e) => e.access_status === "active").map((e) => e.course_id);
  const { data: liveLessons } = activeCourseIds.length
    ? await supabase
        .from("lessons")
        .select("id, title, scheduled_at, content_url, module:course_modules!inner(course_id)")
        .eq("lesson_type", "live_class")
        .gte("scheduled_at", new Date().toISOString())
        .in("module.course_id", activeCourseIds)
        .order("scheduled_at", { ascending: true })
        .limit(1)
    : { data: [] };
  const nextLive = (liveLessons ?? [])[0];

  const { data: dueInstallments } = list.length
    ? await supabase
        .from("installments")
        .select("id, amount, due_date, enrollment_id")
        .in("enrollment_id", list.map((e) => e.id))
        .eq("status", "pending")
        .order("due_date", { ascending: true })
        .limit(1)
    : { data: [] };
  const nextDue = (dueInstallments ?? [])[0];

  const balance = list.reduce((s, e) => s + Number(e.balance_amount ?? 0), 0);

  if (list.length === 0) {
    return (
      <>
        <PageHeader title={`Welcome, ${user.profile?.first_name || "there"}`} />
        <EmptyState
          icon={GraduationCap}
          title="You are not enrolled in a course yet"
          description="Browse the catalogue and a counsellor will help you pick the track that fits your degree."
          action={
            <Button asChild>
              <Link href="/courses">Browse courses</Link>
            </Button>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader title={`Welcome, ${user.profile?.first_name || "there"}`} description="Your courses, classes and payments at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Courses" value={list.length} icon={BookOpen} href="/dashboard/courses" />
        <StatCard
          label="Lessons completed"
          value={doneLessons.size}
          hint={`of ${outline?.length ?? 0} in your courses`}
          icon={PlayCircle}
        />
        <StatCard
          label="Balance"
          value={formatInr(balance)}
          hint={balance > 0 ? "Pay to keep access open" : "Nothing outstanding"}
          icon={CreditCard}
          href="/dashboard/payments"
          tone={balance > 0 ? "gold" : "default"}
        />
        <StatCard
          label="Next live class"
          value={nextLive?.scheduled_at ? formatDate(nextLive.scheduled_at) : "None"}
          hint={nextLive?.title ?? "Nothing scheduled"}
          icon={CalendarClock}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {continueEnrollment && (
          <section className="rounded-xl border bg-card p-5">
            <h2 className="font-display text-base font-bold">Continue learning</h2>
            <p className="mt-2 text-lg font-semibold">{continueEnrollment.course?.title}</p>
            {(() => {
              const t = totals.get(continueEnrollment.course_id) ?? { total: 0, done: 0 };
              return (
                <>
                  <Progress value={percent(t.done, t.total)} className="mt-3" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t.done} of {t.total} lessons complete
                  </p>
                </>
              );
            })()}
            <Button asChild className="mt-4">
              <Link href={`/dashboard/courses/${continueEnrollment.course_id}`}>Resume course</Link>
            </Button>
          </section>
        )}

        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-display text-base font-bold">Coming up</h2>
          <ul className="mt-3 flex flex-col gap-4 text-sm">
            <li>
              <p className="text-muted-foreground">Next live class</p>
              {nextLive ? (
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <span className="font-semibold">{nextLive.title}</span>
                  <span className="text-muted-foreground">{formatDate(nextLive.scheduled_at, true)}</span>
                  {nextLive.content_url && (
                    <Button asChild size="sm" variant="gold">
                      <a href={nextLive.content_url} target="_blank" rel="noreferrer">
                        Join
                      </a>
                    </Button>
                  )}
                </div>
              ) : (
                <p className="mt-1">Nothing scheduled right now.</p>
              )}
            </li>
            <li>
              <p className="text-muted-foreground">Next installment</p>
              {nextDue ? (
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <span className="font-semibold">{formatInr(nextDue.amount)}</span>
                  <span className="text-muted-foreground">due {formatDate(nextDue.due_date)}</span>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/dashboard/payments">Pay now</Link>
                  </Button>
                </div>
              ) : (
                <p className="mt-1">No installments due.</p>
              )}
            </li>
          </ul>
        </section>
      </div>

      <h2 className="mt-8 font-display text-lg font-bold">Your courses</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((e) => {
          const t = totals.get(e.course_id) ?? { total: 0, done: 0 };
          return (
            <li key={e.id} className="flex flex-col gap-3 rounded-xl border bg-card p-5">
              <p className="font-display text-lg font-bold leading-tight">{e.course?.title}</p>
              <Progress value={percent(t.done, t.total)} />
              <p className="text-xs text-muted-foreground">
                {t.done} of {t.total} lessons complete
              </p>
              <Button asChild variant={e.access_status === "active" ? "default" : "outline"} size="sm" className="mt-auto self-start">
                <Link href={e.access_status === "active" ? `/dashboard/courses/${e.course_id}` : "/dashboard/payments"}>
                  {e.access_status === "active" ? "Open" : "Pay to unlock"}
                </Link>
              </Button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
