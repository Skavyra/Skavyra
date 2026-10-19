import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";

export type MentorCardData = {
  name: string;
  company?: string | null;
  avatar?: string | null;
  bio?: string | null;
  categories: string[];
  courses: { slug: string; title: string }[];
};

export function MentorCard({ mentor }: { mentor: MentorCardData }) {
  const showsIt = mentor.categories.some((category) => category === "it" || category === "both");
  const showsNonIt = mentor.categories.some((category) => category === "non_it" || category === "both");

  return (
    <article className="group flex h-full flex-col rounded-3xl border border-ink/10 bg-white p-6 transition duration-300 motion-safe:hover:-translate-y-1 hover:border-gold-300 hover:shadow-[0_24px_50px_-34px_rgba(142,103,24,0.45)]">
      <div className="flex items-center gap-4">
        <Avatar className="size-16 shrink-0">
          {mentor.avatar?.trim() && <AvatarImage src={mentor.avatar} alt="" />}
          <AvatarFallback className="bg-ink font-bold text-gold-300">{initials(mentor.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h2 className="break-words font-display text-lg font-bold leading-tight">{mentor.name}</h2>
          {mentor.company?.trim() && <p className="mt-1 break-words text-sm text-ink/60">{mentor.company}</p>}
        </div>
      </div>

      {(showsIt || showsNonIt) && (
        <ul className="mt-4 flex gap-2">
          {showsIt && <li className="rounded-full bg-gold-100/40 px-2.5 py-0.5 text-xs font-semibold text-[#805C14]">IT</li>}
          {showsNonIt && <li className="rounded-full bg-gold-100/40 px-2.5 py-0.5 text-xs font-semibold text-[#805C14]">Non-IT</li>}
        </ul>
      )}

      {mentor.bio?.trim() && <p className="mt-4 line-clamp-4 break-words text-sm leading-relaxed text-ink/70">{mentor.bio}</p>}

      <div className="mt-auto border-t border-ink/10 pt-5">
        <p className="text-xs font-bold uppercase tracking-widest text-ink/60">Teaches</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {mentor.courses.map((course) => (
            <li key={course.slug}>
              <Link
                href={`/courses/${course.slug}`}
                className="inline-flex max-w-full break-words rounded-full border border-ink/15 px-3 py-1 text-xs font-semibold hover:border-gold-300 hover:text-gold-700"
              >
                {course.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
