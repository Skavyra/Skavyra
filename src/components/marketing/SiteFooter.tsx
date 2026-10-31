import Link from "next/link";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";

import { Mark } from "@/components/brand/logo";
import { WhatsAppIcon } from "@/components/marketing/WhatsAppIcon";
import { CONTACT } from "@/lib/contact-info";
import { whatsappLink, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/whatsapp";

const COLUMNS = [
  {
    title: "Courses",
    links: [
      { href: "/courses", label: "All courses" },
      { href: "/flagship", label: "Flagship programs" },
      { href: "/courses?category=it", label: "IT courses" },
      { href: "/courses?category=non_it", label: "Non-IT courses" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of use" },
    ],
  },
];

export function SiteFooter() {
  const whatsappHref = whatsappLink(WHATSAPP_DEFAULT_MESSAGE);

  return (
    <footer className="ftr">
      <div className="wrap ftr__grid">
        <div className="ftr__brand">
          <Link href="/" className="logo logo--light" aria-label="Skavyra home">
            <Mark className="mark" seam="#0D0D0D" />
            <span className="wordmark">Skavyra</span>
          </Link>
          <p className="tagline">Learn <i /> Build <i /> Grow</p>
          <ul className="ftr__contact">
            {CONTACT.email && (
              <li><a href={`mailto:${CONTACT.email}`}><span><Mail className="ic" strokeWidth={1.75} /></span>{CONTACT.email}</a></li>
            )}
            {CONTACT.phone && CONTACT.phoneHref && (
              <li><a href={CONTACT.phoneHref}><span><Phone className="ic" strokeWidth={1.75} /></span>{CONTACT.phone}</a></li>
            )}
            {whatsappHref && (
              <li><a href={whatsappHref} target="_blank" rel="noopener noreferrer"><span><WhatsAppIcon className="ic" /></span>WhatsApp us</a></li>
            )}
            {CONTACT.instagramUrl && (
              <li><a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer"><span><Instagram className="ic" strokeWidth={1.75} /></span>@skavyra_technologies</a></li>
            )}
            {CONTACT.address && (
              <li><span><MapPin className="ic" strokeWidth={1.75} /></span>{CONTACT.address}</li>
            )}
          </ul>
        </div>
        {COLUMNS.map((col) => (
          <div className="ftr__col" key={col.title}>
            <h4>{col.title}</h4>
            {col.links.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
          </div>
        ))}
      </div>
      <div className="wrap ftr__bot">
        <p>© {new Date().getFullYear()} Skavyra. All rights reserved.</p>
      </div>
    </footer>
  );
}
