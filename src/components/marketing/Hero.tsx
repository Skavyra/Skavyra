import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CATEGORY_LABEL } from "@/lib/constants";
import { HERO, HERO_FALLBACK_TRACKS } from "@/lib/content";
import type { Course } from "@/types";

import { ArcTracks, type ArcTrack } from "./ArcTracks";

/** Hero A, "Arc of tracks": centred badge, headline, two actions, and the arc of course cards. */
export function Hero({ courses }: { courses: Pick<Course, "title" | "slug" | "category" | "duration_weeks">[] }) {
  const tracks: ArcTrack[] =
    courses.length > 0
      ? courses.map((c) => ({
          title: c.title,
          meta: [CATEGORY_LABEL[c.category], c.duration_weeks ? `${c.duration_weeks} weeks` : null].filter(Boolean).join(", "),
          href: `/courses/${c.slug}`,
        }))
      : HERO_FALLBACK_TRACKS;

  return (
    <section className="theme-ink relative overflow-hidden bg-background text-foreground">
      {/* the large warm disc behind the headline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[18%] aspect-square w-[min(1180px,150vw)] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(circle at 50% 40%, rgba(142,103,24,0.38), rgba(142,103,24,0.16) 45%, rgba(13,13,13,0) 70%)" }}
      />
      <div className="container relative flex flex-col items-center pt-fluid-md text-center">
        <p className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-charcoal/80 px-4 py-2 text-sm font-semibold text-gold-100">
          <span className="size-1.5 rounded-full bg-gold-300" aria-hidden="true" />
          {HERO.badge}
        </p>
        <h1 className="mt-7 max-w-[15ch] text-fluid-hero font-bold tracking-[-0.035em] sm:max-w-none">
          {HERO.titleStart} <br className="hidden sm:block" />
          <span className="text-gold-300">{HERO.titleAccent}</span>
        </h1>
        <p className="mt-6 max-w-[40rem] text-fluid-lg text-ivory/75">{HERO.body}</p>
        <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button asChild variant="gold" size="lg" className="h-14 px-7">
            <Link href="/courses">
              Explore courses <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-14 border-white/20 px-7 hover:bg-charcoal">
            <Link href="/contact">Talk to a counsellor</Link>
          </Button>
        </div>
      </div>
      <div className="relative mt-fluid-sm">
        <ArcTracks tracks={tracks} />
      </div>
    </section>
  );
}
