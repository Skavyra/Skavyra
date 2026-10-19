import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";

import { ContactForm } from "@/components/marketing/ContactForm";
import { WhatsAppIcon } from "@/components/marketing/WhatsAppIcon";
import { CONTACT } from "@/lib/contact-info";
import { WHATSAPP_DEFAULT_MESSAGE, whatsappLink } from "@/lib/whatsapp";

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
  const instagramHandle = CONTACT.instagramUrl
    ? new URL(CONTACT.instagramUrl).pathname.split("/").filter(Boolean).at(-1)
    : null;

  return (
    <div className="container section grid gap-12 pb-20 sm:pb-28 lg:grid-cols-[1fr_1.1fr]">
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
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#128C7E] text-white">
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
              className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#128C7E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0F7A6E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2"
            >
              Start chat
            </a>
          </div>
        )}
        <ul className="mt-8 flex flex-col gap-4 text-sm">
          {CONTACT.email && (
            <li className="flex items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gold-100/30">
                <Mail aria-hidden="true" className="size-4 text-gold-700" />
              </span>
              <a href={`mailto:${CONTACT.email}`} className="hover:underline">{CONTACT.email}</a>
            </li>
          )}
          {CONTACT.phone && CONTACT.phoneHref && (
            <li className="flex items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gold-100/30">
                <Phone aria-hidden="true" className="size-4 text-gold-700" />
              </span>
              <a href={CONTACT.phoneHref} className="hover:underline">{CONTACT.phone}</a>
            </li>
          )}
          {CONTACT.instagramUrl && instagramHandle && (
            <li className="flex items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gold-100/30">
                <Instagram aria-hidden="true" className="size-4 text-gold-700" />
              </span>
              <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                @{instagramHandle}
              </a>
            </li>
          )}
          {CONTACT.address && (
            <li className="flex items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gold-100/30">
                <MapPin aria-hidden="true" className="size-4 text-gold-700" />
              </span>
              <span>{CONTACT.address}</span>
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
