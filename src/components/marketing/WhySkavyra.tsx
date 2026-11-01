import Image from "next/image";
import { Briefcase, FolderKanban, Split, UserCheck } from "lucide-react";
import type { CSSProperties } from "react";

import { REASONS } from "@/lib/content";

const ICONS = [UserCheck, FolderKanban, Split, Briefcase];

export function WhySkavyra() {
  return (
    <section className="sec sec--ink why" id="why">
      <div className="wrap why__grid">
        <div className="why__copy">
          <div className="reveal">
            <p className="over over--dark"><span className="over__bar" />Our approach</p>
            <h2 className="h2">Why <span className="hl">Skavyra</span></h2>
            <p className="lead">Practical learning, shaped around the work you want to do next.</p>
          </div>
          <ul className="why__list">
            {REASONS.map((reason, index) => {
              const Icon = ICONS[index % ICONS.length];
              return (
                <li
                  key={reason.title}
                  className="reason reveal"
                  style={{ "--d": `${index * 80}ms` } as CSSProperties}
                  data-reason-card
                >
                  <span className="reason__n">{String(index + 1).padStart(2, "0")}.</span>
                  <div><h3>{reason.title}</h3><p>{reason.body}</p></div>
                  <span className="reason__ic"><Icon className="ic" strokeWidth={1.75} /></span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="why__art reveal">
          <span className="blk blk--y why__blk" aria-hidden="true" />
          <figure className="why__photo">
            <Image
              src="/images/site/photo-classroom.jpg"
              alt="Students working together on a laptop"
              fill
              sizes="(max-width:900px) 90vw, 420px"
              style={{ objectFit: "cover" }}
            />
          </figure>
          <figure className="why__photo2">
            <Image src="/images/site/photo-laptop-study.jpg" alt="" fill sizes="240px" style={{ objectFit: "cover" }} />
          </figure>
          <span className="frame why__frame" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
