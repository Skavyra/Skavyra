"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
  const footerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: reduce)", () => {
        gsap.from(footer, { opacity: 0, duration: 0.2, clearProps: "opacity", scrollTrigger: { trigger: footer, start: "top 94%", once: true } });
      });
      media.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.from(footer, { opacity: 0, y: 20, duration: 0.6, ease: "power2.out", clearProps: "transform,opacity", scrollTrigger: { trigger: footer, start: "top 94%", once: true } });
      });
      media.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.from(footer, { opacity: 0, y: 10, duration: 0.45, ease: "power2.out", clearProps: "transform,opacity", scrollTrigger: { trigger: footer, start: "top 96%", once: true } });
      });
      return () => media.revert();
    }, footer);

    return () => context.revert();
  }, []);

  return (
    <footer ref={footerRef} className="theme-ink relative overflow-hidden border-t border-white/[0.06] bg-background text-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 size-96 rounded-full border border-gold-300/[0.08] shadow-[0_0_100px_rgba(142,103,24,0.08)]" />
      <div className="container grid gap-10 py-fluid-md md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-4">
          <Logo className="transition-transform duration-200 motion-safe:hover:scale-[1.02]" />
          <TaglineRule className="text-gold-300" />
          <a href={`mailto:${SUPPORT_EMAIL}`} className="group relative w-fit text-sm text-muted-foreground transition-colors hover:text-gold-100 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-center after:scale-x-0 after:bg-gold-300 after:transition-transform hover:after:scale-x-100">
            {SUPPORT_EMAIL}
          </a>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
          <h2 className="font-sans text-sm font-bold text-gold-100">{col.title}</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="group relative w-fit text-sm text-muted-foreground transition-colors hover:text-gold-100 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-center after:scale-x-0 after:bg-gold-300 after:transition-transform hover:after:scale-x-100">
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
