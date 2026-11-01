import Image from "next/image";
import { Plus } from "lucide-react";

import { FAQS } from "@/lib/content";

type FaqItem = { q: string; a: string };

/** Native details keep every question closed until a visitor opens it. */
export function FaqAccordion({
  items = FAQS,
  variant = "full",
}: {
  items?: FaqItem[];
  variant?: "full" | "inline";
}) {
  const list = (
    <div className="faqs__list reveal">
      {items.map((item) => (
        <details className="faq" key={item.q}>
          <summary>{item.q}<span className="faq__pm"><Plus className="ic" strokeWidth={1.75} /></span></summary>
          <div className="faq__a"><p>{item.a}</p></div>
        </details>
      ))}
    </div>
  );

  if (variant === "inline") return list;

  return (
    <section className="sec sec--grey faqs" id="faq">
      <div className="wrap faqs__grid">
        <div className="faqs__intro reveal">
          <p className="over"><span className="over__bar" />Good to know</p>
          <h2 className="h2">Questions students <span className="hl">ask</span></h2>
          <div className="faqs__art">
            <span className="blk blk--y faqs__blk" aria-hidden="true" />
            <figure className="faqs__photo">
              <Image
                src="/images/site/photo-mentor.jpg"
                alt="A mentor reviewing work with a student"
                fill
                sizes="(max-width:900px) 90vw, 430px"
                style={{ objectFit: "cover" }}
              />
            </figure>
          </div>
        </div>
        {list}
      </div>
    </section>
  );
}
