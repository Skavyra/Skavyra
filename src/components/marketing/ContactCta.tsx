"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { ContactForm } from "./ContactForm";
import { Quarter } from "./Quarter";

/** Home page closer. The form writes a lead with source website_form. */
export function ContactCta() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    if (!section || !card) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: reduce)", () => {
        gsap.from(card, { opacity: 0, duration: 0.2, clearProps: "opacity", scrollTrigger: { trigger: section, start: "top 86%", once: true } });
      });
      media.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.from(card, { opacity: 0, y: 58, scale: 0.97, duration: 0.75, ease: "power3.out", clearProps: "transform,opacity", scrollTrigger: { trigger: section, start: "top 82%", once: true } });
      });
      media.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.from(card, { opacity: 0, y: 28, scale: 0.99, duration: 0.55, ease: "power2.out", clearProps: "transform,opacity", scrollTrigger: { trigger: section, start: "top 86%", once: true } });
      });
      return () => media.revert();
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section ref={sectionRef} id="callback" className="section container scroll-mt-24">
      <div ref={cardRef} className="relative isolate grid items-center gap-8 overflow-hidden rounded-[2rem] border border-ink/10 bg-ink p-6 text-ivory shadow-[0_30px_70px_-46px_rgba(13,13,13,0.6)] sm:gap-10 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:p-12">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 -z-10 size-80 rounded-full border border-gold-300/20 shadow-[0_0_100px_rgba(142,103,24,0.17)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-2 top-4 -z-10 opacity-30"><Quarter className="size-36" fill="#B98A24" /></div>
        <div className="max-w-xl">
          <p className="tagline mb-5 text-gold-300">A good next step starts with a conversation</p>
          <h2 className="text-fluid-3xl">Not sure which course fits you?</h2>
          <p className="mt-4 text-fluid-base text-ivory/70">
            Leave your number and a counsellor will call you back to talk through your degree, your goals and the course
            that suits them.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-paper p-5 text-ink shadow-[0_18px_50px_-32px_rgba(0,0,0,0.8)] sm:p-6 [&_button[type=submit]]:w-full">
          <ContactForm compact />
        </div>
      </div>
    </section>
  );
}
