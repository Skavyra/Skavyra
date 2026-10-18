import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABEL, LEVEL_LABEL } from "@/lib/constants";
import { FLAGSHIP_STYLES } from "@/lib/flagship-styles";
import { cn, formatInr, isOfferActive, savingsPercent } from "@/lib/utils";
import type { Course } from "@/types";

import { Quarter } from "./Quarter";

type CourseCardDataBase = Pick<
  Course,
  "id" | "slug" | "title" | "subtitle" | "category" | "level" | "cover_image_url" | "price" | "mrp" | "duration_weeks"
>;

export type CourseCardData = CourseCardDataBase & {
  is_flagship?: boolean;
  offer_label?: string | null;
  offer_ends_at?: string | null;
};

export function CourseCard({ course, href }: { course: CourseCardData; href?: string }) {
  const isFlagship = course.is_flagship === true;
  const savings = savingsPercent(Number(course.price), course.mrp == null ? null : Number(course.mrp));

  return (
    <Link
      href={href ?? `/courses/${course.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-card shadow-[0_10px_30px_-26px_rgba(13,13,13,0.32)] transition duration-300 motion-safe:hover:-translate-y-1 hover:border-gold-300/80 hover:shadow-[0_22px_46px_-30px_rgba(142,103,24,0.6)] focus-visible:border-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2",
        isFlagship && FLAGSHIP_STYLES.lightCardFlagshipBorder,
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-ink">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-ink/45 via-transparent to-transparent" />
        {course.cover_image_url ? (
          <Image
            src={course.cover_image_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex size-full items-end justify-between p-5">
            <span className="font-display text-xl font-bold leading-tight text-ivory/90">{course.title}</span>
            <Quarter className="size-14 shrink-0" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          {isFlagship && (
            <span className={FLAGSHIP_STYLES.flagshipBadge}>
              <Star aria-hidden="true" className="size-3 fill-current" />
              Flagship
            </span>
          )}
          <Badge tone="gold">{CATEGORY_LABEL[course.category]}</Badge>
          <Badge tone="muted">{LEVEL_LABEL[course.level]}</Badge>
        </div>
        <h3 className="text-lg leading-snug transition-colors group-hover:text-gold-700">{course.title}</h3>
        {course.subtitle && <p className="line-clamp-2 text-sm text-muted-foreground">{course.subtitle}</p>}
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <span className="text-xs text-muted-foreground">{course.duration_weeks ? `${course.duration_weeks} weeks` : "Self paced"}</span>
          <span className="text-right">
            {isFlagship && isOfferActive(course) && (
              <span className="mb-1 flex justify-end">
                <span className={FLAGSHIP_STYLES.offerPillLight}>{course.offer_label}</span>
              </span>
            )}
            {course.mrp && Number(course.mrp) > Number(course.price) && (
              <span className="mr-2 text-xs text-muted-foreground line-through">{formatInr(course.mrp)}</span>
            )}
            <span className="font-bold">{formatInr(course.price)}</span>
            {isFlagship && savings > 0 && <span className={cn("ml-2", FLAGSHIP_STYLES.saveLight)}>Save {savings}%</span>}
          </span>
        </div>
      </div>
    </Link>
  );
}
