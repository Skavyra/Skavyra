import { Award, Briefcase, FolderKanban, Video } from "lucide-react";

import { FLAGSHIP_STYLES } from "@/lib/flagship-styles";

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
    <section className="bg-ivory pb-fluid-lg text-ink">
      <div className="container">
        <p className="text-xs uppercase tracking-widest text-gold-700">WHAT YOU GET</p>
        <h2 className={`${FLAGSHIP_STYLES.sectionTitle} mt-2`}>Every flagship program includes</h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {inclusions.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-2xl border border-ink/10 bg-white p-6 transition duration-300 motion-safe:hover:-translate-y-1 hover:border-gold-300 hover:shadow-[0_20px_42px_-30px_rgba(142,103,24,0.45)]"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-ink text-gold-300">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
              <p className="mt-1 text-sm text-ink/65">{description}</p>
            </article>
          ))}
        </div>

        <div className="mt-14">
          <h2 className={FLAGSHIP_STYLES.sectionTitle}>How to join</h2>
          <ol className="relative mt-8 grid gap-6 before:absolute before:bottom-4 before:left-[18px] before:top-4 before:w-px before:bg-gold-300/50 lg:grid-cols-4 lg:before:bottom-auto lg:before:left-[12.5%] lg:before:right-[12.5%] lg:before:top-[18px] lg:before:h-px lg:before:w-auto">
            {joiningSteps.map((step, index) => (
              <li key={step.title} className="relative flex gap-4 lg:block">
                <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-300 font-bold text-ink">
                  {index + 1}
                </span>
                <div className="pt-1 lg:mt-3 lg:pt-0">
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-ink/65">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
