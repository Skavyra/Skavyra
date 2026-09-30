"use client";

import { useEffect, useState } from "react";

const CHAR_INTERVAL_MS = 15;

export function HeroHeadline({ titleStart, titleAccent }: { titleStart: string; titleAccent: string }) {
  const firstLine = `${titleStart} `;
  const characterCount = [...firstLine, ...titleAccent].length;
  const [visibleCharacters, setVisibleCharacters] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisibleCharacters(characterCount);
      return;
    }

    let count = 1;
    setVisibleCharacters(count);
    const timer = window.setInterval(() => {
      count += 1;
      setVisibleCharacters(count);
      if (count >= characterCount) window.clearInterval(timer);
    }, CHAR_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [characterCount]);

  const reveal = (text: string, offset: number) =>
    [...text].map((character, index) => (
      <span key={offset + index} style={{ opacity: offset + index < visibleCharacters ? 1 : 0 }}>
        {character}
      </span>
    ));

  return (
    <h1
      aria-label={`${titleStart} ${titleAccent}`}
      className="mt-7 max-w-[15ch] text-fluid-hero font-bold tracking-[-0.035em] sm:max-w-none"
    >
      <span aria-hidden="true">{reveal(firstLine, 0)}</span>
      <br className="hidden sm:block" />
      <span aria-hidden="true" className="text-gold-300">
        {reveal(titleAccent, firstLine.length)}
      </span>
    </h1>
  );
}
