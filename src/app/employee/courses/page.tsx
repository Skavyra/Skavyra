import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth/require-role";
import { CATEGORY_LABEL, LEVEL_LABEL } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { formatInr } from "@/lib/utils";

export const metadata: Metadata = { title: "Courses" };

/** Read-only catalogue so counsellors can answer questions on a call. */
export default async function EmployeeCoursesPage() {
  await requireRole("employee");
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  const { data: outline } = await supabase.from("course_outline").select("course_id, module_title, module_order").order("module_order");
  const modulesByCourse = new Map<string, string[]>();
  for (const row of outline ?? []) {
    const list = modulesByCourse.get(row.course_id!) ?? [];
    if (row.module_title && !list.includes(row.module_title)) list.push(row.module_title);
    modulesByCourse.set(row.course_id!, list);
  }

  return (
    <>
      <PageHeader title="Courses" description="Fees, length and syllabus, so you can answer on the call." />
      {(courses ?? []).length === 0 ? (
        <EmptyState icon={BookOpen} title="No published courses yet" description="Published courses appear here." />
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
                    <dt className="text-xs text-muted-foreground">Installments</dt>
                    <dd className="font-semibold text-foreground">
                      {c.allows_partial ? `Allowed${c.min_first_payment ? `, first ${formatInr(c.min_first_payment)}` : ""}` : "Full payment only"}
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
