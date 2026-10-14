import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TESTIMONIALS } from "@/lib/content";
import { initials } from "@/lib/utils";

import { SectionHeading } from "./SectionHeading";

/** Only real, consented quotes. Renders nothing until TESTIMONIALS has entries. */
export function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;
  return (
    <section className="section bg-ivory/60">
      <div className="container">
        <SectionHeading title="Student stories" />
        <ul className="mt-fluid-sm grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <li key={t.name} className="group flex flex-col gap-5 rounded-2xl border bg-card p-6 transition-[transform,border-color,box-shadow] duration-300 motion-safe:hover:-translate-y-1 hover:border-gold-300/70 hover:shadow-[0_20px_42px_-30px_rgba(142,103,24,0.45)]">
              <blockquote className="text-fluid-base leading-relaxed">“{t.quote}”</blockquote>
              <div className="mt-auto flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{initials(t.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.college}, {t.course}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
