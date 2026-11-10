import Link from "next/link";
import { ArrowRight, Check, Sparkles, Star } from "lucide-react";

import { LEVEL_LABEL } from "@/lib/constants";
import { formatInr, getOfferPricing } from "@/lib/utils";
import type { FlagshipCourse } from "@/types/flagship";

import { OfferCountdown } from "./OfferCountdown";

export function FlagshipCard({ course }: { course: FlagshipCourse }) {
  const outcomes = (course.learning_outcomes ?? "")
    .split("\n")
    .map((outcome) => outcome.trim())
    .filter(Boolean)
    .slice(0, 4);
  const pricing = getOfferPricing(course);

  return (
    <article id={course.slug} className="fp reveal">
      <Link className="fp__img" href={`/courses/${course.slug}`} tabIndex={-1}>
        <img src={course.cover_image_url || "/images/site/photo-classroom.jpg"} alt={`${course.title} program cover`} loading="lazy" />
        <span className="badge-flag"><Star className="ic" strokeWidth={1.75} />Flagship</span>
      </Link>
      <div className="fp__b">
        <p className="fp__lvl">{LEVEL_LABEL[course.level]} · {course.duration_weeks ? `${course.duration_weeks} weeks` : "Self paced"}</p>
        <h2>{course.title}</h2>
        {course.subtitle && <p className="fp__tag">{course.subtitle}</p>}
        {outcomes.length > 0 && <>
          <h3>What you&apos;ll learn</h3>
          <ul className="checks">
            {outcomes.map((outcome) => <li key={outcome}><Check className="ic" strokeWidth={1.75} /><span>{outcome}</span></li>)}
          </ul>
        </>}
        {course.tools.length > 0 && <ul className="chips" aria-label="Tools covered">{course.tools.map((tool) => <li className="chip" key={tool}>{tool}</li>)}</ul>}
        <div className="fp__buy">
          <div>
            {pricing.active && <div className="enroll__offer">
              {course.offer_label && <span className="offerpill"><Sparkles className="ic" strokeWidth={1.75} />{course.offer_label}</span>}
              {course.show_countdown && course.offer_ends_at && <span className="cdown">Offer ends in <b><OfferCountdown endsAt={course.offer_ends_at} /></b></span>}
            </div>}
            <div className="enroll__price">
              <b>{formatInr(pricing.current)}</b>
              {pricing.active && pricing.original !== null && <><s>{formatInr(pricing.original)}</s><em>Save {pricing.savings}%</em></>}
            </div>
          </div>
          <div className="fp__btns">
            <Link className="btn btn--y btn--lg" href={`/courses/${course.slug}`}>Enroll now <ArrowRight className="ic" strokeWidth={1.75} /></Link>
            <Link className="btn btn--line btn--lg" href={`/contact?course=${encodeURIComponent(course.title)}`}>Talk to us</Link>
          </div>
        </div>
      </div>
    </article>
  );
}
