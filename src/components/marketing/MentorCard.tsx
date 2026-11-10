import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { initials } from "@/lib/utils";

export type MentorCardData = {
  name: string;
  company?: string | null;
  avatar?: string | null;
  bio?: string | null;
  categories: string[];
  courses: { slug: string; title: string }[];
};

export function MentorCard({ mentor, index = 0 }: { mentor: MentorCardData; index?: number }) {
  const showsIt = mentor.categories.some((category) => category === "it" || category === "both");
  const showsNonIt = mentor.categories.some((category) => category === "non_it" || category === "both");
  const categoryLabel = showsIt && showsNonIt ? "IT · Non-IT" : showsIt ? "IT" : showsNonIt ? "Non-IT" : null;
  const avatarClass = `mmono s${(index % 4) + 1}`;

  return (
    <article className={`mcard${mentor.bio ? " mcard--bio" : ""} reveal`}>
      <div className="mcard__top">
        {mentor.avatar?.trim()
          ? <img src={mentor.avatar} alt="" className={avatarClass} style={{ objectFit: "cover" }} />
          : <span className={avatarClass}>{initials(mentor.name)}</span>}
        {categoryLabel && <span className="mtag">{categoryLabel}</span>}
      </div>
      <h3>{mentor.name}</h3>
      {mentor.company?.trim() && <p className="mcard__co">{mentor.company}</p>}
      {mentor.bio?.trim() && <p className="mcard__bio">{mentor.bio}</p>}
      <div className="mcard__teach">
        <small>Teaches</small>
        {mentor.courses.map((course) => (
          <Link key={course.slug} href={`/courses/${course.slug}`}>
            {course.title}<ArrowUpRight className="ic" strokeWidth={1.75} />
          </Link>
        ))}
      </div>
    </article>
  );
}
