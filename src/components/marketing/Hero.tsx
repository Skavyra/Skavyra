"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Button } from "@/components/ui/button";
import { CATEGORY_LABEL } from "@/lib/constants";
import { HERO, HERO_FALLBACK_TRACKS } from "@/lib/content";
import type { Course } from "@/types";

import { ArcTracks, type ArcTrack } from "./ArcTracks";
import { HeroHeadline } from "./HeroHeadline";

/** Hero A, "Arc of tracks": centred badge, headline, two actions, and the arc of course cards. */
export function Hero({ courses }: { courses: Pick<Course, "title" | "slug" | "category" | "duration_weeks">[] }) {
  const heroRef = useRef<HTMLElement>(null);
  const arcScrollProgress = useRef(0);
  const tracks: ArcTrack[] =
    courses.length > 0
      ? courses.map((c) => ({
          title: c.title,
          meta: [CATEGORY_LABEL[c.category], c.duration_weeks ? `${c.duration_weeks} weeks` : null].filter(Boolean).join(", "),
          href: `/courses/${c.slug}`,
        }))
      : HERO_FALLBACK_TRACKS;

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotion) return;

      const background = hero.querySelector<HTMLElement>("[data-hero-background]");
      const badge = hero.querySelector<HTMLElement>("[data-hero-badge]");
      const characters = hero.querySelectorAll<HTMLElement>("[data-hero-char]");
      const copy = hero.querySelector<HTMLElement>("[data-hero-copy]");
      const actions = hero.querySelectorAll<HTMLElement>("[data-hero-action]");
      const arc = hero.querySelector<HTMLElement>("[data-hero-arc]");
      const headline = hero.querySelector<HTMLElement>("[data-hero-headline]");

      const entrance = gsap.timeline({ defaults: { ease: "power3.out" } });
      if (background) entrance.fromTo(background, { opacity: 0.72 }, { opacity: 1, duration: 0.7 }, 0);
      if (badge) entrance.fromTo(badge, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.42 }, 0.08);
      if (characters.length) entrance.fromTo(characters, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, stagger: 0.009, ease: "power2.out" }, 0.28);
      if (copy) entrance.fromTo(copy, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.42 }, ">+=0.08");
      if (actions.length) entrance.fromTo(actions, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.38, stagger: 0.09 }, ">+=0.06");
      if (arc) entrance.fromTo(arc, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.58 }, ">+=0.08");

      const scrollTransition = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 0.7,
          onUpdate: (self) => {
            arcScrollProgress.current = self.progress;
          },
        },
      });
      if (headline) scrollTransition.to(headline, { y: -30, autoAlpha: 0.88, ease: "none" }, 0);
      if (background) scrollTransition.to(background, { opacity: 0.68, ease: "none" }, 0);
      if (arc) scrollTransition.to(arc, { y: -28, scale: 0.98, autoAlpha: 0.78, ease: "none" }, 0);

      const pointerQuery = gsap.matchMedia();
      pointerQuery.add("(min-width: 1024px) and (pointer: fine)", () => {
        const foreground = hero.querySelector<HTMLElement>("[data-hero-foreground]");
        const moveForeground = foreground ? gsap.quickTo(foreground, "x", { duration: 0.8, ease: "power2.out" }) : null;
        const moveArc = arc ? gsap.quickTo(arc, "x", { duration: 0.9, ease: "power2.out" }) : null;
        const onPointerMove = (event: PointerEvent) => {
          const bounds = hero.getBoundingClientRect();
          const position = (event.clientX - bounds.left) / bounds.width - 0.5;
          moveForeground?.(position * -3);
          moveArc?.(position * 6);
        };
        const onPointerLeave = () => {
          moveForeground?.(0);
          moveArc?.(0);
        };
        hero.addEventListener("pointermove", onPointerMove, { passive: true });
        hero.addEventListener("pointerleave", onPointerLeave, { passive: true });
        return () => {
          hero.removeEventListener("pointermove", onPointerMove);
          hero.removeEventListener("pointerleave", onPointerLeave);
        };
      });

      return () => pointerQuery.revert();
    }, hero);

    return () => {
      arcScrollProgress.current = 0;
      context.revert();
    };
  }, []);

  return (
    <section ref={heroRef} className="theme-ink relative overflow-hidden bg-background text-foreground">
      {/* the large warm disc behind the headline */}
      <div
        aria-hidden="true"
        data-hero-background
        className="pointer-events-none absolute left-1/2 top-[18%] aspect-square w-[min(1180px,150vw)] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(circle at 50% 40%, rgba(142,103,24,0.38), rgba(142,103,24,0.16) 45%, rgba(13,13,13,0) 70%)" }}
      />
      <div data-hero-foreground className="container relative flex flex-col items-center pt-fluid-md text-center">
        <p data-hero-badge className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-charcoal/80 px-4 py-2 text-sm font-semibold text-gold-100">
          <span className="size-1.5 rounded-full bg-gold-300" aria-hidden="true" />
          {HERO.badge}
        </p>
        <HeroHeadline titleStart={HERO.titleStart} titleAccent={HERO.titleAccent} />
        <p data-hero-copy className="mt-6 max-w-[40rem] text-fluid-lg text-ivory/75">{HERO.body}</p>
        <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button asChild variant="gold" size="lg" className="h-14 px-7">
            <Link href="/courses" data-hero-action>
              Explore courses <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-14 border-white/20 px-7 hover:bg-charcoal">
            <Link href="/contact" data-hero-action>Talk to a counsellor</Link>
          </Button>
        </div>
      </div>
      <div data-hero-arc className="relative mt-fluid-sm">
        <ArcTracks tracks={tracks} motionProgressRef={arcScrollProgress} />
      </div>
    </section>
  );
}
