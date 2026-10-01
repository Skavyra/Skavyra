"use client";

import { type ReactNode, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function CourseDetailMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add(
        {
          desktop: "(min-width: 1024px)",
          tablet: "(min-width: 640px) and (max-width: 1023px)",
          mobile: "(max-width: 639px)",
          reducedMotion: "(prefers-reduced-motion: reduce)",
        },
        ({ conditions }) => {
          if (!conditions || conditions.reducedMotion) return;

          const distance = conditions.desktop ? 14 : conditions.tablet ? 10 : 8;
          const breadcrumb = root.querySelector<HTMLElement>("[data-course-breadcrumb]");
          const badges = root.querySelector<HTMLElement>("[data-course-badges]");
          const title = root.querySelector<HTMLElement>("[data-course-title]");
          const subtitle = root.querySelector<HTMLElement>("[data-course-subtitle]");
          const metadata = root.querySelector<HTMLElement>("[data-course-metadata]");
          const enrollment = root.querySelector<HTMLElement>("[data-course-enrollment]");
          const content = root.querySelector<HTMLElement>("[data-course-content]");

          const entrance = gsap.timeline({ defaults: { ease: "power3.out" } });
          if (breadcrumb) entrance.from(breadcrumb, { opacity: 0, y: distance * 0.55, duration: 0.24 }, 0);
          if (badges) entrance.from(badges, { opacity: 0, y: distance * 0.65, duration: 0.3 }, 0.08);
          if (title) entrance.from(title, { opacity: 0, y: distance, duration: 0.38 }, 0.12);
          if (subtitle) entrance.from(subtitle, { opacity: 0, y: distance * 0.75, duration: 0.32 }, 0.2);
          if (metadata) entrance.from(metadata, { opacity: 0, y: distance * 0.65, duration: 0.3 }, 0.25);
          if (enrollment) entrance.from(enrollment, { opacity: 0, y: distance, scale: 0.99, duration: 0.4 }, 0.28);

          if (content) {
            gsap.from(content, {
              opacity: 0,
              y: conditions.mobile ? 14 : conditions.tablet ? 18 : 22,
              duration: 0.46,
              ease: "power2.out",
              clearProps: "transform,opacity",
              scrollTrigger: { trigger: content, start: "top 88%", once: true },
            });
          }
        },
      );

      return () => media.revert();
    }, root);

    return () => context.revert();
  }, []);

  return <div ref={rootRef}>{children}</div>;
}
