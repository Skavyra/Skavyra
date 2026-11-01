import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight } from "lucide-react";

import { ContactCta } from "@/components/marketing/ContactCta";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { MentorCard } from "@/components/marketing/MentorCard";
import { WhySkavyra } from "@/components/marketing/WhySkavyra";
import { ABOUT } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "About", description: ABOUT.title };
export const revalidate = 600;

export default async function AboutPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("id, slug, title, mentor_name, mentor_company, mentor_avatar_url")
    .eq("status", "published")
    .not("mentor_name", "is", null)
    .order("sort_order", { ascending: true });

  // one card per mentor, listing the courses they teach
  const mentors = new Map<string, { name: string; company: string | null; avatar: string | null; courses: { slug: string; title: string }[] }>();
  for (const c of data ?? []) {
    const key = c.mentor_name!;
    const entry = mentors.get(key) ?? { name: key, company: c.mentor_company, avatar: c.mentor_avatar_url, courses: [] };
    entry.courses.push({ slug: c.slug, title: c.title });
    mentors.set(key, entry);
  }
  const featuredMentors = [...mentors.values()].slice(0, 6);
  const [missionFirst, missionSecond] = ABOUT.mission.split(". ");
  const titleWords = ABOUT.title.split(" ");
  const titleStart = titleWords.slice(0, -3).join(" ");
  const titleHighlight = titleWords.slice(-3).join(" ");

  return (
    <>
      <section className="pb">
        <span className="pb__q" aria-hidden="true" />
        <span className="pb__dots" aria-hidden="true" />
        <div className="wrap">
          <div className="pb__grid">
            <div className="reveal">
              <nav className="crumbs" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <ChevronRight className="ic" strokeWidth={1.75} aria-hidden="true" />
                <b>About</b>
              </nav>
              <p className="tagrule">Learn <i /> Build <i /> Grow</p>
              <h1 className="ptitle">{titleStart} <span className="hl">{titleHighlight}</span></h1>
              {ABOUT.paragraphs.map((paragraph, index) => (
                <p key={paragraph} className="plead" style={index === 1 ? { marginTop: 12 } : undefined}>{paragraph}</p>
              ))}
              <div className="btns">
                <Link className="btn btn--ink btn--lg" href="/courses">Explore courses <ArrowRight className="ic" strokeWidth={1.75} /></Link>
                <Link className="btn btn--line btn--lg" href="/contact?topic=college">Partner with us</Link>
              </div>
              <ul className="ticks">
                {["IT and non-IT courses", "Mentors from the industry", "Project-based learning"].map((point) => (
                  <li key={point}><Check className="ic" strokeWidth={1.75} aria-hidden="true" />{point}</li>
                ))}
              </ul>
            </div>
            <div className="ab__mark reveal" aria-hidden="true">
              <span className="ab__ring" />
              <img className="ab__logo" src="/logo-mark.svg" alt="" />
              <figure>
                <Image src="/images/site/photo-classroom.jpg" alt="" fill sizes="(max-width:900px) 80vw, 420px" style={{ objectFit: "cover" }} />
              </figure>
            </div>
          </div>
        </div>
      </section>

      <section className="mission">
        <div className="wrap reveal">
          <p className="over"><span className="over__bar" />Our mission</p>
          <p className="big">{missionFirst}. <span>{missionSecond}</span></p>
        </div>
      </section>

      <WhySkavyra />
      <HowItWorks />

      <section className="sec" id="mentors">
        <div className="wrap">
          <div className="shead shead--split reveal">
            <div>
              <p className="over"><span className="over__bar" />The people who teach</p>
              <h2 className="h2"><span className="hl">Mentors</span></h2>
            </div>
            <p className="lead lead--side">Every course is led by someone practising the subject today. These are the mentors teaching right now.</p>
          </div>
          <div className="mgrid mgrid--3">
            {featuredMentors.map((mentor, index) => <MentorCard key={mentor.name} index={index} mentor={{ ...mentor, bio: null, categories: [] }} />)}
            {featuredMentors.length === 0 && <div className="cempty"><p>Mentor profiles appear here as courses are published.</p></div>}
          </div>
          <div className="center">
            <Link className="btn btn--line btn--lg" href="/mentors">See all mentors <ArrowRight className="ic" strokeWidth={1.75} /></Link>
          </div>
        </div>
      </section>
      <ContactCta />
    </>
  );
}
