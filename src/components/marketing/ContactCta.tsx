import { WHATSAPP_DEFAULT_MESSAGE, whatsappLink } from "@/lib/whatsapp";

import { ContactForm } from "./ContactForm";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** Home page closer. The form writes a lead with source website_form. */
export function ContactCta() {
  const whatsappHref = whatsappLink(WHATSAPP_DEFAULT_MESSAGE);

  return (
    <section className="sec contact" id="callback">
      <div className="wrap cta">
        <div className="cta__copy reveal">
          <p className="over"><span className="over__bar" />A good next step starts with a conversation</p>
          <h2 className="h2">Not sure which course <span className="hl">fits you?</span></h2>
          <p className="lead">
            Leave your number and a counsellor will call you back to talk through your degree, your goals and the course
            that suits them.
          </p>
          {whatsappHref && (
            <a
              className="btn btn--wa btn--lg"
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with a counsellor on WhatsApp"
            >
              <WhatsAppIcon className="ic" />Chat with a counsellor on WhatsApp
            </a>
          )}
        </div>
        <div className="cta__art reveal">
          <span className="blk blk--y cta__blk" aria-hidden="true" />
          <div className="cform">
            <p className="cform__h">Request a call back</p>
            <ContactForm compact />
          </div>
        </div>
      </div>
    </section>
  );
}
