import { STEPS } from "@/lib/content";

import { SectionHeading } from "./SectionHeading";

/** Learn, Build, Grow is a real sequence, so the steps are numbered. */
export function HowItWorks() {
  return (
    <section className="section container">
      <SectionHeading
        title="How it works"
        description="Every course follows the same path, so you finish with skills you can use and work you can show."
      />
      <ol className="relative mt-fluid-sm grid gap-4 md:grid-cols-3 md:gap-6">
        {STEPS.map(({ step, body }, i) => (
          <li key={step} className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border bg-card p-6 transition duration-300 hover:-translate-y-1 hover:border-gold-500/50 hover:shadow-[0_20px_42px_-32px_rgba(13,13,13,0.4)] sm:p-7">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-lg bg-ink font-display text-sm font-bold text-gold-300 transition-transform duration-300 group-hover:scale-105">
                {i + 1}
              </span>
              <span className="font-display text-fluid-2xl font-bold">{step}</span>
            </div>
            <p className="text-fluid-base leading-relaxed text-muted-foreground">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
