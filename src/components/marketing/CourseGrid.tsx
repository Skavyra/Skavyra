"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { CourseCard, type CourseCardData } from "./CourseCard";
import { SectionHeading } from "./SectionHeading";

const TABS = [
  { key: "all", label: "All" },
  { key: "it", label: "IT" },
  { key: "non_it", label: "Non-IT" },
] as const;

/** Home page "Popular courses": six published courses with All / IT / Non-IT tabs. */
export function CourseGrid({ courses }: { courses: CourseCardData[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const sectionRef = useRef<HTMLElement>(null);
  const visibleRef = useRef<HTMLUListElement>(null);
  const visible = courses
    .filter((c) => tab === "all" || c.category === tab || c.category === "both")
    .slice(0, 6);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      const heading = section.querySelector<HTMLElement>("h2");
      const tabs = section.querySelector<HTMLElement>('[role="tablist"]');
      const cards = visibleRef.current
        ? gsap.utils.toArray<HTMLElement>("[data-course-card]", visibleRef.current)
        : [];

      media.add(
        {
          desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
          tablet: "(min-width: 640px) and (max-width: 1023px) and (prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 639px) and (prefers-reduced-motion: no-preference)",
        },
        ({ conditions }) => {
          if (!conditions) return;
          const distance = conditions.desktop ? 30 : conditions.tablet ? 24 : 16;
          const reveal = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top 82%",
              once: true,
            },
          });

          if (heading) reveal.from(heading, { autoAlpha: 0, y: 18, duration: 0.38, ease: "power3.out" });
          if (tabs) reveal.from(tabs, { autoAlpha: 0, y: 12, duration: 0.32, ease: "power3.out" }, ">-=0.12");
          if (cards.length) {
            reveal.from(
              cards,
              {
                autoAlpha: 0,
                y: distance,
                scale: conditions.desktop ? 0.97 : 0.985,
                duration: 0.5,
                stagger: 0.06,
                ease: "power3.out",
                clearProps: "transform,opacity,visibility",
              },
              ">-=0.08",
            );
          }
        },
      );

      media.add("(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        let activeItem: HTMLElement | null = null;
        let bounds: DOMRect | null = null;
        let tiltX: ((value: number) => void) | null = null;
        let tiltY: ((value: number) => void) | null = null;

        const reset = () => {
          tiltX?.(0);
          tiltY?.(0);
          activeItem = null;
          bounds = null;
          tiltX = null;
          tiltY = null;
        };
        const onMove = (event: PointerEvent) => {
          const target = event.target;
          const anchor = target instanceof Element ? target.closest("a") : null;
          const item = anchor?.closest<HTMLElement>("[data-course-card]") ?? null;
          if (!item || !anchor) {
            if (activeItem) reset();
            return;
          }

          if (activeItem !== item) {
            reset();
            activeItem = item;
            bounds = anchor.getBoundingClientRect();
            tiltX = gsap.quickTo(item, "rotationX", { duration: 0.32, ease: "power2.out" });
            tiltY = gsap.quickTo(item, "rotationY", { duration: 0.32, ease: "power2.out" });
          }

          if (!bounds) return;
          const x = (event.clientX - bounds.left) / bounds.width - 0.5;
          const y = (event.clientY - bounds.top) / bounds.height - 0.5;
          tiltX?.(y * -6);
          tiltY?.(x * 6);
        };
        section.addEventListener("pointermove", onMove, { passive: true });
        section.addEventListener("pointerleave", reset, { passive: true });
        return () => {
          reset();
          section.removeEventListener("pointermove", onMove);
          section.removeEventListener("pointerleave", reset);
        };
      });

      return () => media.revert();
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section container">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading title="Popular courses" />
        <div role="tablist" aria-label="Filter courses" className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                tab === t.key ? "border-ink bg-ink text-ivory" : "border-border bg-card hover:border-gold-300",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length > 0 ? (
        <ul ref={visibleRef} className="mt-fluid-sm grid gap-5 [perspective:1000px] sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((c) => (
            <li key={c.id} data-course-card className="[transform-style:preserve-3d]">
              <CourseCard course={c} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-fluid-sm rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
          New courses in this stream are on the way. Leave your number below and a counsellor will tell you when they open.
        </p>
      )}

      <div className="mt-10 flex justify-center">
        <Button asChild variant="outline" size="lg">
          <Link href="/courses">View all courses</Link>
        </Button>
      </div>
    </section>
  );
}
