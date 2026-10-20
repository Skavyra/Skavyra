"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CountdownProps = { target: string };

const UNITS = [
  { label: "Days", duration: 24 * 60 * 60 * 1000 },
  { label: "Hours", duration: 60 * 60 * 1000 },
  { label: "Minutes", duration: 60 * 1000 },
  { label: "Seconds", duration: 1000 },
];

function Confetti() {
  const colors = ["#F2C75C", "#DDAA2F", "#B98A24", "#FBF9F4"];
  const pieces = Array.from({ length: 90 }, (_, i) => i);
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <style>{`@keyframes skv-fall{0%{transform:translateY(-10vh) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}`}</style>
      {pieces.map((i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: 0,
            left: `${(i * 37) % 100}%`,
            width: i % 3 === 0 ? 6 : 10,
            height: i % 3 === 0 ? 14 : 8,
            background: colors[i % colors.length],
            borderRadius: i % 4 === 0 ? 9999 : 2,
            animation: `skv-fall ${2.8 + (i % 7) * 0.35}s ease-in ${(i % 15) * 0.12}s 2 both`,
          }}
        />
      ))}
    </div>
  );
}

export function Countdown({ target }: CountdownProps) {
  const end = new Date(target).getTime();
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setLeft(Math.max(0, end - Date.now()));
    update();
    const interval = setInterval(() => setLeft(Math.max(0, end - Date.now())), 1000);
    return () => clearInterval(interval);
  }, [end]);

  const live = left === 0;
  const header = (
    <>
      <p className="mt-10 rounded-full border border-gold-300/50 bg-gold-300/15 px-4 py-1 text-xs font-bold uppercase tracking-widest text-gold-100">
        {live ? "Now live" : "Launching today"}
      </p>
      <h1 className="mt-6 font-display text-fluid-3xl font-bold sm:text-6xl">
        {live ? "Skavyra Technologies is live" : "Skavyra Technologies is launching"}
      </h1>
      <p className="mt-4 max-w-md text-ivory/70">Your learning partner in the digital era.</p>
    </>
  );

  if (left === 0) {
    return (
      <>
        {header}
        <div className="mt-10 flex flex-col items-center">
          <Confetti />
          <Link href="/" className="inline-flex items-center rounded-full bg-gold-300 px-8 py-4 font-semibold text-ink hover:bg-gold-100">
            Explore Skavyra
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      {header}
      <style>{`@keyframes launchflip{from{transform:rotateX(90deg);opacity:0}to{transform:rotateX(0);opacity:1}}`}</style>
      <div className="mt-10 grid w-full max-w-2xl grid-cols-4 gap-2 sm:gap-4">
        {UNITS.map(({ label, duration }) => {
          const value = left === null ? "--" : String(Math.floor(left / duration) % (duration === 24 * 60 * 60 * 1000 ? Infinity : duration === 60 * 60 * 1000 ? 24 : 60)).padStart(2, "0");
          return (
            <div key={label} className="min-w-0 rounded-2xl border border-gold-300/30 bg-ivory/5 px-4 py-5 shadow-[0_20px_60px_-30px_rgba(221,170,47,0.45)] sm:px-8 sm:py-7">
              <span key={value} className="inline-block animate-[launchflip_0.45s_ease-out] font-display text-4xl font-bold tabular-nums text-gold-100 sm:text-7xl">
                {value}
              </span>
              <p className="mt-2 text-[10px] uppercase tracking-widest text-ivory/60 sm:text-xs">{label}</p>
            </div>
          );
        })}
      </div>
    </>
  );
}
