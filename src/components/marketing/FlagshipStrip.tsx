import Image from "next/image";
import Link from "next/link";
import { Award, ArrowRight, CalendarDays, Star, Timer, Users } from "lucide-react";
import type { CSSProperties } from "react";

import { OfferCountdown } from "@/components/marketing/OfferCountdown";
import { formatInr, getOfferPricing } from "@/lib/utils";
import type { FlagshipCourse } from "@/types/flagship";

import { FlagshipStripMotion } from "./FlagshipStripMotion";

const FALLBACK = [
  "/images/site/photo-mentor.jpg",
  "/images/site/photo-laptop-study.jpg",
  "/images/site/photo-classroom.jpg",
];

export function FlagshipStrip({ courses }: { courses: FlagshipCourse[] }) {
  if (courses.length === 0) return null;

  const countdownCourse = courses
    .filter((course) => course.show_countdown && getOfferPricing(course).active && course.offer_ends_at)
    .filter((course) => Number.isFinite(new Date(course.offer_ends_at!).getTime()))
    .sort((a, b) => new Date(a.offer_ends_at!).getTime() - new Date(b.offer_ends_at!).getTime())[0];

  return (
    <section className="sec flag" id="flagship">
      <div className="wrap">
        <div className="shead shead--split reveal">
          <div>
            <p className="over"><span className="over__bar" />Flagship programs · Founding batch</p>
            <h2 className="h2">Go deeper with our <span className="hl">flagship</span> programs</h2>
            <p className="lead">{courses.length} mentor-led programs in AI and business growth.</p>
          </div>
          {countdownCourse && (
            <div className="countdown">
              <Timer className="ic" strokeWidth={1.75} />
              <span className="countdown__l">Launch offer</span>
              <span className="countdown__v">Offer ends in <b><OfferCountdown endsAt={countdownCourse.offer_ends_at} /></b></span>
            </div>
          )}
        </div>

        <FlagshipStripMotion>
          {courses.map((course, index) => {
            const pricing = getOfferPricing(course);
            const href = `/courses/${course.slug}`;
            const image = course.cover_image_url || FALLBACK[index % FALLBACK.length];

            return (
              <article
                className={`fcard ${index % 2 ? "fcard--yel" : "fcard--ink"} reveal`}
                style={{ "--d": `${index * 90}ms` } as CSSProperties}
                key={course.id}
              >
                <Link className="fcard__media" href={href} tabIndex={-1}>
                  <Image src={image} alt="" fill sizes="(max-width: 720px) 86vw, 33vw" loading="lazy" />
                  <span className="badge-flag"><Star className="ic" strokeWidth={1.75} />Flagship</span>
                </Link>
                <div className="fcard__body">
                  <h3 className="fcard__t"><Link href={href}>{course.title}</Link></h3>
                  {course.subtitle && <p className="fcard__s">{course.subtitle}</p>}
                  <ul className="meta">
                    {course.duration_weeks !== null && <li><CalendarDays className="ic" strokeWidth={1.75} />{course.duration_weeks} weeks</li>}
                    <li><Users className="ic" strokeWidth={1.75} />Mentor-led</li>
                    <li><Award className="ic" strokeWidth={1.75} />Certificate</li>
                  </ul>
                  <div className="chips">
                    {course.tools.slice(0, 3).map((tool) => <span className="chip" key={tool}>{tool}</span>)}
                  </div>
                  <div className="fcard__price">
                    <div className="price">
                      <span className="price__now">{formatInr(pricing.current)}</span>
                      {pricing.active && pricing.original !== null && <s>{formatInr(pricing.original)}</s>}
                    </div>
                    <div className="price__tags">
                      {pricing.savings > 0 && <span className="save">Save {pricing.savings}%</span>}
                      {pricing.active && course.offer_label && <span className="offer">{course.offer_label}</span>}
                    </div>
                  </div>
                  <Link className="btn btn--card btn--block" href={href}>View program <ArrowRight className="ic" strokeWidth={1.75} /></Link>
                </div>
              </article>
            );
          })}
        </FlagshipStripMotion>
        <p className="swipe">Swipe to see all {courses.length} <ArrowRight className="ic" strokeWidth={1.75} /></p>
        <div className="center reveal">
          <Link className="btn btn--yellow btn--lg" href="/flagship">Explore flagship programs <ArrowRight className="ic" strokeWidth={1.75} /></Link>
        </div>
      </div>
    </section>
  );
}
