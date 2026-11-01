"use client";

import { useEffect, useRef, useState } from "react";

type CourseSectionLink = { id: string; label: string };

export function CourseTabsNav({ sections }: { sections: CourseSectionLink[] }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((section): section is HTMLElement => section instanceof HTMLElement);
    if (!targets.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (!visible) return;
      const id = (visible.target as HTMLElement).id;
      setActiveId(id);
      document.querySelector<HTMLAnchorElement>(`.tabsnav a[href="#${CSS.escape(id)}"]`)?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className="tabsnav" aria-label="Course sections">
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={activeId === section.id ? "is-on" : undefined}
          onClick={() => setActiveId(section.id)}
        >
          {section.label}
        </a>
      ))}
    </nav>
  );
}

export function CourseBand() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measure = () => {
      const band = ref.current;
      const root = band?.closest<HTMLElement>(".cd");
      const buttons = root?.querySelector<HTMLElement>(".cd__main .btns");
      if (!band || !root || !buttons) return;

      const rootTop = root.getBoundingClientRect().top + window.scrollY;
      const buttonsTop = buttons.getBoundingClientRect().top + window.scrollY;
      band.style.height = `${Math.max(0, buttonsTop - rootTop - 16)}px`;
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    void document.fonts?.ready.then(measure);

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
    };
  }, []);

  return <div className="cd__band" aria-hidden="true" ref={ref} />;
}
