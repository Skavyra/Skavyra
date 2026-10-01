import Image from "next/image";
import { ArrowRight, BookOpen, CalendarClock, CreditCard, GraduationCap, PlayCircle } from "lucide-react";
import Link from "next/link";

import { DashboardDataError } from "@/components/dashboard/DashboardDataError";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { AccessBadge } from "@/components/dashboard/StatusBadge";
import { StatCard } from "@/components/dashboard/StatCard";
import { StudentDashboardMotion } from "@/components/dashboard/StudentDashboardMotion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { requireRole } from "@/lib/auth/require-role";
import { calculateCourseProgress } from "@/lib/dashboard/progress";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatInr, percent } from "@/lib/utils";

export default async function StudentDashboard() {
  const user = await requireRole("student");
  const supabase = await createClient();

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select("id, course_id, access_status, total_amount, amount_paid, balance_amount, course:courses(id, title, slug, cover_image_url)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (enrollmentsError) return <DashboardDataError />;

  const list = enrollments ?? [];
  const courseIds = list.map((enrollment) => enrollment.course_id);
  if (list.length === 0) {
    const name = user.profile?.first_name?.trim();
    return (
      <StudentDashboardMotion>
        <div data-dashboard-reveal>
          <PageHeader
            title={name ? `Welcome back, ${name}` : "Welcome back"}
            description="Your next step starts with a course that fits your goals."
          />
        </div>
        <div data-dashboard-reveal>
          <EmptyState
            icon={GraduationCap}
            title="You are not enrolled in a course yet"
            description="Browse the catalogue and a counsellor will help you pick the track that fits your degree."
            action={
              <Button asChild variant="gold">
                <Link href="/courses">Explore courses <ArrowRight /></Link>
              </Button>
            }
          />
        </div>
      </StudentDashboardMotion>
    );
  }

  const activeCourseIds = list.filter((enrollment) => enrollment.access_status === "active").map((enrollment) => enrollment.course_id);
  const [{ data: outline, error: outlineError }, { data: progress, error: progressError }, { data: liveLessons, error: liveError }, { data: dueInstallments, error: installmentError }] = await Promise.all([
    supabase.from("course_outline").select("course_id, lesson_id, lesson_title").in("course_id", courseIds),
    supabase.from("progress").select("lesson_id, completed, last_watched_at").eq("user_id", user.id),
    activeCourseIds.length
      ? supabase
          .from("lessons")
          .select("id, title, scheduled_at, content_url, module:course_modules!inner(course_id)")
          .eq("lesson_type", "live_class")
          .gte("scheduled_at", new Date().toISOString())
          .in("module.course_id", activeCourseIds)
          .order("scheduled_at", { ascending: true })
          .limit(1)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("installments")
      .select("id, amount, due_date, enrollment_id")
      .in("enrollment_id", list.map((enrollment) => enrollment.id))
      .eq("status", "pending")
      .order("due_date", { ascending: true })
      .limit(1),
  ]);

  if (outlineError || progressError || liveError || installmentError) return <DashboardDataError />;

  const outlineRows = outline ?? [];
  const progressRows = progress ?? [];
  const courseProgress = calculateCourseProgress(outlineRows, progressRows);
  const enrollmentByCourse = new Map(list.map((enrollment) => [enrollment.course_id, enrollment]));
  const outlineByLesson = new Map(outlineRows.filter((row) => row.course_id && row.lesson_id).map((row) => [row.lesson_id!, row]));

  // Resume the enrolled course containing the user's last genuinely opened lesson.
  const recent = progressRows
    .filter((row) => outlineByLesson.has(row.lesson_id) && enrollmentByCourse.has(outlineByLesson.get(row.lesson_id)!.course_id!))
    .slice()
    .sort((a, b) => b.last_watched_at.localeCompare(a.last_watched_at))[0];
  const recentOutline = recent ? outlineByLesson.get(recent.lesson_id) : undefined;
  const continueEnrollment = (recentOutline?.course_id ? enrollmentByCourse.get(recentOutline.course_id) : undefined)
    ?? list.find((enrollment) => enrollment.access_status === "active")
    ?? list.find((enrollment) => enrollment.access_status === "completed");
  const continueLesson = recentOutline && recentOutline.course_id === continueEnrollment?.course_id ? recentOutline : undefined;
  const nextLive = liveLessons?.[0];
  const nextDue = dueInstallments?.[0];
  const balance = list.reduce((sum, enrollment) => sum + Number(enrollment.balance_amount ?? 0), 0);
  const name = user.profile?.first_name?.trim();

  return (
    <StudentDashboardMotion>
      <div data-dashboard-reveal>
        <PageHeader
          title={name ? `Welcome back, ${name}` : "Welcome back"}
          description="Pick up where you left off and keep your learning moving."
          actions={
            <Button asChild variant="outline" size="sm">
              <Link href="/courses">Explore courses</Link>
            </Button>
          }
        />
      </div>

      <section data-dashboard-reveal aria-label="Learning overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="My courses" value={list.length} icon={BookOpen} href="/dashboard/courses" />
        <StatCard
          label="Lessons completed"
          value={courseProgress.completedLessons}
          hint={`of ${courseProgress.totalLessons} in your courses`}
          icon={PlayCircle}
        />
        <StatCard
          label="Balance"
          value={formatInr(balance)}
          hint={balance > 0 ? "Outstanding across your enrollments" : "Nothing outstanding"}
          icon={CreditCard}
          href="/dashboard/payments"
          tone={balance > 0 ? "gold" : "default"}
        />
        <StatCard
          label="Next live class"
          value={nextLive?.scheduled_at ? formatDate(nextLive.scheduled_at) : "None scheduled"}
          hint={nextLive?.title ?? "Check back for your next class"}
          icon={CalendarClock}
        />
      </section>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        {continueEnrollment ? (
          <section data-dashboard-reveal aria-labelledby="continue-learning-heading" className="group overflow-hidden rounded-2xl border border-gold-500/25 bg-card shadow-[0_20px_50px_-40px_rgba(13,13,13,0.5)] transition-[border-color,box-shadow] duration-300 hover:border-gold-500/45 hover:shadow-[0_26px_60px_-38px_rgba(142,103,24,0.38)]">
            <div className="grid min-h-full sm:grid-cols-[minmax(12rem,0.85fr)_minmax(0,1.15fr)]">
              <div className="relative aspect-[16/9] bg-ink sm:aspect-auto sm:min-h-64">
                {continueEnrollment.course?.cover_image_url ? (
                  <Image
                    src={continueEnrollment.course.cover_image_url}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 35vw, 100vw"
                    className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="grid size-full place-items-center text-ivory/70">
                    <BookOpen className="size-10" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-700">Continue learning</p>
                <div className="mt-3 flex w-full items-start justify-between gap-3">
                  <h2 id="continue-learning-heading" className="font-display text-xl font-bold leading-tight">
                    {continueEnrollment.course?.title ?? "Your course"}
                  </h2>
                  <AccessBadge status={continueEnrollment.access_status} />
                </div>
                {continueLesson?.lesson_title ? (
                  <p className="mt-2 text-sm text-muted-foreground">Last opened: <span className="font-semibold text-foreground">{continueLesson.lesson_title}</span></p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">Your course is ready when you are.</p>
                )}
                {(() => {
                  const value = courseProgress.byCourse.get(continueEnrollment.course_id) ?? { total: 0, done: 0 };
                  return value.total > 0 ? (
                    <div className="mt-5 w-full">
                      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                        <span className="text-muted-foreground">Course progress</span>
                        <span className="font-semibold">{percent(value.done, value.total)}% · {value.done} of {value.total} lessons</span>
                      </div>
                      <Progress value={percent(value.done, value.total)} aria-label={`${value.done} of ${value.total} lessons complete`} />
                    </div>
                  ) : (
                    <p className="mt-5 text-xs text-muted-foreground">Progress appears when lessons are available.</p>
                  );
                })()}
                <Button
                  asChild
                  variant="gold"
                  className="mt-5 w-full justify-between sm:w-auto"
                >
                  <Link
                    href={
                      continueEnrollment.access_status === "active" || continueEnrollment.access_status === "completed"
                        ? `/dashboard/courses/${continueEnrollment.course_id}${recent && continueLesson ? `?lesson=${encodeURIComponent(recent.lesson_id)}` : ""}`
                        : "/dashboard/payments"
                    }
                  >
                    {continueEnrollment.access_status === "completed" ? "Review course" : continueEnrollment.access_status === "active" ? "Continue course" : "View access and payments"}
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        ) : (
          <section data-dashboard-reveal aria-labelledby="continue-learning-heading" className="flex min-h-56 flex-col justify-center rounded-2xl border bg-card p-6">
            <h2 id="continue-learning-heading" className="font-display text-lg font-bold">Your learning is ready</h2>
            <p className="mt-2 text-sm text-muted-foreground">Choose one of your courses to open its learning space.</p>
            <Button asChild variant="gold" className="mt-5 self-start">
              <Link href="/dashboard/courses">View my courses <ArrowRight /></Link>
            </Button>
          </section>
        )}

          <section data-dashboard-reveal aria-labelledby="coming-up-heading" className="rounded-2xl border border-ink/10 bg-card p-5 shadow-[0_16px_40px_-34px_rgba(13,13,13,0.4)] sm:p-6">
          <h2 id="coming-up-heading" className="font-display text-base font-bold">Coming up</h2>
          <ul className="mt-4 flex flex-col gap-5 text-sm">
            <li className="border-b pb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Next live class</p>
              {nextLive ? (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{nextLive.title}</p>
                    <p className="mt-1 text-muted-foreground">{formatDate(nextLive.scheduled_at, true)}</p>
                  </div>
                  {nextLive.content_url && (
                    <Button asChild size="sm" variant="gold">
                      <a href={nextLive.content_url} target="_blank" rel="noreferrer">Join class</a>
                    </Button>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-muted-foreground">Nothing scheduled right now.</p>
              )}
            </li>
            <li>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Next installment</p>
              {nextDue ? (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{formatInr(nextDue.amount)}</p>
                    <p className="mt-1 text-muted-foreground">Due {formatDate(nextDue.due_date)}</p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/dashboard/payments">View payments</Link>
                  </Button>
                </div>
              ) : (
                <p className="mt-2 text-muted-foreground">No installments due.</p>
              )}
            </li>
          </ul>
        </section>
      </div>

      <section data-dashboard-reveal aria-labelledby="my-courses-heading" className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-700">Your learning</p>
            <h2 id="my-courses-heading" className="mt-1 font-display text-xl font-bold">My courses</h2>
          </div>
          <Link href="/dashboard/courses" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
            View all <ArrowRight className="size-4" />
          </Link>
        </div>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {list.map((enrollment) => {
            const value = courseProgress.byCourse.get(enrollment.course_id) ?? { total: 0, done: 0 };
            const canOpen = enrollment.access_status === "active" || enrollment.access_status === "completed";
            return (
              <li key={enrollment.id} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-ink/10 bg-card shadow-[0_12px_32px_-28px_rgba(13,13,13,0.45)] transition-[border-color,box-shadow,transform] duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-gold-500/40 motion-safe:hover:shadow-[0_22px_44px_-30px_rgba(142,103,24,0.42)]">
                <div className="relative aspect-[16/8] overflow-hidden bg-ink">
                  {enrollment.course?.cover_image_url ? (
                    <Image src={enrollment.course.cover_image_url} alt="" fill sizes="(min-width: 1536px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.02]" />
                  ) : (
                    <div className="grid size-full place-items-center text-ivory/70"><BookOpen className="size-8" aria-hidden="true" /></div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 font-display text-lg font-bold leading-tight">{enrollment.course?.title ?? "Course"}</h3>
                    <AccessBadge status={enrollment.access_status} />
                  </div>
                  {value.total > 0 ? (
                    <div className="mt-4">
                      <div className="mb-2 flex justify-between gap-3 text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span className="font-semibold text-foreground">{percent(value.done, value.total)}%</span>
                      </div>
                      <Progress value={percent(value.done, value.total)} aria-label={`${value.done} of ${value.total} lessons complete`} />
                      <p className="mt-2 text-xs text-muted-foreground">{value.done} of {value.total} lessons complete</p>
                    </div>
                  ) : (
                    <p className="mt-4 text-xs text-muted-foreground">Lesson progress will appear when lessons are available.</p>
                  )}
                  <Button asChild size="sm" variant={canOpen ? "gold" : "outline"} className="mt-5 self-start">
                    <Link href={canOpen ? `/dashboard/courses/${enrollment.course_id}` : "/dashboard/payments"}>
                      {canOpen ? "Open course" : "View access and payments"} <ArrowRight />
                    </Link>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </StudentDashboardMotion>
  );
}
