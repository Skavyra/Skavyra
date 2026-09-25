import { REASONS } from "@/lib/content";

import { Quarter } from "./Quarter";
import { SectionHeading } from "./SectionHeading";

const SHADES = ["#F2C75C", "#DDAA2F", "#B98A24", "#8E6718"];

export function WhySkavyra() {
  return (
    <section className="section bg-ivory/60">
      <div className="container">
        <SectionHeading title="Why Skavyra" />
        <ul className="mt-fluid-sm grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((r, i) => (
            <li key={r.title} className="flex flex-col gap-3 rounded-2xl border bg-card p-6">
              <Quarter className="size-9" fill={SHADES[i]} />
              <h3 className="text-lg">{r.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{r.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
