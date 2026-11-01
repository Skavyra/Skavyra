import type { Metadata } from "next";
import { Check, ChevronRight } from "lucide-react";
import Link from "next/link";

import { ContactCta } from "@/components/marketing/ContactCta";
import { FlagshipCard } from "@/components/marketing/FlagshipCard";
import { FlagshipIncludes } from "@/components/marketing/FlagshipIncludes";
import { getFlagshipCourses } from "@/lib/flagship";

export const metadata: Metadata = {
  title: "Flagship Programs",
  description: "Skavyra's premium programs in AI practice, AI product management and business growth.",
};
export const revalidate = 300;

const TRUST_POINTS = ["Live mentor sessions", "Real projects", "Certificate on completion"];

export default async function FlagshipPage() {
  const courses = await getFlagshipCourses();
  const durations = courses
    .map((course) => course.duration_weeks)
    .filter((duration): duration is number => typeof duration === "number");
  const uniqueDurations = [...new Set(durations)].sort((a, b) => a - b);
  const durationFact = uniqueDurations.length === 1
    ? `${uniqueDurations[0]} weeks`
    : uniqueDurations.length > 1
      ? `${uniqueDurations[0]}-${uniqueDurations[uniqueDurations.length - 1]} weeks`
      : null;

  return (
    <>
      <section className="fh">
        <div className="fh__q" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="wrap">
          <div className="reveal">
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <ChevronRight className="ic" strokeWidth={1.75} aria-hidden="true" />
              <b>Flagship programs</b>
            </nav>
            <p className="over over--dark"><span className="over__bar" />Flagship Programs</p>
            <h1 className="ptitle">Our most <span className="hl">in-depth</span> programs</h1>
            <p className="plead">Mentor-led, project-based programs built for real jobs and real business outcomes.</p>
            <ul className="ticks">
              {TRUST_POINTS.map((point) => <li key={point}><Check className="ic" strokeWidth={1.75} aria-hidden="true" />{point}</li>)}
            </ul>
            {courses.length > 0 && (
              <ul className="facts">
                {[
                  `${courses.length} programs`,
                  durationFact,
                  "Mentor-led",
                ].filter((fact): fact is string => fact !== null).map((fact) => <li key={fact}>{fact}</li>)}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section aria-label="Flagship programs">
        <div className="wrap fprogs">
          {courses.length > 0 ? (
            courses.map((course) => <FlagshipCard key={course.id} course={course} />)
          ) : (
            <div className="cempty">
              <p>Our flagship programs are launching soon.</p>
              <Link href="/contact">Get notified</Link>
            </div>
          )}
        </div>
      </section>

      {courses.length > 0 && <FlagshipIncludes />}
      <ContactCta />
    </>
  );
}
