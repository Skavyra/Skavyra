import type { Metadata } from "next";

import { Logo, TaglineRule } from "@/components/brand/logo";
import { Countdown } from "./Countdown";

export const metadata: Metadata = { title: "Launch", robots: { index: false } };

export default function LaunchPage() {
  return (
    <main className="theme-ink relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-ink px-6 py-16 text-center text-ivory">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 size-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-300/10 blur-3xl" />
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center">
        <div className="text-ivory">
          <Logo />
        </div>
        <p className="mt-10 rounded-full border border-gold-300/50 bg-gold-300/15 px-4 py-1 text-xs font-bold uppercase tracking-widest text-gold-100">
          Launching today
        </p>
        <h1 className="mt-6 font-display text-fluid-3xl font-bold sm:text-6xl">
          Skavyra Technologies is launching
        </h1>
        <p className="mt-4 max-w-md text-ivory/70">Your learning partner in the digital era.</p>
        <Countdown target="2026-10-20T17:59:00+05:30" />
        <TaglineRule className="mt-10 text-gold-300" />
      </div>
    </main>
  );
}
