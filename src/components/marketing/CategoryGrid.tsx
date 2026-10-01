"use client";

import { BarChart3, Calculator, Code2, Megaphone, PenTool, Users } from "lucide-react";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { CATEGORIES } from "@/lib/content";

import { SectionHeading } from "./SectionHeading";

const ICONS = { code: Code2, chart: BarChart3, pen: PenTool, megaphone: Megaphone, calculator: Calculator, users: Users };

export function CategoryGrid() {
  const gridRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-category-card]", grid);
      const media = gsap.matchMedia();

      media.add(
        {
          desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
          tablet: "(min-width: 640px) and (max-width: 1023px) and (prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 639px) and (prefers-reduced-motion: no-preference)",
        },
        ({ conditions }) => {
          if (!conditions) return;
          const distance = conditions.desktop ? 66 : conditions.tablet ? 50 : 34;
          const scale = conditions.desktop ? 0.9 : conditions.tablet ? 0.93 : 0.96;
          const rotation = conditions.desktop ? 3 : conditions.tablet ? 2 : 1;

          gsap.from(cards, {
            opacity: 0,
            y: distance,
            scale,
            rotation: (index) => (index % 3 === 1 ? 0 : index % 2 === 0 ? -rotation : rotation),
            transformOrigin: "50% 50%",
            duration: 0.62,
            stagger: 0.055,
            ease: "power3.out",
            clearProps: "transform,opacity",
            scrollTrigger: {
              trigger: grid,
              start: "top 84%",
              once: true,
            },
          });
        },
      );

      media.add("(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const items = gsap.utils.toArray<HTMLElement>("[data-category-card]", grid);
        const cleanups: (() => void)[] = [];

        items.forEach((item) => {
          const card = item.querySelector<HTMLElement>("a");
          if (!card) return;

          const tiltX = gsap.quickTo(item, "rotationX", { duration: 0.35, ease: "power2.out" });
          const tiltY = gsap.quickTo(item, "rotationY", { duration: 0.35, ease: "power2.out" });
          const onMove = (event: PointerEvent) => {
            const bounds = card.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;
            tiltX(y * -4);
            tiltY(x * 4);
          };
          const onLeave = () => {
            tiltX(0);
            tiltY(0);
          };

          card.addEventListener("pointermove", onMove, { passive: true });
          card.addEventListener("pointerleave", onLeave, { passive: true });
          cleanups.push(() => {
            card.removeEventListener("pointermove", onMove);
            card.removeEventListener("pointerleave", onLeave);
          });
        });

        return () => cleanups.forEach((cleanup) => cleanup());
      });

      return () => media.revert();
    }, grid);

    return () => context.revert();
  }, []);

  return (
    <section className="section container">
      <SectionHeading title="Browse by category" description="Pick the area you want to work in. Each one opens the courses that fit it." />
      <ul ref={gridRef} className="mt-fluid-sm grid grid-cols-2 gap-3 [perspective:900px] sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map(({ label, category, icon }) => {
          const Icon = ICONS[icon];
          return (
            <li key={label} data-category-card className="[transform-style:preserve-3d]">
              <Link
                href={`/courses?category=${category}`}
                className="group relative isolate flex h-full flex-col items-center gap-3 overflow-hidden rounded-2xl border bg-card p-5 text-center transition-[transform,border-color,box-shadow] duration-300 motion-safe:hover:-translate-y-1 hover:border-gold-300 hover:shadow-[0_18px_38px_-26px_rgba(142,103,24,0.5)] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_50%_0%,rgba(242,199,92,0.16),transparent_68%)] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-muted transition-colors group-hover:bg-gold-100/50">
                  <Icon className="size-5 text-gold-700" />
                </span>
                <span className="text-sm font-semibold leading-snug">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
