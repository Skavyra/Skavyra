import { Mail, Phone } from "lucide-react";
import type { Metadata } from "next";

import { ContactForm } from "@/components/marketing/ContactForm";
import { WhatsAppIcon } from "@/components/marketing/WhatsAppIcon";
import { SUPPORT_EMAIL } from "@/lib/content";
import { WHATSAPP_DEFAULT_MESSAGE, whatsappLink } from "@/lib/whatsapp";
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
  const whatsappMessage = isCollege
    ? "Hi Skavyra, I'd like to bring Skavyra to my college."
    : course
      ? `Hi Skavyra, I'd like details about ${course}`
      : WHATSAPP_DEFAULT_MESSAGE;
  const whatsappHref = whatsappLink(whatsappMessage);

  // support numbers come from app_settings; readable by staff only, so fall back quietly
  const supabase = await createClient();
  const { data: setting } = await supabase.from("app_settings").select("value").eq("key", "company").maybeSingle();
  const company = (setting?.value ?? {}) as { support_email?: string; support_phone?: string };

  return (
    <div className="container section grid gap-12 pb-24 md:pb-0 lg:grid-cols-[1fr_1.1fr]">
      <div className="max-w-xl">
        <h1 className="text-fluid-3xl">{isCollege ? "Bring Skavyra to your college" : "Talk to a counsellor"}</h1>
        <p className="mt-4 text-fluid-base text-muted-foreground">
          {isCollege
            ? "Tell us about your students and placement goals. We will get back to you with a plan for your campus."
            : "Leave your details and a counsellor will call you back, usually within one working day."}
        </p>
        {whatsappHref && (
          <div className="mt-6 rounded-2xl border border-[#25D366]/40 bg-[#25D366]/5 p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#25D366] text-white">
                <WhatsAppIcon className="size-5" />
              </span>
              <h2 className="text-lg font-semibold">Chat on WhatsApp</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Fastest way to reach a counsellor. Usually replies within a few hours.
            </p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Start a WhatsApp chat with Skavyra"
              className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#25D366]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2"
            >
              Start chat
            </a>
          </div>
        )}
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

      <div className="rounded-3xl border bg-card p-6 shadow-[0_18px_55px_-44px_rgba(13,13,13,0.42)] transition-[border-color,box-shadow] duration-300 hover:border-gold-300/60 hover:shadow-[0_24px_65px_-44px_rgba(142,103,24,0.32)] sm:p-8">
        <ContactForm defaultCourse={course} topic={isCollege ? "college" : undefined} />
      </div>
    </div>
  );
}
