"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function StudentDashboardMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current) return;

    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const sections = root.current?.querySelectorAll<HTMLElement>("[data-dashboard-reveal]");
        if (!sections?.length) return;
        gsap.from(sections, {
          opacity: 0,
          y: 12,
          duration: 0.42,
          stagger: 0.07,
          ease: "power2.out",
          clearProps: "all",
        });
      });
      return () => media.revert();
    }, root);

    return () => context.revert();
  }, []);

  return <div ref={root} className="min-w-0">{children}</div>;
}
