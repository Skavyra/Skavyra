import { Award, Briefcase, FolderKanban, Video } from "lucide-react";
import type { CSSProperties } from "react";

const inclusions = [
  { icon: Video, title: "Live mentor sessions", description: "Learn live from mentors who work in the field." },
  { icon: FolderKanban, title: "Real projects", description: "Build projects you can show in interviews." },
  { icon: Award, title: "Certificate", description: "Earn a Skavyra certificate when you complete the program." },
  { icon: Briefcase, title: "Career guidance", description: "Help with your resume and interview preparation." },
];

const joiningSteps = [
  { title: "Talk to us", description: "A free call to pick the right program." },
  { title: "Enroll", description: "Reserve your seat at the launch price." },
  { title: "Learn and build", description: "Live sessions plus hands-on projects." },
  { title: "Get certified", description: "Finish your project and earn your certificate." },
];

export function FlagshipIncludes() {
  return (
    <section className="sec sec--grey">
      <div className="wrap">
        <div className="shead shead--center reveal">
          <p className="over"><span className="over__bar" />What you get</p>
          <h2 className="h2">Every flagship program <span className="hl">includes</span></h2>
        </div>
        <div className="inc">
          {inclusions.map(({ icon: Icon, title, description }, index) => (
            <div key={title} className="incard reveal" style={{ "--d": `${index * 80}ms` } as CSSProperties}>
              <span className="incard__ic"><Icon className="ic" strokeWidth={1.75} /></span>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
        <div className="shead reveal" style={{ margin: "96px 0 0" }}>
          <h2 className="h2">How to <span className="hl">join</span></h2>
        </div>
        <ol className="join">
          {joiningSteps.map((step, index) => (
            <li key={step.title} className="jstep reveal" style={{ "--d": `${index * 90}ms` } as CSSProperties}>
              <b>{index + 1}</b>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
