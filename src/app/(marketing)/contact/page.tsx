import { Mail, Phone } from "lucide-react";
import type { Metadata } from "next";

import { ContactForm } from "@/components/marketing/ContactForm";
import { SUPPORT_EMAIL } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to a Skavyra counsellor about the right course for you.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string; topic?: string }>;
}) {
  const { course, topic } = await searchParams;
  const isCollege = topic === "college";

  // support numbers come from app_settings; readable by staff only, so fall back quietly
  const supabase = await createClient();
  const { data: setting } = await supabase.from("app_settings").select("value").eq("key", "company").maybeSingle();
  const company = (setting?.value ?? {}) as { support_email?: string; support_phone?: string };

  return (
    <div className="container section grid gap-12 lg:grid-cols-[1fr_1.1fr]">
      <div className="max-w-xl">
        <h1 className="text-fluid-3xl">{isCollege ? "Bring Skavyra to your college" : "Talk to a counsellor"}</h1>
        <p className="mt-4 text-fluid-base text-muted-foreground">
          {isCollege
            ? "Tell us about your students and placement goals. We will get back to you with a plan for your campus."
            : "Leave your details and a counsellor will call you back, usually within one working day."}
        </p>
        <ul className="mt-8 flex flex-col gap-3 text-sm">
          <li className="flex items-center gap-3">
            <Mail className="size-4 text-gold-700" />
            <a href={`mailto:${company.support_email ?? SUPPORT_EMAIL}`} className="hover:underline">
              {company.support_email ?? SUPPORT_EMAIL}
            </a>
          </li>
          {company.support_phone && (
            <li className="flex items-center gap-3">
              <Phone className="size-4 text-gold-700" />
              <a href={`tel:${company.support_phone.replace(/\s/g, "")}`} className="hover:underline">
                {company.support_phone}
              </a>
            </li>
          )}
        </ul>
      </div>

      <div className="rounded-3xl border bg-card p-6 sm:p-8">
        <ContactForm defaultCourse={course} topic={isCollege ? "college" : undefined} />
      </div>
    </div>
  );
}
