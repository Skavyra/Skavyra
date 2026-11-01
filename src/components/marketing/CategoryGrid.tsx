import { ArrowUpRight, BarChart3, Calculator, Code2, Megaphone, PenTool, Users } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { CATEGORY_LABEL } from "@/lib/constants";
import { CATEGORIES } from "@/lib/content";

const ICONS = { code: Code2, chart: BarChart3, pen: PenTool, megaphone: Megaphone, calculator: Calculator, users: Users };

export function CategoryGrid() {
  return (
    <section className="sec sec--grey cats" id="categories">
      <div className="wrap">
        <div className="shead shead--split reveal">
          <div>
            <p className="over"><span className="over__bar" />Where do you want to work?</p>
            <h2 className="h2">Browse by <span className="hl">category</span></h2>
          </div>
          <p className="lead lead--side">Pick the area you want to work in. Each one opens the courses that fit it.</p>
        </div>
        <ul className="cats__grid">
          {CATEGORIES.map(({ label, category, icon }, index) => {
            const Icon = ICONS[icon];
            return (
              <li className="reveal" style={{ "--d": `${index * 60}ms` } as CSSProperties} key={label}>
                <Link className="cat" href={`/courses?category=${category}`} data-category-card>
                  <span className="cat__ic"><Icon className="ic" strokeWidth={1.75} /></span>
                  <span className="cat__t">{label}</span>
                  <span className="cat__f">
                    <span className="cat__s">{CATEGORY_LABEL[category]}</span>
                    <span className="cat__go"><ArrowUpRight className="ic" strokeWidth={1.75} /></span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
