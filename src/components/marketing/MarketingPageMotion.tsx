"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";

/** Adds the demo's one-time reveal class to marketing page content. */
export function MarketingPageMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observed = new WeakSet<Element>();
    const selectors = ".reveal, .steps";

    const scan = () => {
      const elements = Array.from(root.querySelectorAll<HTMLElement>(selectors));

      const siblingsByGrid = new Map<Element, HTMLElement[]>();
      elements.forEach((element) => {
        const parent = element.parentElement;
        if (!parent || window.getComputedStyle(parent).display !== "grid") return;
        const siblings = siblingsByGrid.get(parent) ?? [];
        siblings.push(element);
        siblingsByGrid.set(parent, siblings);
      });
      siblingsByGrid.forEach((siblings) => {
        siblings.forEach((element, index) => {
          if (!element.style.getPropertyValue("--d")) {
            element.style.setProperty("--d", `${(index % 3) * 90}ms`);
          }
        });
      });

      if (reducedMotion || typeof IntersectionObserver === "undefined") {
        elements.forEach((element) => element.classList.add("in"));
        return;
      }

      elements.forEach((element) => {
        if (element.classList.contains("in") || observed.has(element)) return;
        observed.add(element);
        observer?.observe(element);
      });
    };

    const observer = typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("in");
            observer?.unobserve(entry.target);
          });
        }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });

    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(root, { childList: true, subtree: true });

    const safetyTimer = window.setTimeout(() => {
      root.querySelectorAll<HTMLElement>(".reveal").forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          element.classList.add("in");
          observer?.unobserve(element);
        }
      });
    }, 2500);

    return () => {
      window.clearTimeout(safetyTimer);
      mutations.disconnect();
      observer?.disconnect();
    };
  }, [pathname]);

  return <div ref={rootRef} className="contents">{children}</div>;
}
