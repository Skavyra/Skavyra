import { ArrowRight, ChevronRight, FileText, Lock, Phone, PlayCircle, Star, Video } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EnrollCard } from "@/components/marketing/EnrollCard";
import { CourseBand, CourseTabsNav } from "@/components/marketing/CourseDetailClient";
import { CourseDetailMotion } from "@/components/marketing/CourseDetailMotion";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { PreviewLesson } from "@/components/player/PreviewLesson";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CourseContentSection, CourseContentList, courseContentLines } from "@/components/marketing/CourseContentSection";
import { MobileEnrollBar } from "@/components/marketing/MobileEnrollBar";
import { getUser } from "@/lib/auth/get-user";
import { CATEGORY_LABEL, LEVEL_LABEL } from "@/lib/constants";
import { FAQS } from "@/lib/content";
import { visibleStatuses } from "@/lib/flagship";
import { createClient } from "@/lib/supabase/server";
import { initials } from "@/lib/utils";
import type { LessonType } from "@/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("courses").select("title, subtitle").eq("slug", slug).in("status", visibleStatuses()).maybeSingle();
  return data ? { title: data.title, description: data.subtitle ?? undefined } : { title: "Course" };
}

const TYPE_ICON: Record<LessonType, typeof PlayCircle> = { video: PlayCircle, document: FileText, live_class: Video, link: FileText };

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase.from("courses").select("*").eq("slug", slug).in("status", visibleStatuses()).maybeSingle();
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
    ...(course.tools?.length ? [{ id: "tools", label: "Tools you'll use" }] : []),
    ...(course.mentor_name?.trim() || course.mentor_bio?.trim() ? [{ id: "mentor", label: "Mentor" }] : []),
    ...(FAQS.length ? [{ id: "faq", label: "FAQ" }] : []),
  ];
  const primaryHref = state === "enrolled" && enrolledHref
    ? enrolledHref
    : state === "guest"
      ? `/signup?next=${encodeURIComponent(`/courses/${course.slug}`)}`
      : `/contact?course=${encodeURIComponent(course.title)}`;
  const primaryLabel = state === "enrolled" && enrolledHref
    ? "Continue learning"
    : state === "guest"
      ? "Enroll now"
      : "Talk to a counsellor";

  return (
    <CourseDetailMotion>
      <div className="cd">
        <CourseBand />
        <div className="wrap cd__grid">
          <div className="cd__main">
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <ChevronRight className="ic" strokeWidth={1.75} aria-hidden="true" />
              <Link href="/courses">Courses</Link>
              <ChevronRight className="ic" strokeWidth={1.75} aria-hidden="true" />
              <b>{course.title}</b>
            </nav>

            <div className="reveal">
              <div className="cd__badges">
                {course.is_flagship && <span className="tag tag--ink"><Star className="ic" strokeWidth={1.75} />Flagship</span>}
                <span className="tag tag--y">{CATEGORY_LABEL[course.category]}</span>
                <span className="tag">{LEVEL_LABEL[course.level]}</span>
              </div>
              <h1 className="cd__t" data-course-title>{course.title}</h1>
              {course.subtitle && <p className="cd__s">{course.subtitle}</p>}
              <dl className="cd__meta">
                {course.duration_weeks && <div><dt>Duration</dt><dd>{course.duration_weeks} weeks</dd></div>}
                {course.language && <div><dt>Language</dt><dd>{course.language}</dd></div>}
                <div><dt>Level</dt><dd>{LEVEL_LABEL[course.level]}</dd></div>
              </dl>
              {course.mentor_name?.trim() && <p className="cd__by"><span className="mono">{initials(course.mentor_name)}</span><span>Taught by <b>{course.mentor_name}</b>{course.mentor_company ? ` · ${course.mentor_company}` : ""}</span></p>}
              <div className="btns">
                <Link className="btn btn--y btn--lg" href={primaryHref}>{primaryLabel}<ArrowRight className="ic" strokeWidth={1.75} /></Link>
                {primaryLabel !== "Talk to a counsellor" && <Link className="btn btn--line btn--lg" href={`/contact?course=${encodeURIComponent(course.title)}`}><Phone className="ic" strokeWidth={1.75} />Talk to a counsellor</Link>}
              </div>
            </div>

            <CourseTabsNav sections={sections} />
            {course.description?.trim() && <CourseContentSection id="overview" eyebrow="The course" title="What this course covers"><p className="csec__p" style={{ whiteSpace: "pre-line" }}>{course.description}</p></CourseContentSection>}
                {outcomes.length > 0 && <CourseContentSection id="skills" eyebrow="Your skills" title="What you'll learn"><CourseContentList items={outcomes} columns /></CourseContentSection>}
                {audience.length > 0 && <CourseContentSection id="audience" eyebrow="Find your fit" title="Who this course is for"><CourseContentList items={audience} columns /></CourseContentSection>}
                {prerequisites.length > 0 && <CourseContentSection id="prerequisites" eyebrow="Before you begin" title="What you'll need"><CourseContentList items={prerequisites} /></CourseContentSection>}
                {modules.length > 0 && <CourseContentSection id="curriculum" eyebrow="The learning path" title="Course curriculum">
                  <p className="csec__p">{modules.length} {modules.length === 1 ? "module" : "modules"} · {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}</p>
                    <Accordion type="multiple" defaultValue={[modules[0].id]} className="flex flex-col gap-3">
                      {modules.map((m, mi) => (
                        <AccordionItem
                          key={m.id}
                          value={m.id}
                          className="overflow-hidden rounded-[22px] border border-[#EFE6C4] bg-white px-[22px] data-[state=open]:border-[#0D0D0D]"
                        >
                          <AccordionTrigger className="px-1 py-[22px] text-[18px] font-semibold text-[#0D0D0D]">
                            <span className="flex flex-1 items-center justify-between gap-4">
                              <span>
                                <span className="mr-2 text-[13px] font-bold uppercase text-[#8E6718]">Module {mi + 1}</span>
                                {m.title}
                              </span>
                              <span className="shrink-0 text-[14px] font-normal text-[#5C5B57]">{m.lessons.length} lessons</span>
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="px-0">
                            <ul className="flex flex-col">
                              {m.lessons.map((l) => {
                                const Icon = TYPE_ICON[l.lesson_type ?? "video"];
                                return (
                                  <li key={l.lesson_id} className="flex items-center gap-3 border-t border-[#E6E4DE] px-1 py-3 text-[15px]">
                                    <Icon className="ic shrink-0 text-[#8E6718]" strokeWidth={1.75} />
                                    <span className="min-w-0 flex-1 truncate">{l.lesson_title}</span>
                                    {l.is_preview ? <PreviewLesson lessonId={l.lesson_id!} title={l.lesson_title ?? ""} /> : <Lock className="ic size-4 text-[#8E6718]" strokeWidth={1.75} aria-label="Unlocks after enrolment" />}
                                    {!!l.duration_minutes && <span className="w-14 text-right text-sm text-[#5C5B57]">{l.duration_minutes} min</span>}
                                  </li>
                                );
                              })}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                </CourseContentSection>}
                {projects.length > 0 && <CourseContentSection id="projects" eyebrow="Put it into practice" title="What you'll build" tone="dark">
                  <ol className="projects">
                    {projects.map((project, index) => {
                      const separators = [" \u2014 ", " - "]
                        .map((separator) => ({ separator, index: project.indexOf(separator) }))
                        .filter((match) => match.index >= 0)
                        .sort((a, b) => a.index - b.index);
                      const split = separators[0];
                      const projectTitle = split ? project.slice(0, split.index).trim() : null;
                      const projectDescription = split ? project.slice(split.index + split.separator.length).trim() : project;

                      return (
                        <li className="proj" key={index}>
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          {projectTitle && <h3>{projectTitle}</h3>}
                          <p>{projectDescription}</p>
                        </li>
                      );
                    })}
                  </ol>
                </CourseContentSection>}
                {!!course.tools?.length && <CourseContentSection id="tools" eyebrow="Tools" title="Tools you'll use"><ul className="chips">{course.tools.map((tool) => <li className="chip" key={tool}>{tool}</li>)}</ul></CourseContentSection>}
                {(course.mentor_name?.trim() || course.mentor_bio?.trim()) && <CourseContentSection id="mentor" eyebrow="Meet your guide" title="Your course mentor">
                  {course.mentor_name?.trim() && <div className="mentorbox">
                    {course.mentor_avatar_url ? <img src={course.mentor_avatar_url} alt="" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }} /> : <span className="mono">{initials(course.mentor_name)}</span>}
                    <div><h3>{course.mentor_name}</h3><p>{course.mentor_company || `Mentor, ${course.title}`}</p></div>
                  </div>}
                  {course.mentor_bio?.trim() && <p className="csec__p" style={{ whiteSpace: "pre-line" }}>{course.mentor_bio}</p>}
                </CourseContentSection>}
                {FAQS.length > 0 && <CourseContentSection id="faq" eyebrow="Good to know" title="Frequently asked questions"><FaqAccordion items={FAQS} variant="inline" /></CourseContentSection>}
          </div>

          <aside className="cd__side"><div id="enrollment">
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
                is_flagship: course.is_flagship,
                offer_price: course.offer_price === null ? null : Number(course.offer_price),
                offer_label: course.offer_label,
                offer_ends_at: course.offer_ends_at,
                show_countdown: course.show_countdown,
              }}
              state={state}
              enrolledHref={enrolledHref}
            />
          </div></aside>
        </div>
      </div>
      <MobileEnrollBar
        price={Number(course.price)}
        offerPrice={course.offer_price === null ? null : Number(course.offer_price)}
        offerEndsAt={course.offer_ends_at}
        mrp={course.mrp === null ? null : Number(course.mrp)}
        href={primaryHref}
        label={primaryLabel}
      />
    </CourseDetailMotion>
  );
}
