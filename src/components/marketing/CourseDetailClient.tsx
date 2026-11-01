"use client";

import { useEffect, useRef } from "react";

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
