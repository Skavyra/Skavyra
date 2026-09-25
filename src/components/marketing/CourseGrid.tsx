"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { CourseCard, type CourseCardData } from "./CourseCard";
import { SectionHeading } from "./SectionHeading";

const TABS = [
  { key: "all", label: "All" },
  { key: "it", label: "IT" },
  { key: "non_it", label: "Non-IT" },
] as const;

/** Home page "Popular courses": six published courses with All / IT / Non-IT tabs. */
export function CourseGrid({ courses }: { courses: CourseCardData[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const visible = courses
    .filter((c) => tab === "all" || c.category === tab || c.category === "both")
    .slice(0, 6);

  return (
    <section className="section container">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading title="Popular courses" />
        <div role="tablist" aria-label="Filter courses" className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                tab === t.key ? "border-ink bg-ink text-ivory" : "border-border bg-card hover:border-gold-300",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length > 0 ? (
        <ul className="mt-fluid-sm grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((c) => (
            <li key={c.id}>
              <CourseCard course={c} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-fluid-sm rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
          New courses in this stream are on the way. Leave your number below and a counsellor will tell you when they open.
        </p>
      )}

      <div className="mt-10 flex justify-center">
        <Button asChild variant="outline" size="lg">
          <Link href="/courses">View all courses</Link>
        </Button>
      </div>
    </section>
  );
}
