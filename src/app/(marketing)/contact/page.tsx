import { ArrowRight, ChevronRight, Instagram, Mail, MapPin, Phone, PhoneCall } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
  const lead = isCollege
    ? "Tell us about your students and placement goals. We will get back to you with a plan for your campus."
    : "Leave your details and a counsellor will call you back, usually within one working day.";
  const steps = isCollege
    ? [
        "We review your campus and student needs.",
        "We share a plan for your students.",
        "We set up a call with your team.",
      ]
    : [
        "A counsellor calls you, usually within one working day.",
        "You get a free chat about your goals and the right course.",
        "You decide. No pressure, no spam.",
      ];

  return (
    <>
      <section className="pb">
        <span className="pb__q" aria-hidden="true" />
        <span className="pb__q2" aria-hidden="true" />
        <span className="pb__dots" aria-hidden="true" />
        <div className="wrap">
          <div className="pb__grid">
            <div className="reveal">
              <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><ChevronRight className="ic" strokeWidth={1.75} aria-hidden="true" /><b>{isCollege ? "For colleges" : "Contact us"}</b></nav>
              <p className="over"><span className="over__bar" />{isCollege ? "For colleges" : "Contact us"}</p>
              <h1 className="ptitle">
                {isCollege ? <>Bring Skavyra to your <span className="hl">college</span></> : <>Talk to a <span className="hl">counsellor</span></>}
              </h1>
              <p className="plead">{lead}</p>
            </div>
            <div className="arch reveal">
              <span className="arch__ring" aria-hidden="true" />
              <div className="arch__img">
                <Image src="/images/site/photo-mentor.jpg" alt="" fill sizes="420px" style={{ objectFit: "cover", objectPosition: "center 30%" }} />
              </div>
              <div className="arch__chip">
                <span><PhoneCall className="ic" strokeWidth={1.75} /></span>
                <div>{isCollege ? "Campus partnerships" : "Free call back"}<small>{isCollege ? "IT and non-IT tracks" : "Usually within one working day"}</small></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap ct">
          <div className="reveal">
            {whatsappHref && (
              <div className="wacard">
                <div className="wacard__h"><span><WhatsAppIcon className="ic" /></span><h2>Chat on WhatsApp</h2></div>
                <p>Fastest way to reach a counsellor. Usually replies within a few hours.</p>
                <a className="btn btn--wa2" href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Start a WhatsApp chat with Skavyra">Start chat <ArrowRight className="ic" strokeWidth={1.75} /></a>
              </div>
            )}
            <ul className="clist">
              {CONTACT.email && <li><a href={`mailto:${CONTACT.email}`}><span><Mail className="ic" strokeWidth={1.75} /></span>{CONTACT.email}</a></li>}
              {CONTACT.phone && CONTACT.phoneHref && <li><a href={CONTACT.phoneHref}><span><Phone className="ic" strokeWidth={1.75} /></span>{CONTACT.phone}</a></li>}
              {CONTACT.instagramUrl && <li><a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer"><span><Instagram className="ic" strokeWidth={1.75} /></span>@skavyra_technologies</a></li>}
              {CONTACT.address && <li><a href={`https://maps.google.com/?q=${encodeURIComponent(CONTACT.address)}`} target="_blank" rel="noopener noreferrer"><span><MapPin className="ic" strokeWidth={1.75} /></span>{CONTACT.address}</a></li>}
            </ul>
            <div className="nextsteps">
              <h2>What happens next</h2>
              <ol>{steps.map((step, index) => <li key={step}><b>{index + 1}</b><span>{step}</span></li>)}</ol>
            </div>
          </div>
          <div className="formwrap reveal">
            <div className="pform">
              <h2>{isCollege ? "Tell us about your college" : "Request a callback"}</h2>
              <p>Takes less than a minute.</p>
              <ContactForm defaultCourse={course} topic={isCollege ? "college" : undefined} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
