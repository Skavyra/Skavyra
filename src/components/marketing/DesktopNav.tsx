"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavLink = { href: string; label: string };

export function DesktopNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, [pathname]);

  return (
    <nav
      aria-label="Main"
      className="hidden items-center gap-0.5 rounded-full border border-yellow-200/25 bg-black/40 p-1 shadow-[0_8px_24px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,245,190,0.16)] backdrop-blur-xl md:flex"
    >
      {links.map((link) => {
        const path = link.href.split(/[?#]/)[0];
        const linkHash = link.href.includes("#") ? `#${link.href.split("#")[1]}` : "";
        const hashAliasIsActive = links.some((candidate) => {
          const aliasPath = candidate.href.split(/[?#]/)[0];
          const aliasHash = candidate.href.includes("#") ? `#${candidate.href.split("#")[1]}` : "";
          return aliasPath === path && aliasHash !== "" && hash === aliasHash;
        });
        const active = linkHash
          ? pathname === path && hash === linkHash
          : (pathname === path && !hashAliasIsActive) || (path !== "/" && pathname.startsWith(`${path}/`));

        return (
          <Link
            key={link.label}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:ring-white ${
              active
              ? "bg-yellow-300 text-black shadow-[0_1px_8px_rgba(253,224,71,0.25)]"
              : "text-white/90 hover:bg-yellow-200/10 hover:text-yellow-100"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
