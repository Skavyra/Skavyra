import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Code, GraduationCap, Phone } from "lucide-react";

import { CATEGORY_LABEL } from "@/lib/constants";
import { HERO, HERO_FALLBACK_TRACKS } from "@/lib/content";
import type { Course } from "@/types";

import { HeroHeadline } from "./HeroHeadline";

/** Public home hero with a course ticker built from the available course data. */
export function Hero({ courses }: { courses: Pick<Course, "title" | "slug" | "category" | "duration_weeks">[] }) {
  const tracks = courses.length > 0
    ? courses.map((course) => ({
        title: course.title,
        meta: [CATEGORY_LABEL[course.category], course.duration_weeks ? `${course.duration_weeks} weeks` : null].filter(Boolean).join(", "),
        href: `/courses/${course.slug}`,
      }))
    : HERO_FALLBACK_TRACKS;

  return (
    <section className="hero">
      <p className="vlabel" aria-hidden="true">Learn <i /> Build <i /> Grow</p>
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <p className="over a1"><span className="over__bar" />{HERO.badge}</p>
          <HeroHeadline titleStart={HERO.titleStart} titleAccent={HERO.titleAccent} />
          <p className="hero__p a3">{HERO.body}</p>
          <div className="hero__cta a4">
            <Link className="btn btn--ink btn--lg" href="/courses">Explore courses <ArrowRight className="ic" strokeWidth={1.75} /></Link>
            <Link className="btn btn--line btn--lg" href="/contact"><Phone className="ic" strokeWidth={1.75} />Talk to a counsellor</Link>
          </div>
          <div className="hero__stat a5">
            <b><BookOpen className="ic" strokeWidth={1.75} /></b>
            <span>Courses across IT and non-IT,<br />taught by mentors</span>
          </div>
        </div>
        <div className="hero__art a-art">
          <span className="blk blk--y hero__blk" aria-hidden="true" />
          <span className="hero__dots" aria-hidden="true" />
          <span className="frame hero__frame" aria-hidden="true" />
          <figure className="hero__photo">
            <Image src="/images/site/photo-hero-student.jpg" alt="A student smiling in front of a chalkboard" fill priority style={{ objectFit: "cover" }} />
          </figure>
          <div className="hero__tile">
            <span className="hero__tile-ic"><GraduationCap className="ic" strokeWidth={1.75} /></span>
            <b>Mentor-led</b>
            <small>Live + recorded classes</small>
          </div>
        </div>
      </div>
      <div className="tracks" aria-label="Our courses">
        <div className="tracks__row">
          {[false, true].map((duplicate) => (
            <div className="tracks__set" aria-hidden={duplicate || undefined} key={duplicate ? "duplicate" : "primary"}>
              {tracks.map((track, index) => {
                const Icon = track.meta === "IT" || track.meta.startsWith("IT,") ? Code : BookOpen;
                return (
                  <Link className="track" href={"href" in track ? track.href ?? "/courses" : "/courses"} tabIndex={duplicate ? -1 : undefined} key={`${track.title}-${index}`}>
                    <span className="track__ic"><Icon className="ic" strokeWidth={1.75} /></span>
                    <span><span className="track__t">{track.title}</span><span className="track__m">{track.meta}</span></span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
