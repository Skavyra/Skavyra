"use client";

import { useState } from "react";

import { WHATSAPP_DEFAULT_MESSAGE, whatsappLink } from "@/lib/whatsapp";

import { WhatsAppIcon } from "./WhatsAppIcon";

export function WhatsAppFloat() {
  const [hasHovered, setHasHovered] = useState(false);
  const href = whatsappLink(WHATSAPP_DEFAULT_MESSAGE);
  if (!href) return null;

  return (
    <div className="group fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-40 flex items-center gap-3 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] sm:right-6">
      <span className="pointer-events-none hidden rounded-full bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-lg transition duration-200 md:inline-flex md:translate-x-2 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100 md:group-focus-within:translate-x-0 md:group-focus-within:opacity-100">
        Chat with us
      </span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Skavyra on WhatsApp"
        onMouseEnter={() => setHasHovered(true)}
        onFocus={() => setHasHovered(true)}
        className="relative isolate z-10 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2"
      >
        {!hasHovered && (
          <span aria-hidden="true" className="pointer-events-none absolute -inset-1 rounded-full border-2 border-[#25D366]/40 motion-safe:animate-ping motion-reduce:hidden" />
        )}
        <WhatsAppIcon className="relative z-10 size-7" />
      </a>
    </div>
  );
}
