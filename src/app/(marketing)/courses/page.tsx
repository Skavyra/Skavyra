import type { Metadata } from "next";
import Link from "next/link";

import { CourseCard } from "@/components/marketing/CourseCard";
import { Pagination } from "@/components/ui/pagination";
import { CATEGORY_LABEL, LEVEL_LABEL } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { CourseCategory, CourseLevel } from "@/types";

export const metadata: Metadata = { title: "Courses", description: "Courses for IT and non-IT graduates." };

const PER_PAGE = 9;
const CATEGORIES: CourseCategory[] = ["it", "non_it"];
const LEVELS: CourseLevel[] = ["beginner", "intermediate", "advanced"];
const DURATIONS = [
  { value: "short", label: "Up to 8 weeks", min: 0, max: 8 },
  { value: "medium", label: "9 to 12 weeks", min: 9, max: 12 },
  { value: "long", label: "More than 12 weeks", min: 13, max: 520 },
];

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
  const supabase = await createClient();

  let query = supabase
    .from("courses")
    .select("id, slug, title, subtitle, category, level, cover_image_url, price, mrp, duration_weeks", { count: "exact" })
    .eq("status", "published");
  // a "both" course belongs in either stream
  if (params.category === "it" || params.category === "non_it") query = query.in("category", [params.category, "both"]);
  if (LEVELS.includes(params.level as CourseLevel)) query = query.eq("level", params.level as CourseLevel);
  const dur = DURATIONS.find((d) => d.value === params.duration);
  if (dur) query = query.gte("duration_weeks", dur.min).lte("duration_weeks", dur.max);

  const { data, count } = await query
    .order("sort_order", { ascending: true })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);
  const courses = data ?? [];
  const total = count ?? 0;

  const groups: { title: string; key: keyof Params; options: { value: string; label: string }[] }[] = [
    { title: "Stream", key: "category", options: CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABEL[c] })) },
    { title: "Level", key: "level", options: LEVELS.map((l) => ({ value: l, label: LEVEL_LABEL[l] })) },
    { title: "Duration", key: "duration", options: DURATIONS.map((d) => ({ value: d.value, label: d.label })) },
  ];

  return (
    <div className="container section">
      <h1 className="text-fluid-3xl">Courses</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">Filter by stream, level and length. The link updates as you go, so you can share it.</p>

      <div className="mt-fluid-sm grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside aria-label="Filters" className="flex flex-col gap-6 lg:rounded-2xl lg:border lg:bg-card lg:p-5">
          {groups.map((g) => (
            <div key={g.key}>
              <h2 className="font-sans text-sm font-bold">{g.title}</h2>
              <ul className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
                {g.options.map((o) => {
                  const active = params[g.key] === o.value;
                  return (
                    <li key={o.value} className="shrink-0">
                      <Link
                        href={hrefWith(params, { [g.key]: active ? "" : o.value })}
                        aria-current={active ? "true" : undefined}
                        className={cn(
                          "block rounded-lg border px-3 py-2 text-sm transition-colors lg:border-transparent",
                          active ? "border-ink bg-ink font-semibold text-ivory" : "hover:bg-muted",
                        )}
                      >
                        {o.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {(params.category || params.level || params.duration) && (
            <Link href="/courses" className="text-sm font-semibold text-gold-700 hover:underline">
              Clear filters
            </Link>
          )}
        </aside>

        <div className="flex flex-col gap-8">
          {courses.length > 0 ? (
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {courses.map((c) => (
                <li key={c.id}>
                  <CourseCard course={c} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed p-10 text-center">
              <p className="font-semibold">No courses match these filters.</p>
              <Link href="/courses" className="mt-2 inline-block text-sm text-gold-700 hover:underline">
                Clear filters to see every course
              </Link>
            </div>
          )}
          <Pagination
            page={page}
            pageCount={Math.max(1, Math.ceil(total / PER_PAGE))}
            total={total}
            hrefFor={(p) => hrefWith(params, { page: String(p) })}
          />
        </div>
      </div>
    </div>
  );
}
