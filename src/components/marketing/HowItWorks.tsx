"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { STEPS } from "@/lib/content";

import { SectionHeading } from "./SectionHeading";

/** Learn, Build, Grow is a real sequence, so the steps are numbered. */
export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const stagesRef = useRef<HTMLOListElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stagesList = stagesRef.current;
    if (!section || !stagesList) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const stages = gsap.utils.toArray<HTMLElement>("[data-learning-stage]", stagesList);
      const badges = gsap.utils.toArray<HTMLElement>("[data-stage-badge]", stagesList);
      const media = gsap.matchMedia();

      media.add(
        {
          desktop: "(min-width: 1024px)",
          tablet: "(min-width: 640px) and (max-width: 1023px)",
          mobile: "(max-width: 639px)",
          reducedMotion: "(prefers-reduced-motion: reduce)",
        },
        ({ conditions }) => {
          if (!conditions) return;

          if (conditions.reducedMotion) {
            gsap.from(stages, {
              opacity: 0,
              duration: 0.18,
              stagger: 0.04,
              clearProps: "opacity",
              scrollTrigger: { trigger: stagesList, start: "top 84%", once: true },
            });
            return;
          }

          if (conditions.desktop) {
            const journey = gsap.timeline({
              scrollTrigger: {
                trigger: section,
                start: "top top+=80",
                end: "+=820",
                pin: true,
                scrub: 0.7,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onLeave: () => gsap.set([...stages, ...badges], { clearProps: "transform,opacity,borderColor,backgroundColor,color,boxShadow" }),
                onLeaveBack: () => gsap.set([...stages, ...badges], { clearProps: "transform,opacity,borderColor,backgroundColor,color,boxShadow" }),
              },
            });

            journey.set(stages, { scale: 1, opacity: 1, borderColor: "rgba(13,13,13,0.1)" });
            journey.set(badges, { backgroundColor: "#0D0D0D", color: "#DDAA2F" });
            if (pathRef.current) {
              journey.fromTo(pathRef.current, { strokeDashoffset: 60 }, { strokeDashoffset: 0, duration: 1, ease: "none" }, 0);
            }

            stages.forEach((stage, index) => {
              const badge = badges[index];
              const start = index * 0.9;
              journey.to(stage, {
                scale: 1.025,
                opacity: 1,
                y: -6,
                borderColor: "#B98A24",
                boxShadow: "0 20px 42px -32px rgba(13,13,13,0.4)",
                duration: 0.4,
                ease: "power2.out",
              }, start);
              if (badge) journey.to(badge, { backgroundColor: "#DDAA2F", color: "#0D0D0D", duration: 0.25 }, start);
              journey.to(stage, {
                scale: 1,
                opacity: 1,
                y: 0,
                borderColor: "rgba(13,13,13,0.1)",
                boxShadow: "0 0 0 rgba(13,13,13,0)",
                duration: 0.4,
                ease: "power2.inOut",
              }, start + 0.42);
              if (badge) journey.to(badge, { backgroundColor: "#0D0D0D", color: "#DDAA2F", duration: 0.25 }, start + 0.42);
            });

            journey.to(stages, { scale: 1, opacity: 1, y: 0, borderColor: "rgba(13,13,13,0.1)", boxShadow: "0 0 0 rgba(13,13,13,0)", duration: 0.45, stagger: 0.07, ease: "power3.out" }, 3.55);
            journey.to(badges, { backgroundColor: "#0D0D0D", color: "#DDAA2F", duration: 0.25, stagger: 0.04 }, 3.55);
            return;
          }

          const reveal = gsap.timeline({
            scrollTrigger: { trigger: stagesList, start: "top 84%", once: true },
          });
          reveal.from(stages, {
            opacity: 0,
            y: conditions.tablet ? 26 : 16,
            duration: conditions.tablet ? 0.52 : 0.44,
            stagger: 0.08,
            ease: "power3.out",
            clearProps: "transform,opacity,visibility",
          });
          if (pathRef.current && window.matchMedia("(min-width: 768px)").matches) {
            reveal.fromTo(pathRef.current, { strokeDashoffset: 60 }, { strokeDashoffset: 0, duration: 0.75, ease: "power2.out" }, "<+=0.08");
          }
        },
      );

      return () => media.revert();
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section container">
      <SectionHeading
        title="How it works"
        description="Every course follows the same path, so you finish with skills you can use and work you can show."
      />
      <div className="relative mt-fluid-sm">
        <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[1.625rem] z-0 hidden h-10 w-full md:block" viewBox="0 0 1000 40" preserveAspectRatio="none">
          <path ref={pathRef} d="M312 20H342 M658 20H688" fill="none" stroke="#B98A24" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" strokeDasharray="60" strokeDashoffset="0" />
        </svg>
        <ol ref={stagesRef} className="relative grid gap-4 md:grid-cols-3 md:gap-6">
        {STEPS.map(({ step, body }, i) => (
          <li key={step} data-learning-stage className="group relative z-10 flex flex-col gap-4 overflow-hidden rounded-2xl border bg-card p-6 transition duration-300 motion-safe:hover:-translate-y-1 hover:border-gold-500/50 hover:shadow-[0_20px_42px_-32px_rgba(13,13,13,0.4)] sm:p-7">
            <div className="flex items-center gap-3">
              <span data-stage-badge className="grid size-9 place-items-center rounded-lg bg-ink font-display text-sm font-bold text-gold-300 transition-transform duration-300 motion-safe:group-hover:scale-105">
                {i + 1}
              </span>
              <span className="font-display text-fluid-2xl font-bold">{step}</span>
            </div>
            <p className="text-fluid-base leading-relaxed text-muted-foreground">{body}</p>
          </li>
        ))}
        </ol>
      </div>
    </section>
  );
}
