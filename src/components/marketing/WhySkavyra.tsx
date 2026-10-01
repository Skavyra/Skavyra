"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { REASONS } from "@/lib/content";

import { Quarter } from "./Quarter";
import { SectionHeading } from "./SectionHeading";

const SHADES = ["#F2C75C", "#DDAA2F", "#B98A24", "#8E6718"];

export function WhySkavyra() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const list = cardsRef.current;
    if (!section || !list) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-reason-card]", list);
      const media = gsap.matchMedia();

      media.add(
        {
          desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
          tablet: "(min-width: 640px) and (max-width: 1023px) and (prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 639px) and (prefers-reduced-motion: no-preference)",
        },
        ({ conditions }) => {
          if (!conditions) return;

          if (conditions.desktop) {
            const story = gsap.timeline({
              scrollTrigger: {
                trigger: section,
                start: "top top+=80",
                end: "+=800",
                pin: true,
                scrub: 0.7,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onLeave: () => gsap.set(cards, { clearProps: "transform,opacity" }),
                onLeaveBack: () => gsap.set(cards, { clearProps: "transform,opacity" }),
              },
            });

            story.set(cards, { scale: 0.98, opacity: 0.9 });
            cards.forEach((card, index) => {
              const start = index * 1.05;
              story.to(card, { scale: 1.035, opacity: 1, y: -5, duration: 0.42, ease: "power2.out" }, start);
              story.to(card, { scale: 0.98, opacity: 0.9, y: 0, duration: 0.45, ease: "power2.inOut" }, start + 0.45);
            });
            story.to(cards, { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" }, 4.45);
            return;
          }

          gsap.from(cards, {
            opacity: 0,
            y: conditions.tablet ? 28 : 16,
            duration: conditions.tablet ? 0.52 : 0.44,
            stagger: 0.08,
            ease: "power3.out",
            clearProps: "transform,opacity,visibility",
            scrollTrigger: {
              trigger: list,
              start: "top 84%",
              once: true,
            },
          });
        },
      );

      return () => media.revert();
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section relative overflow-hidden bg-ivory/60">
      <div className="container">
        <SectionHeading title="Why Skavyra" description="Practical learning, shaped around the work you want to do next." />
        <ul ref={cardsRef} className="mt-fluid-sm grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((r, i) => (
            <li key={r.title} data-reason-card className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-ink/10 bg-card p-6 transition duration-300 motion-safe:hover:-translate-y-1 hover:border-gold-500/50 hover:shadow-[0_20px_42px_-32px_rgba(13,13,13,0.38)]">
              <span aria-hidden="true" className="absolute right-0 top-0 h-24 w-24 translate-x-1/3 -translate-y-1/3 rounded-full bg-gold-300/10 blur-2xl transition group-hover:bg-gold-300/25" />
              <Quarter className="relative size-9 transition-transform duration-500 motion-safe:group-hover:rotate-6" fill={SHADES[i]} />
              <h3 className="relative text-lg">{r.title}</h3>
              <p className="relative text-sm leading-relaxed text-muted-foreground">{r.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
