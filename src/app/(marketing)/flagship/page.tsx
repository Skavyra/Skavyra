import type { Metadata } from "next";
import { Check } from "lucide-react";

import { ContactCta } from "@/components/marketing/ContactCta";
import { FlagshipCard } from "@/components/marketing/FlagshipCard";
import { FLAGSHIP_COURSES } from "@/lib/flagship-mock"; // TODO: replace with Supabase query in backend phase
import { FLAGSHIP_STYLES } from "@/lib/flagship-styles";

export const metadata: Metadata = {
  title: "Flagship Programs",
  description: "Skavyra's premium programs in AI practice, AI product management and business growth.",
};

const TRUST_POINTS = ["Live mentor sessions", "Real projects", "Certificate on completion"];

export default function FlagshipPage() {
  const courses = [...FLAGSHIP_COURSES].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      <section className={`${FLAGSHIP_STYLES.darkSection} section`}>
        <div className="container">
          <p className="text-xs uppercase tracking-widest text-gold-100">Flagship Programs</p>
          <h1 className={`${FLAGSHIP_STYLES.heroTitle} mt-3`}>Our most in-depth programs</h1>
          <p className={`${FLAGSHIP_STYLES.heroSubtitle} mt-4 max-w-2xl`}>
            Mentor-led, project-based programs built for real jobs and real business outcomes.
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ivory/70">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="inline-flex items-center gap-2">
                <Check aria-hidden="true" className="size-4 text-gold-100" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${FLAGSHIP_STYLES.darkSection} pb-fluid-lg`} aria-label="Flagship programs">
        <div className="container grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <FlagshipCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      <ContactCta />
    </>
  );
}
