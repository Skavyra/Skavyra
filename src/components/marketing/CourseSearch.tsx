"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/** Course search as on the demo: one field with the icon inside, results update as you type.
 * It keeps the stream, level and duration filters in the address and sends the typed words as ?q=. */
export function CourseSearch({
  initial,
  category,
  level,
  duration,
}: {
  initial: string;
  category?: string;
  level?: string;
  duration?: string;
}) {
  const [value, setValue] = useState(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const last = useRef(initial);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const go = (q: string) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (level) params.set("level", level);
    if (duration) params.set("duration", duration);
    params.set("q", q);
    window.location.replace(`/courses?${params.toString()}`);
  };

  return (
    <form
      className="csearch"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        if (timer.current) clearTimeout(timer.current);
        go(value.trim());
      }}
    >
      <label style={{ display: "contents" }}>
      <span className="sr-only">Search courses</span>
      <Search className="ic" strokeWidth={1.75} aria-hidden="true" />
      <input
        type="search"
        id="cq"
        name="q"
        value={value}
        placeholder="Search a course, e.g. Java, Power BI, marketing"
        autoComplete="off"
        onChange={(event) => {
          const next = event.target.value;
          setValue(next);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => {
            if (next.trim() !== last.current.trim()) {
              last.current = next;
              go(next.trim());
            }
          }, 700);
        }}
      />
      </label>
    </form>
  );
}
