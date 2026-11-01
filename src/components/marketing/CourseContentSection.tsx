import { Check } from "lucide-react";
import type { ReactNode } from "react";

export function courseContentLines(value?: string | null) {
  return (value ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

export function CourseContentSection({ id, eyebrow, title, children }: {
  id: string; eyebrow: string; title: string; children: ReactNode; tone?: "light" | "dark";
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="csec reveal"
    >
      <p className="csec__eb">{eyebrow}</p>
      <h2 id={`${id}-heading`}>{title}</h2>
      {children}
    </section>
  );
}

export function CourseContentList({ items, columns = false }: { items: string[]; columns?: boolean }) {
  return (
    <ul className={columns ? "checks" : "checks checks--one"}>
      {items.map((item, index) => (
        <li key={`${index}-${item}`}>
          <Check className="ic" strokeWidth={1.75} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
