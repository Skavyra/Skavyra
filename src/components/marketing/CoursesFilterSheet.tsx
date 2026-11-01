"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";

type CoursesFilterSheetProps = {
  activeCount: number;
  resultCount: number;
  children: ReactNode;
};

export function CoursesFilterSheet({ activeCount, resultCount, children }: CoursesFilterSheetProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    document.body.classList.add("sheet-open");
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.classList.remove("sheet-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <div className="ctop">
        <button
          type="button"
          className="fopen"
          aria-controls="fsheet"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <SlidersHorizontal className="ic" strokeWidth={1.75} />Filters
          <b className={activeCount ? "on" : ""}>{activeCount}</b>
        </button>
      </div>
      <aside id="fsheet" className={`filters reveal${open ? " is-open" : ""}`} aria-label="Filters" data-courses-filters>
        <div className="fsheet__head">
          <h2>Filters</h2>
          <button type="button" className="fsheet__x" aria-label="Close filters" onClick={close}>
            <X className="ic" strokeWidth={1.75} />
          </button>
        </div>
        {children}
        <div className="fsheet__foot">
          <Link className="fsheet__clear" href="/courses">Clear</Link>
          <button type="button" className="fsheet__go" onClick={close}>
            {`Show ${resultCount} course${resultCount === 1 ? "" : "s"}`}
          </button>
        </div>
      </aside>
      <div className={`fscrim${open ? " is-on" : ""}`} onClick={close} aria-hidden="true" />
    </>
  );
}
