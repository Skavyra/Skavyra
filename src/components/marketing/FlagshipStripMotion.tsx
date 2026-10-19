"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function FlagshipStripMotion({ children }: { children: ReactNode }) {
  const cardsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = cardsRef.current;
    if (!container) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const reveals = container.querySelectorAll<HTMLElement>("[data-flagship-reveal]");
        gsap.from(reveals, {
          y: 40,
          opacity: 0,
          stagger: 0.12,
          duration: 0.7,
          ease: "power3.out",
          immediateRender: false,
          clearProps: "opacity,transform",
          scrollTrigger: { trigger: container, start: "top 82%", once: true, invalidateOnRefresh: true },
        });

        const hoverMedia = gsap.matchMedia();
        hoverMedia.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
          const cleanups: Array<() => void> = [];
          const cards = container.querySelectorAll<HTMLElement>("[data-flagship-card]");
          const baseBorders = new Map<HTMLElement, string>();
          const tiltTo = new Map<HTMLElement, {
            rx: (value: number) => void;
            ry: (value: number) => void;
            ty: (value: number) => void;
          }>();

          cards.forEach((card) => {
            gsap.set(card, { transformPerspective: 1000 });
            baseBorders.set(card, getComputedStyle(card).borderColor);
            tiltTo.set(card, {
              rx: gsap.quickTo(card, "rotationX", { duration: 0.4, ease: "power3.out" }),
              ry: gsap.quickTo(card, "rotationY", { duration: 0.4, ease: "power3.out" }),
              ty: gsap.quickTo(card, "y", { duration: 0.4, ease: "power3.out" }),
            });
          });

          const resetCard = (card: HTMLElement) => {
            const tilt = tiltTo.get(card);
            tilt?.rx(0);
            tilt?.ry(0);
            tilt?.ty(0);
            const glow = card.querySelector<HTMLElement>("[data-flagship-glow]");
            if (glow) gsap.to(glow, { autoAlpha: 0, duration: 0.3, overwrite: true });
            gsap.to(card, {
              borderColor: baseBorders.get(card),
              duration: 0.4,
              ease: "power3.out",
              overwrite: "auto",
            });
          };

          cards.forEach((card) => {
            const glow = card.querySelector<HTMLElement>("[data-flagship-glow]");
            const tilt = tiltTo.get(card)!;
            const onPointerMove = (event: PointerEvent) => {
              const bounds = card.getBoundingClientRect();
              const x = event.clientX - bounds.left;
              const y = event.clientY - bounds.top;
              const px = Math.max(-0.5, Math.min(0.5, x / bounds.width - 0.5));
              const py = Math.max(-0.5, Math.min(0.5, y / bounds.height - 0.5));
              card.style.setProperty("--mx", `${x}px`);
              card.style.setProperty("--my", `${y}px`);
              tilt.rx(-py * 12);
              tilt.ry(px * 12);
              tilt.ty(-6);
            };
            const onPointerEnter = () => {
              cards.forEach((otherCard) => {
                if (otherCard !== card) resetCard(otherCard);
              });
              gsap.to(card, { borderColor: "rgb(221, 170, 47)", duration: 0.25, overwrite: "auto" });
              if (glow) gsap.to(glow, { autoAlpha: 1, duration: 0.25, overwrite: true });
            };
            const onPointerLeave = () => {
              resetCard(card);
            };

            card.addEventListener("pointermove", onPointerMove);
            card.addEventListener("pointerenter", onPointerEnter);
            card.addEventListener("pointerleave", onPointerLeave);
            cleanups.push(() => {
              card.removeEventListener("pointermove", onPointerMove);
              card.removeEventListener("pointerenter", onPointerEnter);
              card.removeEventListener("pointerleave", onPointerLeave);
            });
          });

          const resetAllCards = () => cards.forEach((card) => resetCard(card));
          container.addEventListener("pointerleave", resetAllCards);
          cleanups.push(() => {
            container.removeEventListener("pointerleave", resetAllCards);
          });

          return () => cleanups.forEach((cleanup) => cleanup());
        });

        return () => hoverMedia.revert();
      });

      return () => media.revert();
    }, container);

    return () => context.revert();
  }, []);

  return (
    <div
      ref={cardsRef}
      className="-mx-5 mt-8 flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto px-5 pb-2 [perspective:1000px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0"
    >
      {children}
    </div>
  );
}
