"use client";

import { type PointerEvent, type ReactNode, useRef } from "react";

export function MagneticWrap({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  function move(event: PointerEvent<HTMLSpanElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce), (hover: none), (pointer: coarse)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - (bounds.left + bounds.width / 2)) * 0.1;
    const y = (event.clientY - (bounds.top + bounds.height / 2)) * 0.1;
    ref.current?.style.setProperty("transform", `translate(${Math.max(-3, Math.min(3, x))}px, ${Math.max(-3, Math.min(3, y))}px)`);
  }

  return (
    <span ref={ref} onPointerMove={move} onPointerLeave={() => ref.current?.style.removeProperty("transform")} className="inline-flex transition-transform duration-200 ease-out">
      {children}
    </span>
  );
}
