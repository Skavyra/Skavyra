import Link from "next/link";

import { Logo, TaglineRule } from "@/components/brand/logo";
import { SUPPORT_EMAIL } from "@/lib/content";

const COLUMNS = [
  {
    title: "Courses",
    links: [
      { href: "/courses", label: "All courses" },
      { href: "/courses?category=it", label: "IT courses" },
      { href: "/courses?category=non_it", label: "Non-IT courses" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/verify", label: "Verify a certificate" },
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
  return (
    <footer className="theme-ink relative overflow-hidden border-t border-white/[0.06] bg-background text-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 size-96 rounded-full border border-gold-300/[0.08] shadow-[0_0_100px_rgba(142,103,24,0.08)]" />
      <div className="container grid gap-10 py-fluid-md md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-4">
          <Logo />
          <TaglineRule className="text-gold-300" />
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm text-muted-foreground hover:text-gold-100">
            {SUPPORT_EMAIL}
          </a>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
          <h2 className="font-sans text-sm font-bold text-gold-100">{col.title}</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-gold-100">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <p className="container py-6 text-xs text-muted-foreground">© {new Date().getFullYear()} Skavyra. All rights reserved.</p>
      </div>
    </footer>
  );
}
