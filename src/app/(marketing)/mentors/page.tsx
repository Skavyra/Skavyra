import type { Metadata } from "next";
import Link from "next/link";

import { ContactCta } from "@/components/marketing/ContactCta";
import { MentorCard, type MentorCardData } from "@/components/marketing/MentorCard";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mentors",
  description: "Meet the mentors who teach Skavyra courses.",
};
export const revalidate = 600;

type Props = { searchParams: Promise<{ stream?: string }> };
type Mentor = Omit<MentorCardData, "categories"> & { categories: Set<string> };

export default async function MentorsPage({ searchParams }: Props) {
  const { stream } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("id, slug, title, category, mentor_name, mentor_company, mentor_avatar_url, mentor_bio")
    .eq("status", "published")
    .not("mentor_name", "is", null)
    .order("sort_order", { ascending: true });

  const mentors = new Map<string, Mentor>();
  for (const course of data ?? []) {
    const name = course.mentor_name?.trim();
    if (!name) continue;

    let mentor = mentors.get(name);
    if (!mentor) {
      mentor = {
        name,
        company: course.mentor_company?.trim() || null,
        avatar: course.mentor_avatar_url?.trim() || null,
        bio: course.mentor_bio?.trim() || null,
        categories: new Set<string>(),
        courses: [],
      };
      mentors.set(name, mentor);
    }

    if (!mentor.company && course.mentor_company?.trim()) mentor.company = course.mentor_company.trim();
    if (!mentor.avatar && course.mentor_avatar_url?.trim()) mentor.avatar = course.mentor_avatar_url.trim();
    if (!mentor.bio && course.mentor_bio?.trim()) mentor.bio = course.mentor_bio.trim();
    if (course.category) mentor.categories.add(course.category);
    mentor.courses.push({ slug: course.slug, title: course.title });
  }

  const allMentors = [...mentors.values()];
  const filteredMentors = stream === "it"
    ? allMentors.filter((mentor) => mentor.categories.has("it") || mentor.categories.has("both"))
    : stream === "non_it"
      ? allMentors.filter((mentor) => mentor.categories.has("non_it") || mentor.categories.has("both"))
      : allMentors;
  const activeStream = stream === "it" || stream === "non_it" ? stream : "all";
  const filters = [
    { label: "All", href: "/mentors", value: "all" },
    { label: "IT", href: "/mentors?stream=it", value: "it" },
    { label: "Non-IT", href: "/mentors?stream=non_it", value: "non_it" },
  ];

  return (
    <>
      <section className="theme-ink relative overflow-hidden bg-ink pt-fluid-lg pb-16 text-ivory sm:pb-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 size-[30rem] rounded-full bg-gold-300/15 blur-3xl" />
        <div className="container relative z-10">
          <p className="text-xs uppercase tracking-widest text-gold-300">OUR MENTORS</p>
          <h1 className="mt-3 text-fluid-3xl text-ivory">Learn from people who do the work</h1>
          <p className="mt-4 max-w-2xl text-ivory/70">Every Skavyra course is led by a mentor who practises the subject today.</p>
          {allMentors.length > 0 && (
            <p className="mt-6 inline-flex rounded-full border border-gold-300/40 px-4 py-1.5 text-sm font-semibold text-gold-100">
              {allMentors.length} mentors
            </p>
          )}
        </div>
      </section>

      <nav aria-label="Filter mentors" className="container mt-8 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const active = activeStream === filter.value;
          return (
            <Link
              key={filter.value}
              href={filter.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${active ? "border-ink bg-ink text-gold-300" : "border-ink/15 hover:border-gold-300"}`}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      <section aria-label="Mentor profiles" className="container mt-6 pb-fluid-lg">
        {filteredMentors.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMentors.map((mentor) => (
              <MentorCard
                key={mentor.name}
                mentor={{ ...mentor, categories: [...mentor.categories] }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed p-10 text-center text-ink/60">
            <p>Mentor profiles appear here as courses are published.</p>
            {stream && <Link href="/mentors" className="mt-3 inline-block font-semibold text-gold-700 hover:underline">Clear filter</Link>}
          </div>
        )}
      </section>
      <ContactCta />
    </>
  );
}
