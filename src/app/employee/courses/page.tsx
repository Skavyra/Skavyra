import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SearchFilters } from "@/components/dashboard/SearchFilters";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth/require-role";
import { CATEGORY_LABEL, LEVEL_LABEL } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { PAYMENT_RULES } from "@/lib/payment-plan";
import { formatInr, sanitizeSearchTerm } from "@/lib/utils";
import type { CourseCategory, CourseLevel } from "@/types";

export const metadata: Metadata = { title: "Courses" };

/** Read-only catalogue so counsellors can answer questions on a call. */
type CourseSearch = { q?: string; category?: string; level?: string; fee?: string; plan?: string };

export default async function EmployeeCoursesPage({ searchParams }: { searchParams: Promise<CourseSearch> }) {
  await requireRole("employee");
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("courses").select("*").eq("status", "published");
  if (sanitizeSearchTerm(params.q)) {
    const term = sanitizeSearchTerm(params.q);
    query = query.or(`title.ilike.%${term}%,subtitle.ilike.%${term}%,mentor_name.ilike.%${term}%`);
  }
  if (params.category && params.category in CATEGORY_LABEL) query = query.eq("category", params.category as CourseCategory);
  if (params.level && params.level in LEVEL_LABEL) query = query.eq("level", params.level as CourseLevel);
  if (params.fee === "low") query = query.lt("price", 10000);
  if (params.fee === "mid") query = query.gte("price", 10000).lt("price", PAYMENT_RULES.splitFromFee);
  if (params.fee === "high") query = query.gte("price", PAYMENT_RULES.splitFromFee);
  if (params.plan === "full") query = query.lt("price", PAYMENT_RULES.splitFromFee);
  if (params.plan === "split") query = query.gte("price", PAYMENT_RULES.splitFromFee);

  const { data: courses } = await query.order("sort_order", { ascending: true });
  const filtered = Boolean(params.q || params.category || params.level || params.fee || params.plan);

  const { data: outline } = await supabase.from("course_outline").select("course_id, module_title, module_order").order("module_order");
  const modulesByCourse = new Map<string, string[]>();
  for (const row of outline ?? []) {
    const list = modulesByCourse.get(row.course_id!) ?? [];
    if (row.module_title && !list.includes(row.module_title)) list.push(row.module_title);
    modulesByCourse.set(row.course_id!, list);
  }

  return (
    <>
      <PageHeader
        title="Courses"
        description={`${(courses ?? []).length} ${(courses ?? []).length === 1 ? "course" : "courses"}. Fees, length and syllabus, so you can answer on the call.`}
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
      {(courses ?? []).length === 0 ? (
        filtered ? (
          <EmptyState icon={BookOpen} title="No courses match" description="Try a different search or clear the filters." />
        ) : (
          <EmptyState icon={BookOpen} title="No published courses yet" description="Published courses appear here." />
        )
      ) : (
        <Accordion type="single" collapsible className="flex flex-col gap-3">
          {(courses ?? []).map((c) => (
            <AccordionItem key={c.id} value={c.id}>
              <AccordionTrigger>
                <span className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                  <span className="truncate">{c.title}</span>
                  <Badge tone="gold">{CATEGORY_LABEL[c.category]}</Badge>
                  <span className="text-sm font-normal text-muted-foreground">
                    {formatInr(c.price)}
                    {c.duration_weeks ? ` · ${c.duration_weeks} weeks` : ""}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <dl className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-muted-foreground">Level</dt>
                    <dd className="font-semibold text-foreground">{LEVEL_LABEL[c.level]}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Payment</dt>
                    <dd className="font-semibold text-foreground">
                      {c.allows_partial ? "Full, or 30% now and 70% within 10 days" : "Full payment only"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Mentor</dt>
                    <dd className="font-semibold text-foreground">{c.mentor_name ?? "To be announced"}</dd>
                  </div>
                </dl>
                {c.subtitle && <p className="mt-4">{c.subtitle}</p>}
                {(modulesByCourse.get(c.id) ?? []).length > 0 && (
                  <>
                    <p className="mt-4 text-xs font-semibold text-foreground">Modules</p>
                    <ol className="mt-2 list-inside list-decimal">
                      {(modulesByCourse.get(c.id) ?? []).map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ol>
                  </>
                )}
                <Link href={`/courses/${c.slug}`} className="mt-4 inline-block text-sm font-semibold text-gold-700 hover:underline">
                  Open the public page
                </Link>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </>
  );
}
