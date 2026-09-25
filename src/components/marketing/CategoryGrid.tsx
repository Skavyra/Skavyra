import { BarChart3, Calculator, Code2, Megaphone, PenTool, Users } from "lucide-react";
import Link from "next/link";

import { CATEGORIES } from "@/lib/content";

import { SectionHeading } from "./SectionHeading";

const ICONS = { code: Code2, chart: BarChart3, pen: PenTool, megaphone: Megaphone, calculator: Calculator, users: Users };

export function CategoryGrid() {
  return (
    <section className="section container">
      <SectionHeading title="Browse by category" description="Pick the area you want to work in. Each one opens the courses that fit it." />
      <ul className="mt-fluid-sm grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map(({ label, category, icon }) => {
          const Icon = ICONS[icon];
          return (
            <li key={label}>
              <Link
                href={`/courses?category=${category}`}
                className="group flex h-full flex-col items-center gap-3 rounded-2xl border bg-card p-5 text-center transition-colors hover:border-gold-300"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-muted transition-colors group-hover:bg-gold-100/50">
                  <Icon className="size-5 text-gold-700" />
                </span>
                <span className="text-sm font-semibold leading-snug">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
