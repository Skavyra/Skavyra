"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

export function CoursesPageMotion({ animationKey, children }: { animationKey: string; children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hasEntered = useRef(false);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add(
        {
          desktop: "(min-width: 1024px)",
          tablet: "(min-width: 640px) and (max-width: 1023px)",
          mobile: "(max-width: 639px)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        ({ conditions }) => {
          if (!conditions?.motion) return;

          const heading = root.querySelector<HTMLElement>("[data-courses-heading]");
          const description = root.querySelector<HTMLElement>("[data-courses-description]");
          const filters = root.querySelector<HTMLElement>("[data-courses-filters]");
          const results = root.querySelector<HTMLElement>("[data-courses-results]");
          const pagination = root.querySelector<HTMLElement>("[data-courses-pagination]");
          const cards = results?.querySelectorAll<HTMLElement>("[data-listing-card]");

          if (!hasEntered.current) {
            const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
            if (heading) timeline.from(heading, { opacity: 0, y: conditions.mobile ? 10 : 14, duration: 0.34 }, 0);
            if (description) timeline.from(description, { opacity: 0, y: conditions.mobile ? 8 : 10, duration: 0.32 }, 0.08);
            if (filters) timeline.from(filters, { opacity: 0, y: conditions.mobile ? 8 : 12, duration: 0.34 }, 0.17);
            if (cards?.length) {
              timeline.from(cards, {
                opacity: 0,
                y: conditions.mobile ? 12 : conditions.tablet ? 16 : 20,
                scale: 0.99,
                duration: 0.4,
                stagger: 0.035,
                clearProps: "transform,opacity",
              }, 0.28);
            } else if (results) {
              timeline.from(results, { opacity: 0, y: 10, duration: 0.32, clearProps: "transform,opacity" }, 0.28);
            }
            if (pagination) timeline.from(pagination, { opacity: 0, y: 8, duration: 0.28, clearProps: "transform,opacity" }, 0.58);
            hasEntered.current = true;
          } else if (results) {
            const targets = cards?.length ? cards : [results];
            const timeline = gsap.timeline();
            timeline.from(targets, {
              opacity: 0,
              y: conditions.mobile ? 8 : 12,
              duration: 0.28,
              stagger: 0.025,
              ease: "power2.out",
              clearProps: "transform,opacity",
            });
            if (pagination) timeline.from(pagination, { opacity: 0, y: 6, duration: 0.2, clearProps: "transform,opacity" }, ">-=0.12");
          }
        },
      );

      media.add("(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const grid = root.querySelector<HTMLElement>("[data-courses-grid]");
        if (!grid) return;

        let activeCard: HTMLElement | null = null;
        let bounds: DOMRect | null = null;
        let tiltX: ((value: number) => void) | null = null;
        let tiltY: ((value: number) => void) | null = null;

        const reset = () => {
          tiltX?.(0);
          tiltY?.(0);
          activeCard = null;
          bounds = null;
          tiltX = null;
          tiltY = null;
        };
        const onMove = (event: PointerEvent) => {
          const target = event.target;
          const anchor = target instanceof Element ? target.closest("a") : null;
          const card = anchor?.closest<HTMLElement>("[data-listing-card]") ?? null;
          if (!card || !anchor) {
            if (activeCard) reset();
            return;
          }

          if (activeCard !== card) {
            reset();
            activeCard = card;
            bounds = anchor.getBoundingClientRect();
            tiltX = gsap.quickTo(card, "rotationX", { duration: 0.3, ease: "power2.out" });
            tiltY = gsap.quickTo(card, "rotationY", { duration: 0.3, ease: "power2.out" });
          }

          if (!bounds) return;
          const x = (event.clientX - bounds.left) / bounds.width - 0.5;
          const y = (event.clientY - bounds.top) / bounds.height - 0.5;
          tiltX?.(Math.max(-4, Math.min(4, y * -8)));
          tiltY?.(Math.max(-4, Math.min(4, x * 8)));
        };

        grid.addEventListener("pointermove", onMove, { passive: true });
        grid.addEventListener("pointerleave", reset, { passive: true });
        return () => {
          reset();
          grid.removeEventListener("pointermove", onMove);
          grid.removeEventListener("pointerleave", reset);
        };
      });

      return () => media.revert();
    }, root);

    return () => context.revert();
  }, [animationKey]);

  return <div ref={rootRef}>{children}</div>;
}
