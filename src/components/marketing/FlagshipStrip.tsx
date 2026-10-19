import Link from "next/link";
import {
  ArrowRight,
  Award,
  CalendarDays,
  Star,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { OfferCountdown } from "@/components/marketing/OfferCountdown";
import { FLAGSHIP_STYLES } from "@/lib/flagship-styles";
import { formatInr, getOfferPricing } from "@/lib/utils";
import type { FlagshipCourse } from "@/types/flagship";

import { FlagshipStripMotion } from "./FlagshipStripMotion";

export function FlagshipStrip({ courses }: { courses: FlagshipCourse[] }) {
  if (courses.length === 0) return null;

  const countdownCourse = courses
    .filter((course) => course.show_countdown && getOfferPricing(course).active && course.offer_ends_at)
    .filter((course) => Number.isFinite(new Date(course.offer_ends_at!).getTime()))
    .sort((a, b) => new Date(a.offer_ends_at!).getTime() - new Date(b.offer_ends_at!).getTime())[0];

  return (
    <section className={`${FLAGSHIP_STYLES.stripSection} relative overflow-hidden bg-ivory py-16 text-ink sm:py-24`}>
      <svg
        aria-hidden="true"
        className="theme-ink absolute inset-x-0 top-0 h-12 w-full text-gold-300 sm:h-20"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
      >
        <path d="M0 0H1440V28C1080 82 360 82 0 28Z" fill="hsl(var(--background))" />
        <path d="M0 28C360 82 1080 82 1440 28" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[58%] size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-300/15 blur-3xl" />

      <div className="container relative z-10 pt-8 sm:pt-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-widest text-gold-700">FLAGSHIP PROGRAMS · FOUNDING BATCH</p>
            <h2 className="mt-3 font-display text-fluid-3xl font-bold text-ink">Go deeper with our flagship programs</h2>
            <p className="mt-3 text-ink/70">{courses.length} mentor-led programs in AI and business growth.</p>
          </div>
          {countdownCourse && (
            <div className="flex w-fit flex-wrap items-center gap-2 rounded-full bg-ink px-4 py-2">
              <span className="text-xs font-semibold text-ivory">Launch offer</span>
              <OfferCountdown endsAt={countdownCourse.offer_ends_at} />
            </div>
          )}
        </div>

        <FlagshipStripMotion>
          {courses.map((course) => (
            <div
              key={course.id}
              data-flagship-reveal
              className="flex h-full w-[85%] shrink-0 snap-center md:w-auto md:min-w-0"
            >
              <FlagshipStripCard course={course} />
            </div>
          ))}
        </FlagshipStripMotion>
        <p className="mt-3 text-xs text-ink/60 md:hidden">Swipe to see all {courses.length} →</p>

        <div className="mt-10 flex justify-center">
          <Button asChild variant="gold" className="w-full sm:w-auto">
            <Link href="/flagship">
              Explore flagship programs
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function FlagshipStripCard({ course }: { course: FlagshipCourse }) {
  const pricing = getOfferPricing(course);

  return (
    <Link
      data-flagship-card
      href={`/courses/${course.slug}`}
      aria-label={`${course.title}, ${formatInr(pricing.current)}, view program`}
      className="group relative flex h-full w-full flex-col gap-5 overflow-hidden rounded-3xl border border-gold-500/50 bg-ink p-6 text-ivory shadow-[0_30px_60px_-35px_rgba(13,13,13,0.55)] transition-[border-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
    >
      <div
        aria-hidden="true"
        data-flagship-glow
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0"
        style={{ background: "radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), rgba(242,199,92,0.16), transparent 60%)" }}
      />
      <div className="relative flex items-center">
        <span className={FLAGSHIP_STYLES.flagshipBadge}>
          <Star aria-hidden="true" className="size-3 fill-current" />
          Flagship
        </span>
      </div>

      <div className="relative">
        <h3 className="font-display text-xl font-bold text-ivory">{course.title}</h3>
        {course.subtitle && <p className="mt-1 line-clamp-2 text-sm text-ivory/70">{course.subtitle}</p>}
      </div>

      <div className="relative flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-ivory/70">
        {course.duration_weeks !== null && (
          <>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays aria-hidden="true" className="size-3.5" />
              {course.duration_weeks} weeks
            </span>
            <span aria-hidden="true" className="text-ivory/50">·</span>
          </>
        )}
        <span className="inline-flex items-center gap-1.5">
          <Users aria-hidden="true" className="size-3.5" />
          Mentor-led
        </span>
        <span aria-hidden="true" className="text-ivory/50">·</span>
        <span className="inline-flex items-center gap-1.5">
          <Award aria-hidden="true" className="size-3.5" />
          Certificate
        </span>
      </div>

      {course.tools.length > 0 && (
        <div className="relative flex flex-wrap gap-2">
          {course.tools.slice(0, 3).map((tool) => <span className={FLAGSHIP_STYLES.toolChip} key={tool}>{tool}</span>)}
        </div>
      )}

      <div className="relative mt-auto">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <span className="font-display text-3xl font-bold text-ivory">{formatInr(pricing.current)}</span>
          {pricing.active && pricing.original !== null && (
            <span className="text-sm text-ivory/50 line-through">{formatInr(pricing.original)}</span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {pricing.savings > 0 && (
            <span className="rounded-full bg-gold-300 px-2.5 py-0.5 text-xs font-bold text-ink">Save {pricing.savings}%</span>
          )}
          {pricing.active && course.offer_label && <span className={FLAGSHIP_STYLES.offerPillDark}>{course.offer_label}</span>}
        </div>
      </div>

      <span className="relative flex w-full items-center justify-center gap-2 rounded-full bg-gold-300 py-3 text-center font-semibold text-ink transition-colors group-hover:bg-gold-100">
        View program <ArrowRight aria-hidden="true" className="size-4" />
      </span>
    </Link>
  );
}
