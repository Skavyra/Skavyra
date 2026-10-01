import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQS } from "@/lib/content";

import { SectionHeading } from "./SectionHeading";

/** Two columns on desktop, first question open, per the wireframe. */
export function FaqAccordion({ items = FAQS }: { items?: { q: string; a: string }[] }) {
  const half = Math.ceil(items.length / 2);
  const columns = [items.slice(0, half), items.slice(half)];
  return (
    <section className="section bg-ivory/60">
      <div className="container">
        <SectionHeading title="Questions students ask" />
        <div className="mt-fluid-sm grid items-start gap-3 lg:grid-cols-2">
          {columns.map((col, c) => (
            <Accordion key={c} type="single" collapsible defaultValue={c === 0 ? "q-0" : undefined} className="flex flex-col gap-3">
              {col.map((f, i) => (
                <AccordionItem key={f.q} value={`q-${i}`} className="overflow-hidden border-ink/10 bg-card shadow-[0_10px_28px_-26px_rgba(13,13,13,0.45)] transition-[transform,border-color,box-shadow] duration-200 motion-safe:hover:-translate-y-px data-[state=open]:border-gold-500/50">
                  <AccordionTrigger>{f.q}</AccordionTrigger>
                  <AccordionContent className="faq-answer-motion">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ))}
        </div>
      </div>
    </section>
  );
}
