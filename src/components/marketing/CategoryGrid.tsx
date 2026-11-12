import { ArrowUpRight, BarChart3, Calculator, Code2 } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { CATEGORY_LABEL } from "@/lib/constants";
import { CATEGORIES } from "@/lib/content";

// Icon drawings copied from the approved demo (pen, megaphone, users).
function DemoIcon({ html, className }: { html: string; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

const PEN_HTML = "<path d=\"m18 13-.654-4.736a4 4 0 00-2.756-3.266l-9.163-2.9a2 2 0 00-2.017.493l-.82.819a2 2 0 00-.492 2.017l2.9 9.163a4 4 0 003.266 2.756L13 18\" /> <path d=\"M18.648 12.352a1.205 1.205 0 011.704 0l1.296 1.296a1.205 1.205 0 010 1.704l-6.296 6.296a1.205 1.205 0 01-1.704 0l-1.296-1.296a1.205 1.205 0 010-1.704z\" /> <path d=\"m3 3 6.586 6.586\" /> <circle cx=\"11\" cy=\"11\" r=\"2\" />";
const MEGAPHONE_HTML = "<path d=\"M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z\" /> <path d=\"M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14\" /> <path d=\"M8 6v8\" />";
const USERS_HTML = "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\" /> <path d=\"M16 3.128a4 4 0 0 1 0 7.744\" /> <path d=\"M22 21v-2a4 4 0 0 0-3-3.87\" /> <circle cx=\"9\" cy=\"7\" r=\"4\" />";

const ICONS = {
  code: (p: { className?: string }) => <Code2 {...p} strokeWidth={1.75} />,
  chart: (p: { className?: string }) => <BarChart3 {...p} strokeWidth={1.75} />,
  pen: (p: { className?: string }) => <DemoIcon {...p} html={PEN_HTML} />,
  megaphone: (p: { className?: string }) => <DemoIcon {...p} html={MEGAPHONE_HTML} />,
  calculator: (p: { className?: string }) => <Calculator {...p} strokeWidth={1.75} />,
  users: (p: { className?: string }) => <DemoIcon {...p} html={USERS_HTML} />,
};

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
                  <span className="cat__ic"><Icon className="ic" /></span>
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
