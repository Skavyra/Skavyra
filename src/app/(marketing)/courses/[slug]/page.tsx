import { ChevronRight, FileText, Lock, PlayCircle, Video } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EnrollCard } from "@/components/marketing/EnrollCard";
import { CourseDetailMotion } from "@/components/marketing/CourseDetailMotion";
import { PreviewLesson } from "@/components/player/PreviewLesson";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUser } from "@/lib/auth/get-user";
import { CATEGORY_LABEL, LEVEL_LABEL } from "@/lib/constants";
import { FAQS } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import { initials } from "@/lib/utils";
import type { LessonType } from "@/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("courses").select("title, subtitle").eq("slug", slug).maybeSingle();
  return data ? { title: data.title, description: data.subtitle ?? undefined } : { title: "Course" };
}

const TYPE_ICON: Record<LessonType, typeof PlayCircle> = { video: PlayCircle, document: FileText, live_class: Video, link: FileText };

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase.from("courses").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
  if (!course) notFound();

  const { data: outline } = await supabase
    .from("course_outline")
    .select("*")
    .eq("course_id", course.id)
    .order("module_order", { ascending: true })
    .order("lesson_order", { ascending: true });

  // group the flat syllabus view into modules
  const modules: { id: string; title: string; lessons: NonNullable<typeof outline> }[] = [];
  for (const row of outline ?? []) {
    let m = modules.find((x) => x.id === row.module_id);
    if (!m) {
      m = { id: row.module_id!, title: row.module_title ?? "", lessons: [] };
      modules.push(m);
    }
    m.lessons.push(row);
  }
  const lessonCount = outline?.length ?? 0;
  const totalMinutes = (outline ?? []).reduce((s, l) => s + (l.duration_minutes ?? 0), 0);

  const user = await getUser();
  let state: "guest" | "student" | "enrolled" | "staff" = "guest";
  let enrolledHref: string | undefined;
  if (user) {
    if (user.roles.includes("admin") || user.roles.includes("employee")) state = "staff";
    else {
      const { data: enr } = await supabase.from("enrollments").select("id").eq("user_id", user.id).eq("course_id", course.id).maybeSingle();
      state = enr ? "enrolled" : "student";
      if (enr) enrolledHref = `/dashboard/courses/${course.id}`;
    }
  }

  return (
    <CourseDetailMotion>
      <div className="container section">
        <nav data-course-breadcrumb aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/courses" className="transition-colors hover:text-gold-700">
            Courses
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="truncate text-foreground">{course.title}</span>
        </nav>

        <div className="mt-6 grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-y-10">
          <div data-course-summary className="min-w-0 rounded-3xl border border-ink/10 bg-[radial-gradient(ellipse_at_top_right,rgba(242,199,92,0.12),transparent_42%),rgba(255,255,255,0.58)] p-6 sm:p-8 lg:col-start-1 lg:row-start-1">
            <div data-course-badges className="flex flex-wrap gap-2">
              <Badge tone="gold">{CATEGORY_LABEL[course.category]}</Badge>
              <Badge tone="muted">{LEVEL_LABEL[course.level]}</Badge>
            </div>
            <h1 data-course-title className="mt-4 break-words text-fluid-3xl">{course.title}</h1>
            {course.subtitle && (
              <p data-course-subtitle className="mt-4 max-w-2xl text-fluid-lg text-muted-foreground">{course.subtitle}</p>
            )}
            <dl data-course-metadata className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-t border-ink/10 pt-5 text-sm">
              {course.duration_weeks && (
                <div className="flex gap-1.5">
                  <dt className="text-muted-foreground">Duration</dt>
                  <dd className="font-semibold">{course.duration_weeks} weeks</dd>
                </div>
              )}
              <div className="flex gap-1.5">
                <dt className="text-muted-foreground">Lessons</dt>
                <dd className="font-semibold">{lessonCount}</dd>
              </div>
              {totalMinutes > 0 && (
                <div className="flex gap-1.5">
                  <dt className="text-muted-foreground">Recorded content</dt>
                  <dd className="font-semibold">{Math.round(totalMinutes / 60)} hours</dd>
                </div>
              )}
              {course.language && (
                <div className="flex gap-1.5">
                  <dt className="text-muted-foreground">Language</dt>
                  <dd className="font-semibold">{course.language}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <EnrollCard
              course={{
                title: course.title,
                slug: course.slug,
                price: Number(course.price),
                mrp: course.mrp === null ? null : Number(course.mrp),
                cover_image_url: course.cover_image_url,
                allows_partial: course.allows_partial,
                duration_weeks: course.duration_weeks,
                language: course.language,
              }}
              state={state}
              enrolledHref={enrolledHref}
            />
          </div>

          <div data-course-content className="min-w-0 lg:col-start-1 lg:row-start-2">
            <Tabs defaultValue="syllabus" className="rounded-3xl border border-ink/10 bg-card/70 p-4 shadow-[0_16px_40px_-34px_rgba(13,13,13,0.4)] sm:p-6">
              <TabsList>
                <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
                <TabsTrigger value="mentor">Mentor</TabsTrigger>
                <TabsTrigger value="build">What you will build</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>

              <TabsContent value="syllabus" className="data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1 duration-200">
                {modules.length === 0 ? (
                  <p className="text-muted-foreground">The syllabus is being finalised.</p>
                ) : (
                  <Accordion type="multiple" defaultValue={[modules[0].id]} className="flex flex-col gap-3">
                    {modules.map((m, mi) => (
                      <AccordionItem
                        key={m.id}
                        value={m.id}
                        className="overflow-hidden rounded-xl border-ink/10 bg-card transition-[border-color,box-shadow] data-[state=open]:border-gold-500/50 data-[state=open]:shadow-sm"
                      >
                        <AccordionTrigger className="transition-colors hover:bg-muted/60 data-[state=open]:bg-gold-100/20">
                          <span className="flex flex-1 items-center justify-between gap-4">
                            <span>
                              <span className="mr-2 text-muted-foreground">Module {mi + 1}</span>
                              {m.title}
                            </span>
                            <span className="shrink-0 text-xs font-normal text-muted-foreground">{m.lessons.length} lessons</span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-3">
                          <ul className="flex flex-col">
                            {m.lessons.map((l) => {
                              const Icon = TYPE_ICON[l.lesson_type ?? "video"];
                              return (
                                <li key={l.lesson_id} className="flex items-center gap-3 border-t px-2 py-3 text-foreground transition-colors hover:bg-muted/40">
                                  <Icon className="size-4 shrink-0 text-gold-700" />
                                  <span className="min-w-0 flex-1 truncate">{l.lesson_title}</span>
                                  {l.is_preview ? (
                                    <PreviewLesson lessonId={l.lesson_id!} title={l.lesson_title ?? ""} />
                                  ) : (
                                    <Lock className="size-3.5 text-muted-foreground" aria-label="Unlocks after enrolment" />
                                  )}
                                  {!!l.duration_minutes && (
                                    <span className="w-14 text-right text-xs text-muted-foreground">{l.duration_minutes} min</span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </TabsContent>

              <TabsContent value="mentor" className="data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1 duration-200">
                {course.mentor_name ? (
                  <div className="group flex items-center gap-4 rounded-2xl border border-ink/10 bg-card p-5 shadow-sm">
                    <Avatar className="size-16 transition-transform duration-200 motion-safe:group-hover:scale-105">
                      {course.mentor_avatar_url && <AvatarImage src={course.mentor_avatar_url} alt="" />}
                      <AvatarFallback className="text-base">{initials(course.mentor_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-display text-lg font-bold">{course.mentor_name}</p>
                      {course.mentor_company && <p className="text-sm text-muted-foreground">{course.mentor_company}</p>}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">The mentor for this course will be announced soon.</p>
                )}
              </TabsContent>

              <TabsContent value="build" className="data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1 duration-200">
                {course.description ? (
                  <div className="max-w-3xl rounded-2xl border border-ink/10 bg-card p-5 leading-relaxed text-foreground/85 shadow-sm sm:p-7">
                    <p className="whitespace-pre-line">{course.description}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Project details will be added soon.</p>
                )}
              </TabsContent>

              <TabsContent value="faq" className="data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1 duration-200">
                <Accordion type="single" collapsible className="flex flex-col gap-3">
                  {FAQS.map((f) => (
                    <AccordionItem
                      key={f.q}
                      value={f.q}
                      className="overflow-hidden rounded-xl border-ink/10 bg-card transition-[border-color,box-shadow] data-[state=open]:border-gold-500/50 data-[state=open]:shadow-sm"
                    >
                      <AccordionTrigger className="transition-colors hover:bg-muted/60 data-[state=open]:bg-gold-100/20">{f.q}</AccordionTrigger>
                      <AccordionContent>{f.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </CourseDetailMotion>
  );
}
