"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { isMarketingNavLinkActive, type MarketingNavLink } from "@/lib/marketing-nav";

import { useHeaderMenu } from "./HeaderFrame";

export function MobileNavButton() {
  const { open, setOpen } = useHeaderMenu();

  return (
    <button
      type="button"
      className="hdr__burger"
      aria-controls="mnav"
      aria-expanded={open}
      aria-label={open ? "Close menu" : "Open menu"}
      onClick={() => setOpen((value) => !value)}
    >
      {open ? <X className="ic" strokeWidth={1.75} /> : <Menu className="ic" strokeWidth={1.75} />}
    </button>
  );
}

export function MobileNavPanel({ links, home }: { links: MarketingNavLink[]; home: string | null }) {
  const { open, setOpen } = useHeaderMenu();
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const syncLocation = () => {
      setHash(window.location.hash);
      setSearch(window.location.search);
    };
    syncLocation();
    window.addEventListener("hashchange", syncLocation);
    window.addEventListener("popstate", syncLocation);
    return () => {
      window.removeEventListener("hashchange", syncLocation);
      window.removeEventListener("popstate", syncLocation);
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, setOpen]);

  return (
    <div className="mnav" id="mnav">
      <nav className="wrap" aria-label="Mobile">
        {links.map((link) => {
          const active = isMarketingNavLinkActive(link, links, pathname, hash, search);
          return (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={active ? "is-active" : undefined}
            >
              {link.label}
            </Link>
          );
        })}
        <div className="mnav__act">
          {home ? (
            <Link className="btn btn--ink btn--block" href={home} onClick={() => setOpen(false)}>
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link className="btn btn--line btn--block" href="/login" onClick={() => setOpen(false)}>
                Log in
              </Link>
              <Link className="btn btn--ink btn--block" href="/signup" onClick={() => setOpen(false)}>
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
