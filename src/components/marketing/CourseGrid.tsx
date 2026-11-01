"use client";

import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { CourseCard, type CourseCardData } from "./CourseCard";

const TABS = [
  { key: "all", label: "All" },
  { key: "it", label: "IT" },
  { key: "non_it", label: "Non-IT" },
] as const;

/** Home page "Popular courses": six published courses with All / IT / Non-IT tabs. */
export function CourseGrid({ courses }: { courses: CourseCardData[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const visible = courses
    .filter((course) => (tab === "all" || course.category === tab || course.category === "both")
      && (!normalizedQuery || `${course.title} ${course.subtitle ?? ""}`.toLowerCase().includes(normalizedQuery)))
    .slice(0, 6);

  return (
    <section className="sec courses" id="courses">
      <div className="wrap">
        <div className="shead shead--split reveal">
          <div>
            <p className="over"><span className="over__bar" />Start with one of these</p>
            <h2 className="h2"><span className="hl">Popular</span> courses</h2>
          </div>
          <div className="ctools">
            <label className="search">
              <Search className="ic" strokeWidth={1.75} />
              <input
                type="search"
                placeholder="Search courses"
                aria-label="Search courses"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <div className="tabs" role="tablist" aria-label="Filter courses">
              {TABS.map((item) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === item.key}
                  onClick={() => setTab(item.key)}
                  key={item.key}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {visible.length > 0 ? (
          <ul className="courses__grid">
            {visible.map((course) => (
              <li className="reveal" key={course.id} data-course-card>
                <CourseCard course={course} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">
            {normalizedQuery
              ? `No course matches "${query.trim()}" yet. Leave your number below and a counsellor will help you find the right one.`
              : "New courses in this stream are on the way. Leave your number below and a counsellor will tell you when they open."}
          </p>
        )}

        <div className="center reveal">
          <Link className="btn btn--line btn--lg" href="/courses">View all courses <ArrowRight className="ic" strokeWidth={1.75} /></Link>
        </div>
      </div>
    </section>
  );
}
