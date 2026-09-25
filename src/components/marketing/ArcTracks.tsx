"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { Quarter } from "./Quarter";

export type ArcTrack = { title: string; meta: string; href?: string };

const STEP = 15; // degrees between cards
const RADIUS = 1500; // px, radius of the circle the cards ride on
const SPEED = 3; // degrees per second

/**
 * The hero's arc of course cards. They ride slowly along a large circle whose
 * curve echoes the mark; the card crossing the centre turns gold. Hover or
 * focus pauses it, and reduced-motion users get a still arc. Phones get a
 * plain swipeable row instead.
 */
export function ArcTracks({ tracks }: { tracks: ArcTrack[] }) {
  // repeat short lists so the arc is always full
  const items = tracks.length === 0 ? [] : Array.from({ length: Math.max(7, tracks.length) }, (_, i) => tracks[i % tracks.length]);
  const span = items.length * STEP;
  const [offset, setOffset] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!paused.current) setOffset((o) => (o + dt * SPEED) % span);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [span]);

  if (items.length === 0) return null;

  return (
    <>
      {/* tablet and desktop: the arc */}
      <div
        className="relative mx-auto hidden h-[250px] w-full max-w-[1440px] overflow-hidden md:block"
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
        onFocusCapture={() => (paused.current = true)}
        onBlurCapture={() => (paused.current = false)}
      >
        <ul aria-label="Course tracks">
          {items.map((track, i) => {
            // angle in (-span/2, span/2], centred on 0 at the middle
            let angle = ((i * STEP - offset) % span + span) % span;
            if (angle > span / 2) angle -= span;
            const center = Math.abs(angle) < STEP / 2;
            const hidden = Math.abs(angle) > 44;
            return (
              <li
                key={i}
                aria-hidden={hidden || undefined}
                className="absolute left-1/2 top-8 w-[236px]"
                style={{
                  transform: `translateX(-50%) rotate(${angle}deg)`,
                  transformOrigin: `50% ${RADIUS}px`,
                  opacity: hidden ? 0 : 1,
                  zIndex: center ? 2 : 1,
                }}
              >
                <TrackCard track={track} active={center} tabbable={!hidden} />
              </li>
            );
          })}
        </ul>
      </div>

      {/* phones: swipe sideways */}
      <ul aria-label="Course tracks" className="scroll-x hide-scrollbar -mx-5 flex gap-3 px-5 pb-2 md:hidden">
        {tracks.map((track, i) => (
          <li key={track.title} className="w-[72%] shrink-0 snap-center">
            <TrackCard track={track} active={i === 0} tabbable />
          </li>
        ))}
      </ul>
    </>
  );
}

function TrackCard({ track, active, tabbable }: { track: ArcTrack; active: boolean; tabbable: boolean }) {
  const body = (
    <div
      className={cn(
        "flex h-[140px] flex-col justify-end gap-1.5 rounded-2xl border p-5 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.8)] transition-colors duration-500",
        active ? "border-gold-300 bg-gold-300 text-ink" : "border-white/10 bg-charcoal text-ivory",
      )}
    >
      <Quarter className="mb-auto size-8" fill={active ? "#0D0D0D" : "#DDAA2F"} />
      <p className="font-display text-lg font-bold leading-tight">{track.title}</p>
      <p className={cn("text-xs", active ? "text-ink/70" : "text-ivory/60")}>{track.meta}</p>
    </div>
  );
  if (!track.href) return body;
  return (
    <Link href={track.href} tabIndex={tabbable ? 0 : -1} className="block rounded-2xl">
      {body}
    </Link>
  );
}
