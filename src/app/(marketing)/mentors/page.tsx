import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
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
      <section className="pb">
        <span className="pb__q" aria-hidden="true" />
        <span className="pb__q2" aria-hidden="true" />
        <span className="pb__dots" aria-hidden="true" />
        <div className="wrap">
          <div className="reveal">
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <ChevronRight className="ic" strokeWidth={1.75} aria-hidden="true" />
              <b>Mentors</b>
            </nav>
            <p className="over"><span className="over__bar" />Our mentors</p>
            <h1 className="ptitle">Learn from people who <span className="hl">do the work</span></h1>
            <p className="plead mentors__lead">Every Skavyra course is led by a mentor who practises the subject today.</p>
            {allMentors.length > 0 && <p className="mcount"><b>{allMentors.length}</b>mentors</p>}
          </div>
        </div>
      </section>

      <div className="wrap">
        <nav className="mfilter" aria-label="Filter mentors">
          {filters.map((filter) => {
            const active = activeStream === filter.value;
            return <Link key={filter.value} href={filter.href} aria-current={active ? "page" : undefined}>{filter.label}</Link>;
          })}
        </nav>

        {filteredMentors.length > 0 ? (
          <section aria-label="Mentor profiles" className="mgrid">
            {filteredMentors.map((mentor, index) => (
              <MentorCard key={mentor.name} mentor={{ ...mentor, categories: [...mentor.categories] }} index={index} />
            ))}
          </section>
        ) : (
          <div className="cempty">
            <p>Mentor profiles appear here as courses are published.</p>
            {stream && <Link href="/mentors">Clear filter</Link>}
          </div>
        )}
      </div>
      <ContactCta />
    </>
  );
}
