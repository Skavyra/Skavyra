import { BookOpen, Hammer, TrendingUp } from "lucide-react";
import type { CSSProperties } from "react";

import { STEPS } from "@/lib/content";

const ICONS = [BookOpen, Hammer, TrendingUp];

export function HowItWorks() {
  return (
    <section className="sec how" id="how">
      <div className="wrap">
        <div className="shead shead--center reveal">
          <p className="over"><span className="over__bar" />The Skavyra method</p>
          <h2 className="h2">How it <span className="hl">works</span></h2>
          <p className="lead">Every course follows the same path, so you finish with skills you can use and work you can show.</p>
        </div>
        <ol className="steps">
          {STEPS.map((step, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <li
                key={step.step}
                className={`step ${index === 1 ? "step--ink" : "step--yel"} reveal`}
                style={{ "--d": `${index * 120}ms` } as CSSProperties}
                data-learning-stage
              >
                <span className="step__tab">{String(index + 1).padStart(2, "0")}</span>
                <div className="step__card">
                  <span className="step__ic"><Icon className="ic" strokeWidth={1.75} /></span>
                  <h3>{step.step}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
