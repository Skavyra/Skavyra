import { ContactForm } from "./ContactForm";
import { Quarter } from "./Quarter";

/** Home page closer. The form writes a lead with source website_form. */
export function ContactCta() {
  return (
    <section id="callback" className="section container scroll-mt-24">
      <div className="relative isolate grid items-center gap-8 overflow-hidden rounded-[2rem] border border-ink/10 bg-ink p-6 text-ivory shadow-[0_30px_70px_-46px_rgba(13,13,13,0.6)] sm:gap-10 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:p-12">
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
