import type { Metadata } from "next";
import { Check } from "lucide-react";
import Link from "next/link";

import { ContactCta } from "@/components/marketing/ContactCta";
import { FlagshipCard } from "@/components/marketing/FlagshipCard";
import { FlagshipIncludes } from "@/components/marketing/FlagshipIncludes";
import { Button } from "@/components/ui/button";
import { getFlagshipCourses } from "@/lib/flagship";
import { FLAGSHIP_STYLES } from "@/lib/flagship-styles";

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
      <section className={`${FLAGSHIP_STYLES.darkSection} relative overflow-hidden pt-fluid-lg pb-24 sm:pb-32`}>
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-40 size-[34rem] rounded-full bg-gold-300/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-0 size-[20rem] rounded-full bg-gold-500/10 blur-3xl" />
        <div className="container relative z-10">
          <p className="text-xs uppercase tracking-widest text-gold-100">Flagship Programs</p>
          <h1 className={`${FLAGSHIP_STYLES.heroTitle} mt-3`}>Our most in-depth programs</h1>
          <p className={`${FLAGSHIP_STYLES.heroSubtitle} mt-4 max-w-2xl`}>
            Mentor-led, project-based programs built for real jobs and real business outcomes.
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ivory/70">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="inline-flex items-center gap-2">
                <Check aria-hidden="true" className="size-4 text-gold-100" />
                {point}
              </li>
            ))}
          </ul>
          {courses.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-3">
              {[
                `${courses.length} programs`,
                durationFact,
                "Mentor-led",
              ].filter((fact): fact is string => fact !== null).map((fact) => (
                <li key={fact} className="rounded-full border border-gold-300/40 bg-ivory/5 px-4 py-1.5 text-sm font-semibold text-gold-100">
                  {fact}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section aria-label="Flagship programs" className="relative bg-ivory pb-fluid-lg text-ink">
        <svg
          aria-hidden="true"
          className="theme-ink absolute inset-x-0 top-0 h-12 w-full text-gold-300 sm:h-20"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
        >
          <path d="M0 0H1440V28C1080 82 360 82 0 28Z" fill="hsl(var(--background))" />
          <path d="M0 28C360 82 1080 82 1440 28" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="container relative z-10 pt-16 sm:pt-24">
          {courses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 [&>article]:shadow-[0_28px_60px_-32px_rgba(10,10,10,0.55)]">
              {courses.map((course) => (
                <FlagshipCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-ink/70">Our flagship programs are launching soon.</p>
              <Button asChild variant="gold" className="mt-5">
                <Link href="/contact">Get notified</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {courses.length > 0 && <FlagshipIncludes />}
      <ContactCta />
    </>
  );
}
