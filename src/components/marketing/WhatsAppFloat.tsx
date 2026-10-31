import { WHATSAPP_DEFAULT_MESSAGE, whatsappLink } from "@/lib/whatsapp";

import { WhatsAppIcon } from "./WhatsAppIcon";

export function WhatsAppFloat() {
  const href = whatsappLink(WHATSAPP_DEFAULT_MESSAGE);
  if (!href) return null;

  return (
    <a className="wa" href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
      <WhatsAppIcon className="ic" />
      <span>Chat with us</span>
    </a>
  );
}
