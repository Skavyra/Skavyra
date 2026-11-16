import { BookOpen } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SearchFilters } from "@/components/dashboard/SearchFilters";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth/require-role";
import { CATEGORY_LABEL, LEVEL_LABEL, LESSON_TYPE_LABEL } from "@/lib/constants";
import { PAYMENT_RULES } from "@/lib/payment-plan";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatInr, getOfferPricing, sanitizeSearchTerm } from "@/lib/utils";
import type { AppRole, CourseCategory, CourseLevel } from "@/types";

export type CourseSearch = { q?: string; category?: string; level?: string; fee?: string; plan?: string };

const lines = (value: string | null | undefined) =>
  (value ?? "")
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\s•\-*]+/, "").trim())
    .filter(Boolean);

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-foreground">{children}</dd>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      <div className="mt-1.5 text-sm text-foreground">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
}

/**
 * Read-only catalogue for employees and HR on a call: the fee and offer, plan, mentor, what the course covers,
 * who it suits, what they need first, the tools, and the full syllabus. Only published courses are shown.
 */
export async function CoursesView({ roles, params }: { roles: AppRole[]; params: CourseSearch }) {
  await requireRole(roles);
  const supabase = await createClient();

  let query = supabase.from("courses").select("*").eq("status", "published");
  const term = sanitizeSearchTerm(params.q);
  if (term) {
    query = query.or(`title.ilike.%${term}%,subtitle.ilike.%${term}%,mentor_name.ilike.%${term}%,description.ilike.%${term}%`);
  }
  if (params.category && params.category in CATEGORY_LABEL) query = query.eq("category", params.category as CourseCategory);
  if (params.level && params.level in LEVEL_LABEL) query = query.eq("level", params.level as CourseLevel);
  if (params.fee === "low") query = query.lt("price", 10000);
  if (params.fee === "mid") query = query.gte("price", 10000).lt("price", PAYMENT_RULES.splitFromFee);
  if (params.fee === "high") query = query.gte("price", PAYMENT_RULES.splitFromFee);
  if (params.plan === "full") query = query.lt("price", PAYMENT_RULES.splitFromFee);
  if (params.plan === "split") query = query.gte("price", PAYMENT_RULES.splitFromFee);

  const { data } = await query.order("sort_order", { ascending: true });
  const courses = data ?? [];
  const filtered = Boolean(term || params.category || params.level || params.fee || params.plan);

  // the syllabus: modules and their lessons, for the courses on screen
  const ids = courses.map((c) => c.id);
  const { data: outline } = ids.length
    ? await supabase
        .from("course_outline")
        .select("course_id, module_id, module_title, module_order, lesson_title, lesson_type, duration_minutes, lesson_order")
        .in("course_id", ids)
        .order("module_order")
        .order("lesson_order")
    : { data: [] };

  type Module = { id: string; title: string; lessons: { title: string; type: string | null; minutes: number | null }[] };
  const syllabus = new Map<string, Module[]>();
  for (const row of outline ?? []) {
    if (!row.course_id || !row.module_id) continue;
    const mods = syllabus.get(row.course_id) ?? [];
    let mod = mods.find((m) => m.id === row.module_id);
    if (!mod) {
      mod = { id: row.module_id, title: row.module_title ?? "Module", lessons: [] };
      mods.push(mod);
    }
    if (row.lesson_title) mod.lessons.push({ title: row.lesson_title, type: row.lesson_type, minutes: row.duration_minutes });
    syllabus.set(row.course_id, mods);
  }

  return (
    <>
      <PageHeader
        title="Courses"
        description={`${courses.length} ${courses.length === 1 ? "course" : "courses"}. Fees, offers, mentors and syllabus, so you can answer on the call.`}
      />
      <SearchFilters
        placeholder="Search course, topic or mentor"
        filters={[
          { key: "category", label: "Any category", options: Object.entries(CATEGORY_LABEL).map(([value, label]) => ({ value, label })) },
          { key: "level", label: "Any level", options: Object.entries(LEVEL_LABEL).map(([value, label]) => ({ value, label })) },
          {
            key: "fee",
            label: "Any fee",
            options: [
              { value: "low", label: "Under ₹10,000" },
              { value: "mid", label: `₹10,000 to ₹${(PAYMENT_RULES.splitFromFee - 1).toLocaleString("en-IN")}` },
              { value: "high", label: `₹${PAYMENT_RULES.splitFromFee.toLocaleString("en-IN")} and above` },
            ],
          },
          {
            key: "plan",
            label: "Any payment plan",
            options: [
              { value: "full", label: "Full payment only" },
              { value: "split", label: `Full or ${PAYMENT_RULES.firstPercent}% now` },
            ],
          },
        ]}
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={filtered ? "No courses match" : "No published courses yet"}
          description={filtered ? "Try a different search or clear the filters." : "Published courses appear here."}
        />
      ) : (
        <Accordion type="single" collapsible className="flex flex-col gap-3">
          {courses.map((c) => {
            const pricing = getOfferPricing(c);
            const mods = syllabus.get(c.id) ?? [];
            const lessonCount = mods.reduce((n, m) => n + m.lessons.length, 0);
            const outcomes = lines(c.learning_outcomes);
            const audience = lines(c.target_audience);
            const prereq = lines(c.prerequisites);
            const projects = lines(c.projects);
            return (
              <AccordionItem key={c.id} value={c.id}>
                <AccordionTrigger>
                  <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span className="truncate">{c.title}</span>
                    <Badge tone="gold">{CATEGORY_LABEL[c.category]}</Badge>
                    {c.is_flagship && <Badge tone="neutral">Flagship</Badge>}
                    <span className="text-sm font-normal text-muted-foreground">
                      {formatInr(pricing.current)}
                      {c.duration_weeks ? ` · ${c.duration_weeks} weeks` : ""}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-5">
                    {c.subtitle && <p className="text-base text-foreground">{c.subtitle}</p>}

                    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                      <Fact label="Fee">
                        {formatInr(pricing.current)}
                        {pricing.active && pricing.original !== null && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground line-through">{formatInr(pricing.original)}</span>
                        )}
                        {!pricing.active && c.mrp && Number(c.mrp) > Number(c.price) && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground line-through">{formatInr(c.mrp)}</span>
                        )}
                      </Fact>
                      <Fact label="Payment">
                        {c.allows_partial
                          ? `Full, or ${PAYMENT_RULES.firstPercent}% (${formatInr(Math.round(pricing.current * PAYMENT_RULES.firstPercent) / 100)}) now and the rest within ${PAYMENT_RULES.balanceDays} days`
                          : "Full payment only"}
                      </Fact>
                      <Fact label="Duration">{c.duration_weeks ? `${c.duration_weeks} weeks` : "—"}</Fact>
                      <Fact label="Level">{LEVEL_LABEL[c.level]}</Fact>
                      <Fact label="Taught in">{c.language || "—"}</Fact>
                      <Fact label="Mentor">
                        {c.mentor_name || "To be announced"}
                        {c.mentor_company && <span className="block text-xs font-normal text-muted-foreground">{c.mentor_company}</span>}
                      </Fact>
                      <Fact label="Lessons">{lessonCount > 0 ? `${lessonCount} in ${mods.length} ${mods.length === 1 ? "module" : "modules"}` : "Not added yet"}</Fact>
                      <Fact label="Certificate">Yes, on completion</Fact>
                    </dl>

                    {pricing.active && (
                      <p className="rounded-lg bg-gold-100/50 p-3 text-sm">
                        <strong>{c.offer_label || "Offer"}:</strong> {formatInr(pricing.current)} instead of {formatInr(pricing.original)}
                        {pricing.savings > 0 ? ` (save ${pricing.savings}%)` : ""}
                        {c.offer_ends_at ? `. Ends ${formatDate(c.offer_ends_at, true)}.` : "."}
                      </p>
                    )}

                    {c.description && (
                      <Block title="About the course">
                        <p className="whitespace-pre-line">{c.description}</p>
                      </Block>
                    )}
                    {outcomes.length > 0 && (
                      <Block title="What they will learn">
                        <Bullets items={outcomes} />
                      </Block>
                    )}
                    {audience.length > 0 && (
                      <Block title="Who it is for">
                        <Bullets items={audience} />
                      </Block>
                    )}
                    {prereq.length > 0 && (
                      <Block title="What they need first">
                        <Bullets items={prereq} />
                      </Block>
                    )}
                    {projects.length > 0 && (
                      <Block title="Projects">
                        <Bullets items={projects} />
                      </Block>
                    )}
                    {(c.tools ?? []).length > 0 && (
                      <Block title="Tools covered">
                        <div className="flex flex-wrap gap-1.5">
                          {c.tools.map((t) => (
                            <Badge key={t} tone="muted">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </Block>
                    )}
                    {c.mentor_bio && (
                      <Block title={`About the mentor${c.mentor_name ? `, ${c.mentor_name}` : ""}`}>
                        <p className="whitespace-pre-line">{c.mentor_bio}</p>
                      </Block>
                    )}

                    {mods.length > 0 && (
                      <Block title="Syllabus">
                        <ol className="space-y-3">
                          {mods.map((m, i) => (
                            <li key={m.id}>
                              <p className="font-semibold">
                                Module {i + 1}: {m.title}
                              </p>
                              {m.lessons.length > 0 && (
                                <ul className="mt-1 space-y-0.5 pl-4 text-muted-foreground">
                                  {m.lessons.map((l, li) => (
                                    <li key={li}>
                                      {l.title}
                                      {l.type ? ` · ${LESSON_TYPE_LABEL[l.type as keyof typeof LESSON_TYPE_LABEL] ?? l.type}` : ""}
                                      {l.minutes ? ` · ${l.minutes} min` : ""}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ol>
                      </Block>
                    )}

                    <Link href={`/courses/${c.slug}`} target="_blank" className="self-start text-sm font-semibold text-gold-700 hover:underline">
                      Open the public page
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </>
  );
}
