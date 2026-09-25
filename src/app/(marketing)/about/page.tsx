import type { Metadata } from "next";
import Link from "next/link";

import { TaglineRule } from "@/components/brand/logo";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Quarter } from "@/components/marketing/Quarter";
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

  return (
    <>
      <section className="theme-ink bg-background text-foreground">
        <div className="container section grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <TaglineRule className="text-gold-300" />
            <h1 className="mt-5 text-fluid-3xl">{ABOUT.title}</h1>
            {ABOUT.paragraphs.map((p) => (
              <p key={p} className="mt-5 max-w-2xl text-fluid-base leading-relaxed text-ivory/75">
                {p}
              </p>
            ))}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="gold" size="lg">
                <Link href="/courses">Explore courses</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/20 hover:bg-charcoal">
                <Link href="/contact?topic=college">Partner with us</Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden aspect-square place-items-center lg:grid">
            <Quarter className="w-2/3 opacity-90" fill="#8E6718" />
            <Quarter className="absolute right-[18%] top-[22%] w-1/3 rotate-90" fill="#DDAA2F" />
            <Quarter className="absolute bottom-[26%] right-[26%] w-1/6 rotate-180" fill="#F2C75C" />
          </div>
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
              <li key={m.name} className="flex flex-col gap-4 rounded-2xl border bg-card p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="size-14">
                    {m.avatar && <AvatarImage src={m.avatar} alt="" />}
                    <AvatarFallback>{initials(m.name)}</AvatarFallback>
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
    </>
  );
}
