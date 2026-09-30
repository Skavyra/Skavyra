import { REASONS } from "@/lib/content";

import { Quarter } from "./Quarter";
import { SectionHeading } from "./SectionHeading";

const SHADES = ["#F2C75C", "#DDAA2F", "#B98A24", "#8E6718"];

export function WhySkavyra() {
  return (
    <section className="section relative overflow-hidden bg-ivory/60">
      <div className="container">
        <SectionHeading title="Why Skavyra" description="Practical learning, shaped around the work you want to do next." />
        <ul className="mt-fluid-sm grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((r, i) => (
            <li key={r.title} className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-ink/10 bg-card p-6 transition duration-300 hover:-translate-y-1 hover:border-gold-500/50 hover:shadow-[0_20px_42px_-32px_rgba(13,13,13,0.38)]">
              <span aria-hidden="true" className="absolute right-0 top-0 h-24 w-24 translate-x-1/3 -translate-y-1/3 rounded-full bg-gold-300/10 blur-2xl transition group-hover:bg-gold-300/25" />
              <Quarter className="relative size-9 transition-transform duration-500 group-hover:rotate-6" fill={SHADES[i]} />
              <h3 className="relative text-lg">{r.title}</h3>
              <p className="relative text-sm leading-relaxed text-muted-foreground">{r.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
