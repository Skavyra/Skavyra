import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABEL, LEVEL_LABEL } from "@/lib/constants";
import { formatInr } from "@/lib/utils";
import type { Course } from "@/types";

import { Quarter } from "./Quarter";

export type CourseCardData = Pick<
  Course,
  "id" | "slug" | "title" | "subtitle" | "category" | "level" | "cover_image_url" | "price" | "mrp" | "duration_weeks"
>;

export function CourseCard({ course, href }: { course: CourseCardData; href?: string }) {
  return (
    <Link
      href={href ?? `/courses/${course.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-[0_10px_30px_-26px_rgba(13,13,13,0.32)] transition duration-300 hover:-translate-y-1 hover:border-gold-300/80 hover:shadow-[0_22px_46px_-30px_rgba(142,103,24,0.6)] focus-visible:border-gold-300"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-ink">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-ink/45 via-transparent to-transparent" />
        {course.cover_image_url ? (
          <Image
            src={course.cover_image_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
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
          <Badge tone="gold">{CATEGORY_LABEL[course.category]}</Badge>
          <Badge tone="muted">{LEVEL_LABEL[course.level]}</Badge>
        </div>
        <h3 className="text-lg leading-snug transition-colors group-hover:text-gold-700">{course.title}</h3>
        {course.subtitle && <p className="line-clamp-2 text-sm text-muted-foreground">{course.subtitle}</p>}
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <span className="text-xs text-muted-foreground">{course.duration_weeks ? `${course.duration_weeks} weeks` : "Self paced"}</span>
          <span className="text-right">
            {course.mrp && Number(course.mrp) > Number(course.price) && (
              <span className="mr-2 text-xs text-muted-foreground line-through">{formatInr(course.mrp)}</span>
            )}
            <span className="font-bold">{formatInr(course.price)}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
