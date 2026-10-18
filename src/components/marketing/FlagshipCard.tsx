import Link from "next/link";
import { Check, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FLAGSHIP_STYLES } from "@/lib/flagship-styles";
import { LEVEL_LABEL } from "@/lib/constants";
import { formatInr, isOfferActive, savingsPercent } from "@/lib/utils";
import type { FlagshipCourse } from "@/types/flagship";

import { OfferCountdown } from "./OfferCountdown";

export function FlagshipCard({ course }: { course: FlagshipCourse }) {
  const outcomes = (course.learning_outcomes ?? "")
    .split("\n")
    .map((outcome) => outcome.trim())
    .filter(Boolean)
    .slice(0, 4);
  const price = Number(course.price);
  const mrp = course.mrp == null ? null : Number(course.mrp);
  const hasSavings = mrp !== null && mrp > price;
  const savings = hasSavings ? savingsPercent(price, mrp) : 0;

  return (
    <article id={course.slug} className={`${FLAGSHIP_STYLES.darkCard} scroll-mt-24`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className={FLAGSHIP_STYLES.flagshipBadge}>
          <Star aria-hidden="true" className="size-3 fill-current" />
          Flagship
        </span>
        <span className="text-xs text-ivory/60">
          {LEVEL_LABEL[course.level]} · {course.duration_weeks ? `${course.duration_weeks} weeks` : "Self paced"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className={FLAGSHIP_STYLES.cardTitle}>{course.title}</h3>
        {course.subtitle && <p className={FLAGSHIP_STYLES.cardTagline}>{course.subtitle}</p>}
      </div>

      {outcomes.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-ivory">What you&apos;ll learn</h4>
          <ul className="flex flex-col gap-2">
            {outcomes.map((outcome, index) => (
              <li key={`${index}-${outcome}`} className={FLAGSHIP_STYLES.outcomeItem}>
                <Check aria-hidden="true" className="size-4 shrink-0 text-gold-100" />
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {course.tools.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Tools covered">
          {course.tools.map((tool) => (
            <li key={tool} className={FLAGSHIP_STYLES.toolChip}>
              {tool}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex flex-col gap-3">
        {isOfferActive(course) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className={FLAGSHIP_STYLES.offerPillDark}>{course.offer_label}</span>
            <OfferCountdown endsAt={course.offer_ends_at} />
          </div>
        )}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className={FLAGSHIP_STYLES.priceDark}>{formatInr(course.price)}</span>
          {hasSavings && (
            <>
              <span className={FLAGSHIP_STYLES.mrpStruckDark}>{formatInr(mrp)}</span>
              <span className={FLAGSHIP_STYLES.saveDark}>Save {savings}%</span>
            </>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="gold" className="w-full sm:flex-1">
            <Link href="/contact">Enroll now</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full border-ivory/30 text-ivory hover:bg-ivory/10 sm:flex-1"
          >
            <Link href="/contact">Talk to us</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
