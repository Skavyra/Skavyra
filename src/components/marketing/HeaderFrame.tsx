"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

type HeaderMenuState = { open: boolean; setOpen: Dispatch<SetStateAction<boolean>> };
const HeaderMenuContext = createContext<HeaderMenuState | null>(null);

export function useHeaderMenu() {
  const context = useContext(HeaderMenuContext);
  if (!context) throw new Error("useHeaderMenu must be used within HeaderFrame");
  return context;
}

export function HeaderFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    if (!header) return;

    const update = () => {
      const next = window.scrollY > 12 ? "true" : "false";
      if (header.dataset.scrolled !== next) header.dataset.scrolled = next;

      header.classList.toggle("is-stuck", window.scrollY > 8);

      let bandBottom = 0;
      if (pathname === "/") {
        const hero = document.querySelector<HTMLElement>("#main .hero");
        bandBottom = hero ? hero.offsetTop + hero.offsetHeight : 0;
      } else {
        const band = document.querySelector<HTMLElement>(".cd__band")
          ?? document.querySelector<HTMLElement>("#main .pb, #main .fh, #main .nf, #main .hero");
        bandBottom = band ? band.getBoundingClientRect().bottom + window.scrollY : 0;
      }

      const glass = pathname === "/"
        ? Boolean(document.querySelector("#main .hero")) && window.scrollY > bandBottom - header.offsetHeight
        : window.scrollY > 8 && (!bandBottom || window.scrollY > bandBottom - header.offsetHeight);
      header.classList.toggle("is-glass", glass);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  return (
    <header
      data-site-header
      data-scrolled="false"
      className={`hdr${open ? " is-open" : ""}`}
    >
      <HeaderMenuContext.Provider value={{ open, setOpen }}>{children}</HeaderMenuContext.Provider>
    </header>
  );
}
