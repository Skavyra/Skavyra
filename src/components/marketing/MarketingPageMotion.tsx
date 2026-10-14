"use client";

import { type ReactNode, useEffect, useRef } from "react";

const MANAGED_MOTION = [
  "[data-hero-headline]",
  "[data-category-card]",
  "[data-reason-card]",
  "[data-learning-stage]",
  "[data-course-title]",
  "[data-courses-heading]",
  "[data-course-enrollment]",
  "#callback",
].join(",");

/** Adds a one-time entrance to otherwise static marketing page sections. */
export function MarketingPageMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = new WeakSet<Element>();
    const animations = new Set<Animation>();
    const observer = typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            observer?.unobserve(entry.target);
            if (typeof entry.target.animate !== "function") return;

            const animation = entry.target.animate(
              [
                { opacity: 0, transform: "translate3d(0, 22px, 0)" },
                { opacity: 1, transform: "translate3d(0, 0, 0)" },
              ],
              { duration: 560, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
            );
            animations.add(animation);
            animation.onfinish = () => animations.delete(animation);
          });
        }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });

    const observeSections = () => {
      if (!observer) return;
      Array.from(root.children).forEach((child) => {
        if (targets.has(child) || child.matches(MANAGED_MOTION) || child.querySelector(MANAGED_MOTION)) return;
        targets.add(child);
        observer.observe(child);
      });
    };

    observeSections();
    const mutations = new MutationObserver(observeSections);
    mutations.observe(root, { childList: true });

    return () => {
      mutations.disconnect();
      observer?.disconnect();
      animations.forEach((animation) => animation.cancel());
    };
  }, []);

  return <div ref={rootRef} className="contents">{children}</div>;
}
