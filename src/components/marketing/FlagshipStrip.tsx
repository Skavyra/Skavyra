import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FLAGSHIP_COURSES } from "@/lib/flagship-mock"; // TODO: replace with Supabase data in backend phase
import { FLAGSHIP_STYLES } from "@/lib/flagship-styles";
import { formatInr, isOfferActive } from "@/lib/utils";

export function FlagshipStrip() {
  const courses = [...FLAGSHIP_COURSES].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <section className={`${FLAGSHIP_STYLES.darkSection} py-12 sm:py-16`}>
      <div className="container">
        <p className="text-xs uppercase tracking-widest text-gold-100">Flagship Programs</p>
        <h2 className={`${FLAGSHIP_STYLES.sectionTitle} mt-3 text-ivory`}>
          Go deeper with our flagship programs
        </h2>
        <p className="mt-3 text-ivory/70">3 mentor-led programs in AI and business growth.</p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/flagship#${course.slug}`}
              className="flex flex-col gap-4 rounded-2xl border border-gold-500/40 bg-charcoal p-5 transition-colors hover:border-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              <div className="flex items-start justify-between gap-3">
                <span className={FLAGSHIP_STYLES.flagshipBadge}>
                  <Star aria-hidden="true" className="size-3 fill-current" />
                  Flagship
                </span>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-ivory">{course.title}</h3>
                {course.subtitle && <p className="mt-1 line-clamp-2 text-sm text-ivory/70">{course.subtitle}</p>}
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-2">
                <span className="font-semibold text-ivory">{formatInr(course.price)}</span>
                {course.mrp != null && Number(course.mrp) > Number(course.price) && (
                  <span className="text-sm text-ivory/50 line-through">{formatInr(course.mrp)}</span>
                )}
                {isOfferActive(course) && (
                  <span className={FLAGSHIP_STYLES.offerPillDark}>{course.offer_label}</span>
                )}
              </div>
            </Link>
          ))}
        </div>

        <Button asChild variant="gold" className="mt-6 w-full sm:w-auto">
          <Link href="/flagship">
            Explore flagship programs
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
