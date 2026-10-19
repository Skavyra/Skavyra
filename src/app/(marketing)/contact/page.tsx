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
    <>
      <section className="theme-ink relative overflow-hidden bg-ink pb-32 pt-fluid-lg text-ivory sm:pb-40">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 size-[30rem] rounded-full bg-gold-300/15 blur-3xl" />
        <div className="container relative z-10 max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-gold-300">{isCollege ? "For colleges" : "Contact us"}</p>
          <h1 className="mt-3 text-fluid-3xl text-ivory">{isCollege ? "Bring Skavyra to your college" : "Talk to a counsellor"}</h1>
          <p className="mt-4 max-w-2xl text-fluid-base text-ivory/70">
            {isCollege
              ? "Tell us about your students and placement goals. We will get back to you with a plan for your campus."
              : "Leave your details and a counsellor will call you back, usually within one working day."}
          </p>
        </div>
      </section>

      <section className="relative z-10 -mt-24 pb-20 sm:-mt-32 sm:pb-28">
        <div className="container grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-8">
          <div className="order-2 flex flex-col gap-6 rounded-3xl border border-ink/10 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(13,13,13,0.45)] lg:order-1 sm:p-8">
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
            <ul className="flex flex-col gap-3 text-sm">
              {CONTACT.email && (
                <li className="flex items-center gap-3 rounded-xl border border-ink/10 p-3 transition-colors hover:border-gold-300">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink">
                    <Mail aria-hidden="true" className="size-4 text-gold-300" />
                  </span>
                  <a href={`mailto:${CONTACT.email}`} className="min-w-0 break-all hover:underline">{CONTACT.email}</a>
                </li>
              )}
              {CONTACT.phone && CONTACT.phoneHref && (
                <li className="flex items-center gap-3 rounded-xl border border-ink/10 p-3 transition-colors hover:border-gold-300">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink">
                    <Phone aria-hidden="true" className="size-4 text-gold-300" />
                  </span>
                  <a href={CONTACT.phoneHref} className="min-w-0 break-all hover:underline">{CONTACT.phone}</a>
                </li>
              )}
              {CONTACT.instagramUrl && instagramHandle && (
                <li className="flex items-center gap-3 rounded-xl border border-ink/10 p-3 transition-colors hover:border-gold-300">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink">
                    <Instagram aria-hidden="true" className="size-4 text-gold-300" />
                  </span>
                  <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="min-w-0 break-all hover:underline">
                    @{instagramHandle}
                  </a>
                </li>
              )}
              {CONTACT.address && (
                <li className="flex items-center gap-3 rounded-xl border border-ink/10 p-3 transition-colors hover:border-gold-300">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink">
                    <MapPin aria-hidden="true" className="size-4 text-gold-300" />
                  </span>
                  <span className="min-w-0 break-words">{CONTACT.address}</span>
                </li>
              )}
            </ul>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-ink/60">What happens next</h2>
              <ol className="mt-4 flex flex-col gap-4">
                {(isCollege
                  ? [
                      "We review your campus and student needs.",
                      "We share a plan for your students.",
                      "We set up a call with your team.",
                    ]
                  : [
                      "A counsellor calls you, usually within one working day.",
                      "You get a free chat about your goals and the right course.",
                      "You decide. No pressure, no spam.",
                    ]
                ).map((step, index) => (
                  <li key={step} className="flex items-center gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gold-300 text-xs font-bold text-ink">{index + 1}</span>
                    <span className="text-sm text-ink/75">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="relative order-1 overflow-hidden rounded-3xl border border-ink/10 bg-white p-6 shadow-[0_18px_55px_-44px_rgba(13,13,13,0.42)] transition-[border-color,box-shadow] duration-300 hover:border-gold-300/60 hover:shadow-[0_24px_65px_-44px_rgba(142,103,24,0.32)] lg:order-2 sm:p-8">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500" />
            <h2 className="font-display text-xl font-bold">{isCollege ? "Tell us about your college" : "Request a callback"}</h2>
            <p className="mt-1 mb-6 text-sm text-ink/60">Takes less than a minute.</p>
            <ContactForm defaultCourse={course} topic={isCollege ? "college" : undefined} />
          </div>
        </div>
      </section>
    </>
  );
}
