import { CategoryGrid } from "@/components/marketing/CategoryGrid";
import { ContactCta } from "@/components/marketing/ContactCta";
import { CourseGrid } from "@/components/marketing/CourseGrid";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Testimonials } from "@/components/marketing/Testimonials";
import { WhySkavyra } from "@/components/marketing/WhySkavyra";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 300;

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("id, slug, title, subtitle, category, level, cover_image_url, price, mrp, duration_weeks")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .limit(12);
  const courses = data ?? [];

  return (
    <>
      <Hero courses={courses} />
      <CategoryGrid />
      <CourseGrid courses={courses} />
      <WhySkavyra />
      <HowItWorks />
      <Testimonials />
      <FaqAccordion />
      <ContactCta />
    </>
  );
}
