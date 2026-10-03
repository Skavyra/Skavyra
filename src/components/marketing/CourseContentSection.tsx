import { Check } from "lucide-react";
import type { ReactNode } from "react";

export function courseContentLines(value?: string | null) {
  return (value ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

export function CourseContentSection({ id, eyebrow, title, children }: {
  id: string; eyebrow: string; title: string; children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-28 rounded-3xl border border-ink/10 bg-card p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-700">{eyebrow}</p>
      <h2 id={`${id}-heading`} className="mt-2 text-2xl sm:text-3xl">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function CourseContentList({ items, columns = false }: { items: string[]; columns?: boolean }) {
  return (
    <ul className={`grid gap-4 ${columns ? "sm:grid-cols-2" : ""}`}>
      {items.map((item, index) => (
        <li key={`${index}-${item}`} className="flex items-start gap-3 rounded-xl bg-background p-4">
          <span className="mt-0.5 rounded-full bg-gold-300/25 p-1 text-gold-700"><Check className="size-3.5" aria-hidden="true" /></span>
          <span className="min-w-0 break-words text-sm leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}
