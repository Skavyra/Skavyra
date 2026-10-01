"use client";

import { useEffect, type ReactNode } from "react";

export function HeaderFrame({ children }: { children: ReactNode }) {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    if (!header) return;

    const update = () => {
      const next = window.scrollY > 12 ? "true" : "false";
      if (header.dataset.scrolled !== next) header.dataset.scrolled = next;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      data-site-header
      data-scrolled="false"
      className="theme-ink group sticky top-0 z-40 border-b border-transparent bg-background text-foreground transition-[height,background-color,border-color,box-shadow,backdrop-filter] duration-300 data-[scrolled=true]:border-white/[0.07] data-[scrolled=true]:bg-background/80 data-[scrolled=true]:shadow-[0_8px_30px_rgba(0,0,0,0.12)] data-[scrolled=true]:backdrop-blur-xl"
    >
      {children}
    </header>
  );
}
