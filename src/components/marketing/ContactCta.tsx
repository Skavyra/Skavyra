import { ContactForm } from "./ContactForm";

/** Home page closer. The form writes a lead with source website_form. */
export function ContactCta() {
  return (
    <section id="callback" className="section container">
      <div className="grid items-center gap-10 rounded-3xl border bg-card p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="max-w-xl">
          <h2 className="text-fluid-3xl">Not sure which course fits you?</h2>
          <p className="mt-4 text-fluid-base text-muted-foreground">
            Leave your number and a counsellor will call you back to talk through your degree, your goals and the course
            that suits them.
          </p>
        </div>
        <ContactForm compact />
      </div>
    </section>
  );
}
