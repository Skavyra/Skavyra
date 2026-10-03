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
import { Button } from "@/components/ui/button";
import { CourseContentSection, CourseContentList, courseContentLines } from "@/components/marketing/CourseContentSection";
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
  const { data } = await supabase.from("courses").select("title, subtitle").eq("slug", slug).eq("status", "published").maybeSingle();
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
    if (row.lesson_id) m.lessons.push(row);
  }
  const lessonCount = modules.reduce((sum, module) => sum + module.lessons.length, 0);
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

  const outcomes = courseContentLines(course.learning_outcomes);
  const audience = courseContentLines(course.target_audience);
  const prerequisites = courseContentLines(course.prerequisites);
  const projects = courseContentLines(course.projects);
  const sections = [
    ...(course.description?.trim() ? [{ id: "overview", label: "Overview" }] : []),
    ...(outcomes.length ? [{ id: "skills", label: "What you'll learn" }] : []),
    ...(audience.length ? [{ id: "audience", label: "Who it's for" }] : []),
    ...(prerequisites.length ? [{ id: "prerequisites", label: "Prerequisites" }] : []),
    ...(modules.length ? [{ id: "curriculum", label: "Curriculum" }] : []),
    ...(projects.length ? [{ id: "projects", label: "Projects" }] : []),
    ...(course.mentor_name?.trim() || course.mentor_bio?.trim() ? [{ id: "mentor", label: "Mentor" }] : []),
    ...(FAQS.length ? [{ id: "faq", label: "FAQ" }] : []),
  ];

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
          <div data-course-summary className="min-w-0 rounded-3xl border border-ink/10 theme-ink bg-[radial-gradient(ellipse_at_top_right,rgba(242,199,92,0.16),transparent_60%)] bg-background text-foreground p-6 sm:p-10 lg:col-start-1 lg:row-start-1">
            <div data-course-badges className="flex flex-wrap gap-2">
              <Badge tone="gold">{CATEGORY_LABEL[course.category]}</Badge>
              <Badge tone="muted">{LEVEL_LABEL[course.level]}</Badge>
            </div>
            <h1 data-course-title className="mt-4 break-words text-fluid-3xl">{course.title}</h1>
            {course.subtitle && (
              <p data-course-subtitle className="mt-4 max-w-2xl text-fluid-lg text-muted-foreground">{course.subtitle}</p>
            )}
            <dl data-course-metadata className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-t border-ivory/15 pt-5 text-sm">
              {course.duration_weeks && (
                <div className="flex gap-1.5">
                  <dt className="text-muted-foreground">Duration</dt>
                  <dd className="font-semibold">{course.duration_weeks} weeks</dd>
                </div>
              )}
              {lessonCount > 0 && <div className="flex gap-1.5"><dt className="text-muted-foreground">Lessons</dt><dd className="font-semibold">{lessonCount}</dd></div>}
              {totalMinutes > 0 && (
                <div className="flex gap-1.5">
                  <dt className="text-muted-foreground">Recorded content</dt>
                  <dd className="font-semibold">{totalMinutes < 60 ? `${totalMinutes} min` : `${Math.floor(totalMinutes / 60)} hr${totalMinutes % 60 ? ` ${totalMinutes % 60} min` : ""}`}</dd>
                </div>
              )}
              {course.language && (
                <div className="flex gap-1.5">
                  <dt className="text-muted-foreground">Language</dt>
                  <dd className="font-semibold">{course.language}</dd>
                </div>
              )}
            </dl>
            {course.mentor_name?.trim() && <p className="mt-6 text-sm text-ivory/80">Taught by <span className="font-semibold text-gold-300">{course.mentor_name}</span>{course.mentor_company ? ` · ${course.mentor_company}` : ""}</p>}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="gold" size="lg">
                <Link href={
                  state === "enrolled" && enrolledHref
                    ? enrolledHref
                    : state === "guest"
                      ? `/signup?next=${encodeURIComponent(`/courses/${course.slug}`)}`
                      : `/contact?course=${encodeURIComponent(course.title)}`
                }>
                  {state === "enrolled" && enrolledHref ? "Continue learning" : state === "guest" ? "Enroll now" : "Talk to a counsellor"}
                </Link>
              </Button>
              {modules.length > 0 && <Button asChild variant="outline" size="lg"><a href="#curriculum">View curriculum</a></Button>}
            </div>
          </div>

          <div id="enrollment" className="min-w-0 scroll-mt-28 lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1">
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
            <nav aria-label="Course sections" className="mb-6 flex flex-wrap gap-2">
              {sections.map((section) => <a key={section.id} href={`#${section.id}`} className="rounded-full border border-ink/10 bg-card px-4 py-2 text-sm font-semibold transition-colors hover:border-gold-500 hover:bg-gold-100/30">{section.label}</a>)}
            </nav>
            <div className="space-y-6">
              {course.description?.trim() && <CourseContentSection id="overview" eyebrow="The course" title="What this course covers"><p className="whitespace-pre-line break-words leading-relaxed text-muted-foreground">{course.description}</p></CourseContentSection>}
              {outcomes.length > 0 && <CourseContentSection id="skills" eyebrow="Your skills" title="What you'll learn"><CourseContentList items={outcomes} columns /></CourseContentSection>}
              {audience.length > 0 && <CourseContentSection id="audience" eyebrow="Find your fit" title="Who this course is for"><CourseContentList items={audience} columns /></CourseContentSection>}
              {prerequisites.length > 0 && <CourseContentSection id="prerequisites" eyebrow="Before you begin" title="What you'll need"><CourseContentList items={prerequisites} /></CourseContentSection>}
              {modules.length > 0 && <CourseContentSection id="curriculum" eyebrow="The learning path" title="Course curriculum">
                <p className="mb-5 text-sm text-muted-foreground">{modules.length} {modules.length === 1 ? "module" : "modules"} · {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}</p>
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
              </CourseContentSection>}
              {projects.length > 0 && <CourseContentSection id="projects" eyebrow="Put it into practice" title="What you'll build">
                <ol className="grid gap-4 sm:grid-cols-2">{projects.map((project, index) => <li key={index} className="rounded-2xl border border-gold-500/25 bg-gold-100/10 p-5"><span className="font-display text-3xl text-gold-700">{String(index + 1).padStart(2, "0")}</span><p className="mt-3 break-words text-sm leading-relaxed">{project}</p></li>)}</ol>
              </CourseContentSection>}
              {(course.mentor_name?.trim() || course.mentor_bio?.trim()) && <CourseContentSection id="mentor" eyebrow="Meet your guide" title="Your course mentor">
                {course.mentor_name?.trim() && <div className="flex items-center gap-4">
                  <Avatar className="size-16 shrink-0">{course.mentor_avatar_url && <AvatarImage src={course.mentor_avatar_url} alt="" />}<AvatarFallback>{initials(course.mentor_name)}</AvatarFallback></Avatar>
                  <div className="min-w-0 break-words"><h3 className="text-lg">{course.mentor_name}</h3>{course.mentor_company && <p className="mt-1 text-sm text-muted-foreground">{course.mentor_company}</p>}</div>
                </div>}
                {course.mentor_bio?.trim() && <p className="mt-5 whitespace-pre-line break-words leading-relaxed text-muted-foreground">{course.mentor_bio}</p>}
              </CourseContentSection>}
              {FAQS.length > 0 && <CourseContentSection id="faq" eyebrow="Good to know" title="Frequently asked questions">
                <Accordion type="single" collapsible className="flex flex-col gap-3">{FAQS.map((faq) => <AccordionItem key={faq.q} value={faq.q} className="rounded-xl border-ink/10"><AccordionTrigger>{faq.q}</AccordionTrigger><AccordionContent>{faq.a}</AccordionContent></AccordionItem>)}</Accordion>
              </CourseContentSection>}
            </div>
          </div>
        </div>
      </div>
    </CourseDetailMotion>
  );
}
