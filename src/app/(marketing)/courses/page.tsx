import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, Star, X } from "lucide-react";

import { CourseCard, type CourseCardData } from "@/components/marketing/CourseCard";
import { CoursesPageMotion } from "@/components/marketing/CoursesPageMotion";
import { CATEGORY_LABEL, LEVEL_LABEL } from "@/lib/constants";
import { getFlagshipCourses } from "@/lib/flagship";
import { createClient } from "@/lib/supabase/server";
import { formatInr, getOfferPricing } from "@/lib/utils";
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
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));

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

          <div>
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
              <section className="fstrip reveal" aria-label="Flagship programs">
                <div className="fstrip__h">
                  <h2><Star className="ic" strokeWidth={1.75} />Flagship programs</h2>
                  <Link href="/flagship">View all &rarr;</Link>
                </div>
                <div className="fmini">
                  {flagshipCardCourses.map((course) => {
                    const pricing = getOfferPricing(course);
                    return (
                      <Link className="fm" href={`/courses/${course.slug}`} key={course.id}>
                        <span className="fm__img">
                          <Image
                            src={course.cover_image_url || "/images/site/photo-classroom.jpg"}
                            alt=""
                            fill
                            sizes="(max-width:720px) 80vw, 120px"
                            loading="lazy"
                            style={{ objectFit: "cover" }}
                          />
                        </span>
                        <span className="fm__b">
                          <span className="fm__tags">
                            <span>Flagship</span>
                            <span>{CATEGORY_LABEL[course.category]}</span>
                            <span>{LEVEL_LABEL[course.level]}</span>
                          </span>
                          <h3>{course.title}</h3>
                          {course.subtitle && <p>{course.subtitle}</p>}
                          <span className="fm__f">
                            <b>{formatInr(pricing.current)}</b>
                            {pricing.active && pricing.original !== null && <s>{formatInr(pricing.original)}</s>}
                            {pricing.savings > 0 && <em>Save {pricing.savings}%</em>}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
            {courses.length > 0 ? (
              <ul className="cgrid" data-courses-results>
                {courses.map((course) => (
                  <li key={course.id} className="reveal">
                    <CourseCard course={course} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="cempty" data-courses-results>
                <p>No courses match these filters.</p>
                <Link href="/courses">Clear filters to see every course</Link>
              </div>
            )}
            {!isFlagshipCategory && (
              <div className="pager">
                {pageCount === 1 ? (
                  <span>{total} total</span>
                ) : (
                  <>
                    <span>Page {page} of {pageCount}, {total} total</span>
                    <div className="pager__btns">
                      {page <= 1 ? (
                        <span className="pager__b" aria-disabled="true"><ChevronLeft className="ic" strokeWidth={1.75} />Previous</span>
                      ) : (
                        <Link className="pager__b" href={hrefWith(params, { page: String(page - 1) })}>
                          <ChevronLeft className="ic" strokeWidth={1.75} />Previous
                        </Link>
                      )}
                      {page >= pageCount ? (
                        <span className="pager__b" aria-disabled="true">Next<ChevronRight className="ic" strokeWidth={1.75} /></span>
                      ) : (
                        <Link className="pager__b" href={hrefWith(params, { page: String(page + 1) })}>
                          Next<ChevronRight className="ic" strokeWidth={1.75} />
                        </Link>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </>
    </CoursesPageMotion>
  );
}
