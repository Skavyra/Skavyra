import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, Clock, Star } from "lucide-react";

import { CATEGORY_LABEL, LEVEL_LABEL } from "@/lib/constants";
import { formatInr, getOfferPricing } from "@/lib/utils";
import type { Course } from "@/types";

type CourseCardDataBase = Pick<
  Course,
  "id" | "slug" | "title" | "subtitle" | "category" | "level" | "cover_image_url" | "price" | "mrp" | "duration_weeks"
>;

export type CourseCardData = CourseCardDataBase & {
  is_flagship?: boolean;
  offer_label?: string | null;
  offer_ends_at?: string | null;
  offer_price?: number | null;
  show_countdown?: boolean;
};

export function CourseCard({ course, href }: { course: CourseCardData; href?: string }) {
  const { title, slug, category, level, cover_image_url, duration_weeks } = course;
  const isFlagship = course.is_flagship === true;
  const pricing = getOfferPricing(course);

  return (
    <Link className="ccard" href={href ?? `/courses/${slug}`}>
      <span className="ccard__media" style={{ position: "relative" }}>
        {isFlagship && (
          <span className="tag tag--ink" style={{ position: "absolute", left: 12, top: 12, zIndex: 2 }}>
            <Star className="ic" strokeWidth={1.75} />Flagship
          </span>
        )}
        {cover_image_url ? (
          <Image
            src={cover_image_url}
            alt={`${title} course cover`}
            fill
            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <span className="ccard__ph">{title}</span>
        )}
      </span>
      <span className="ccard__bar">
        <span>{CATEGORY_LABEL[category]}</span>
        <span className="lvl"><BarChart3 className="ic" strokeWidth={1.75} />{LEVEL_LABEL[level]}</span>
      </span>
      <span className="ccard__body">
        <span className="ccard__t">{title}</span>
        {course.subtitle && <span className="ccard__d">{course.subtitle}</span>}
        <span className="ccard__f">
          <span className="dur"><Clock className="ic" strokeWidth={1.75} />{duration_weeks ? `${duration_weeks} weeks` : "Self paced"}</span>
          <span className="ccard__p">
            {isFlagship ? (
              <>
                {pricing.active && pricing.original !== null && <s>{formatInr(pricing.original)}</s>}
                {formatInr(pricing.current)}
                {pricing.active && <span className="save">Save {pricing.savings}%</span>}
              </>
            ) : (
              <>
                {course.mrp && Number(course.mrp) > Number(course.price) && <s>{formatInr(course.mrp)}</s>}
                {formatInr(course.price)}
              </>
            )}
          </span>
          <span className="ccard__go"><ArrowRight className="ic" strokeWidth={1.75} /></span>
        </span>
      </span>
    </Link>
  );
}
