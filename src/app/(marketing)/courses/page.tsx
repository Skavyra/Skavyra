import type { Metadata } from "next";
import Link from "next/link";
import { Check, ChevronRight, X } from "lucide-react";

import { CourseCard, type CourseCardData } from "@/components/marketing/CourseCard";
import { CoursesPageMotion } from "@/components/marketing/CoursesPageMotion";
import { Pagination } from "@/components/ui/pagination";
import { CATEGORY_LABEL, LEVEL_LABEL } from "@/lib/constants";
import { getFlagshipCourses } from "@/lib/flagship";
import { createClient } from "@/lib/supabase/server";
import type { CourseCategory, CourseLevel } from "@/types";
import type { FlagshipCourse } from "@/types/flagship";

export const metadata: Metadata = { title: "Courses", description: "Courses for IT and non-IT graduates." };

const PER_PAGE = 9;
const CATEGORIES: CourseCategory[] = ["it", "non_it"];
const LEVELS: CourseLevel[] = ["beginner", "intermediate", "advanced"];
const DURATIONS = [
  { value: "short", label: "Up to 8 weeks", min: 0, max: 8 },
  { value: "medium", label: "9 to 12 weeks", min: 9, max: 12 },
  { value: "long", label: "More than 12 weeks", min: 13, max: 520 },
];
function toCourseCardData(course: FlagshipCourse): CourseCardData {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    subtitle: course.subtitle,
    category: course.category,
    level: course.level,
    cover_image_url: course.cover_image_url,
    price: course.price,
    mrp: course.mrp,
    duration_weeks: course.duration_weeks,
    is_flagship: course.is_flagship,
    offer_label: course.offer_label,
    offer_price: course.offer_price,
    offer_ends_at: course.offer_ends_at,
    show_countdown: course.show_countdown,
  };
}

type Params = { category?: string; level?: string; duration?: string; page?: string };

function hrefWith(current: Params, patch: Partial<Params>) {
  const next = { ...current, ...patch };
  if (patch.category !== undefined || patch.level !== undefined || patch.duration !== undefined) delete next.page;
  const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v) as [string, string][]).toString();
  return qs ? `/courses?${qs}` : "/courses";
}

/** Filters live in the URL so a filtered list can be shared as a link. */
export default async function CoursesPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const dur = DURATIONS.find((d) => d.value === params.duration);
  const isFlagshipCategory = params.category === "flagship";
  const flagshipPromise = getFlagshipCourses();
  let flagship: FlagshipCourse[];
  let courses: CourseCardData[];
  let total: number;

  if (isFlagshipCategory) {
    flagship = await flagshipPromise;
    courses = flagship.map(toCourseCardData).filter(
      (course) =>
        (!LEVELS.includes(params.level as CourseLevel) || course.level === params.level) &&
        (!dur || (course.duration_weeks !== null && course.duration_weeks >= dur.min && course.duration_weeks <= dur.max)),
    );
    total = courses.length;
  } else {
    const supabase = await createClient();
    let query = supabase
      .from("courses")
      .select(
        "id, slug, title, subtitle, category, level, cover_image_url, price, mrp, duration_weeks, is_flagship, offer_label, offer_price, offer_ends_at, show_countdown",
        { count: "exact" },
      )
      .eq("status", "published");
    if (!params.category && !params.level && !params.duration) query = query.eq("is_flagship", false);
    // a "both" course belongs in either stream
    if (params.category === "it" || params.category === "non_it") query = query.in("category", [params.category, "both"]);
    if (LEVELS.includes(params.level as CourseLevel)) query = query.eq("level", params.level as CourseLevel);
    if (dur) query = query.gte("duration_weeks", dur.min).lte("duration_weeks", dur.max);

    const [{ data, count }, flagshipData] = await Promise.all([
      query
        .order("is_flagship", { ascending: false })
        .order("sort_order", { ascending: true })
        .range((page - 1) * PER_PAGE, page * PER_PAGE - 1),
      flagshipPromise,
    ]);
    flagship = flagshipData;
    courses = data ?? [];
    total = count ?? 0;
  }
  const flagshipCardCourses = flagship.map(toCourseCardData);
  const showPinnedFlagships = !params.category && !params.level && !params.duration && page === 1;
  const animationKey = [
    isFlagshipCategory ? "flagship" : "",
    params.category ?? "",
    params.level ?? "",
    params.duration ?? "",
    params.page ?? "",
    total,
    courses.map((course) => course.slug).join(","),
  ].join("|");

  const groups: { title: string; key: keyof Params; options: { value: string; label: string }[] }[] = [
    {
      title: "Stream",
      key: "category",
      options: [...CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABEL[c] })), { value: "flagship", label: "★ Flagship" }],
    },
    { title: "Level", key: "level", options: LEVELS.map((l) => ({ value: l, label: LEVEL_LABEL[l] })) },
    { title: "Duration", key: "duration", options: DURATIONS.map((d) => ({ value: d.value, label: d.label })) },
  ];
  const hasActiveFilter = Boolean(params.category || params.level || params.duration);
  const activeFilters = groups.flatMap((group) => {
    const value = params[group.key];
    const option = group.options.find((item) => item.value === value);
    return value && option ? [{ key: group.key, label: option.label }] : [];
  });

  return (
    <CoursesPageMotion animationKey={animationKey}>
      <>
        <section className="pb">
          <span className="pb__q" aria-hidden="true" />
          <span className="pb__q2" aria-hidden="true" />
          <span className="pb__dots" aria-hidden="true" />
          <div className="wrap">
            <div className="reveal">
              <nav className="crumbs" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <ChevronRight className="ic" strokeWidth={1.75} aria-hidden="true" />
                <b>Courses</b>
              </nav>
              <p className="over"><span className="over__bar" />All courses</p>
              <h1 className="ptitle" data-courses-heading>Explore <span className="hl">courses</span></h1>
              <p className="plead" data-courses-description>
                IT and non-IT courses led by mentors from the industry. Filter by stream, level and duration to find your fit.
              </p>
              <ul className="ticks">
                {["Mentor-led", "Real projects", "Certificate on completion"].map((point) => (
                  <li key={point}><Check className="ic" strokeWidth={1.75} aria-hidden="true" />{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <div className="wrap clay">
          <aside className="filters reveal" aria-label="Filters" data-courses-filters>
            {groups.map((group) => (
              <div className="fgroup" key={group.key}>
                <h2>{group.title}</h2>
                <ul>
                  {group.options.map((option) => {
                    const active = params[group.key] === option.value;
                    return (
                      <li key={option.value}>
                        <Link
                          className="fbtn"
                          href={hrefWith(params, { [group.key]: active ? "" : option.value })}
                          aria-current={active ? "true" : undefined}
                        >
                          {option.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </aside>

          <div className="min-w-0 flex flex-col gap-8">
            {hasActiveFilter && (
              <div className="activef">
                {activeFilters.map(({ key, label }) => (
                  <Link
                    key={key}
                    href={hrefWith(params, { [key]: "" })}
                    aria-label={`Remove filter ${label}`}
                    className="achip"
                  >
                    {label}<X className="ic" strokeWidth={1.75} aria-hidden="true" />
                  </Link>
                ))}
                <Link className="aclear" href="/courses">Clear all</Link>
              </div>
            )}
            {showPinnedFlagships && flagshipCardCourses.length > 0 && (
              <section className="theme-ink relative overflow-hidden rounded-3xl bg-ink p-5 text-ivory sm:p-6" aria-label="Flagship programs">
                <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-24 size-[22rem] rounded-full bg-gold-300/10 blur-3xl" />
                <div className="relative z-10">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-display text-lg font-bold text-ivory">★ Flagship programs</h2>
                    <Link href="/flagship" className="text-sm font-semibold text-gold-300 hover:underline">
                      View all →
                    </Link>
                  </div>
                  <ul className="hide-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-1 [perspective:1000px] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-3">
                    {flagshipCardCourses.map((course) => (
                      <li key={course.id} data-listing-card className="w-[85%] shrink-0 snap-start [transform-style:preserve-3d] sm:w-auto">
                        <CourseCard course={course} />
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
            {courses.length > 0 ? (
              <ul
                data-courses-results
                data-courses-grid
                className="grid gap-5 [perspective:1000px] sm:grid-cols-2 xl:grid-cols-3"
              >
                {courses.map((c) => (
                  <li key={c.id} data-listing-card className="[transform-style:preserve-3d]">
                    <CourseCard course={c} />
                  </li>
                ))}
              </ul>
            ) : (
              <div data-courses-results className="rounded-2xl border border-dashed border-gold-500/35 bg-card/70 p-10 text-center shadow-sm">
                <p className="font-semibold">No courses match these filters.</p>
                <Link href="/courses" className="mt-2 inline-block text-sm text-gold-700 hover:underline">
                  Clear filters to see every course
                </Link>
              </div>
            )}
            {!isFlagshipCategory && (
              <div data-courses-pagination>
                <Pagination
                  page={page}
                  pageCount={Math.max(1, Math.ceil(total / PER_PAGE))}
                  total={total}
                  hrefFor={(p) => hrefWith(params, { page: String(p) })}
                />
              </div>
            )}
          </div>
        </div>
      </>
    </CoursesPageMotion>
  );
}
