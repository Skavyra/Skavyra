"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isMarketingNavLinkActive, type MarketingNavLink } from "@/lib/marketing-nav";

export function DesktopNav({ links }: { links: MarketingNavLink[] }) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const [search, setSearch] = useState("");
  const [pendingLocation, setPendingLocation] = useState<{ pathname: string; hash: string; search: string } | null>(null);

  useEffect(() => {
    const syncLocation = () => {
      const nextHash = window.location.hash;
      setHash(nextHash);
      setSearch(window.location.search);
      setPendingLocation(null);
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
    const targetPath = pendingLocation?.pathname ?? pathname;
    const targetHash = pendingLocation ? pendingLocation.hash : window.location.hash;
    if (!targetHash || targetPath !== pathname) return;

    let cancelled = false;
    let scheduled = false;
    let timer: ReturnType<typeof setTimeout>;
    let firstFrame = 0;
    let secondFrame = 0;
    let attempts = 0;

    const alignToAnchor = () => {
      if (cancelled) return;
      let id = targetHash.slice(1);
      try {
        id = decodeURIComponent(id);
      } catch {
        // Keep the literal fragment if it contains malformed percent encoding.
      }
      const target = document.getElementById(id);
      if (!target && attempts < 20) {
        attempts += 1;
        timer = setTimeout(alignToAnchor, 100);
        return;
      }
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const scheduleAlignment = () => {
      if (cancelled || scheduled) return;
      scheduled = true;
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          timer = setTimeout(alignToAnchor, 120);
        });
      });
    };

    if ("fonts" in document) {
      void document.fonts.ready.then(scheduleAlignment);
    } else {
      scheduleAlignment();
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      clearTimeout(timer);
    };
  }, [pathname, hash, pendingLocation]);

  return (
    <nav
      aria-label="Main"
      className="hdr__nav"
    >
      {links.map((link) => {
        const activePathname = pendingLocation?.pathname ?? pathname;
        const activeHash = pendingLocation?.hash ?? hash;
        const activeSearch = pendingLocation?.search ?? search;
        const active = isMarketingNavLinkActive(link, links, activePathname, activeHash, activeSearch);

        return (
          <Link
            key={link.label}
            href={link.href}
            onClick={(event) => {
              if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              const destination = new URL(link.href, window.location.href);
              const nextLocation = { pathname: destination.pathname, hash: destination.hash, search: destination.search };
              setPendingLocation(
                nextLocation.pathname === window.location.pathname && nextLocation.hash === window.location.hash && nextLocation.search === window.location.search
                  ? null
                  : nextLocation,
              );
            }}
            aria-current={active ? "page" : undefined}
            className={active ? "is-active" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
