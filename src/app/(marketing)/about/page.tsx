import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

import { TaglineRule } from "@/components/brand/logo";
import { ContactCta } from "@/components/marketing/ContactCta";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { WhySkavyra } from "@/components/marketing/WhySkavyra";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ABOUT } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import { initials } from "@/lib/utils";

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
  const [missionFirst, missionSecond] = ABOUT.mission.split(". ");

  return (
    <>
      <section className="relative overflow-hidden bg-ivory text-ink">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/2 size-[36rem] -translate-y-1/2 rounded-full bg-gold-300/20 blur-3xl" />
        <div className="container section relative z-10 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <TaglineRule className="text-gold-700" />
            <h1 className="mt-5 text-fluid-3xl text-ink">{ABOUT.title}</h1>
            {ABOUT.paragraphs.map((p) => (
              <p key={p} className="mt-5 max-w-2xl text-fluid-base leading-relaxed text-ink/70">
                {p}
              </p>
            ))}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="gold" size="lg">
                <Link href="/courses">Explore courses</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-ink/20 text-ink hover:bg-ink/5">
                <Link href="/contact?topic=college">Partner with us</Link>
              </Button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink/70">
              {["IT and non-IT courses", "Mentors from the industry", "Project-based learning"].map((point) => (
                <li key={point} className="inline-flex items-center gap-2">
                  <Check aria-hidden="true" className="size-4 text-gold-700" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mx-auto hidden aspect-square w-full max-w-md place-items-center rounded-full border border-gold-300/50 bg-white/60 p-16 shadow-[0_40px_80px_-40px_rgba(142,103,24,0.45)] lg:grid">
            <div className="relative size-full">
              <Image
                src="/logo-mark.svg"
                alt="Skavyra logo"
                fill
                sizes="(min-width: 1024px) 40vw, 0px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="theme-ink relative overflow-hidden bg-ink py-16 text-ivory sm:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-300/10 blur-3xl" />
        <div className="container relative z-10 max-w-4xl text-center">
          <p className="text-xs uppercase tracking-widest text-gold-300">OUR MISSION</p>
          <p className="mt-4 font-display text-2xl font-bold leading-snug sm:text-4xl">
            <span className="text-ivory">{missionFirst}.</span>{" "}
            <span className="text-gold-300">{missionSecond}</span>
          </p>
        </div>
      </section>

      <WhySkavyra />
      <HowItWorks />

      <section id="mentors" className="section container scroll-mt-24">
        <SectionHeading
          title="Mentors"
          description="Every course is led by someone practising the subject today. These are the mentors teaching right now."
        />
        {mentors.size === 0 ? (
          <p className="mt-fluid-sm rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
            Mentor profiles appear here as courses are published.
          </p>
        ) : (
          <ul className="mt-fluid-sm grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...mentors.values()].map((m) => (
              <li key={m.name} className="group flex flex-col gap-4 rounded-2xl border border-ink/10 bg-white p-6 transition-[transform,border-color,box-shadow] duration-300 motion-safe:hover:-translate-y-1 hover:border-gold-300/70 hover:shadow-[0_20px_42px_-30px_rgba(142,103,24,0.4)]">
                <div className="flex items-center gap-4">
                  <Avatar className="size-14">
                    {m.avatar && <AvatarImage src={m.avatar} alt="" />}
                    <AvatarFallback className="bg-ink font-bold text-gold-300">{initials(m.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-display text-lg font-bold leading-tight">{m.name}</p>
                    {m.company && <p className="truncate text-sm text-muted-foreground">{m.company}</p>}
                  </div>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {m.courses.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/courses/${c.slug}`}
                        className="rounded-full border px-3 py-1 text-xs font-semibold hover:border-gold-300"
                      >
                        {c.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
      <ContactCta />
    </>
  );
}
