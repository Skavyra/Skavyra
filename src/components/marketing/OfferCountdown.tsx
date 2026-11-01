"use client";

import { useEffect, useState } from "react";

export function OfferCountdown({ endsAt }: { endsAt: string | null }) {
  const [mounted, setMounted] = useState(false);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    setRemainingMs(null);
    if (!endsAt) return;

    const endTime = new Date(endsAt).getTime();
    if (!Number.isFinite(endTime)) return;

    const updateRemaining = () => setRemainingMs(endTime - Date.now());
    updateRemaining();
    const intervalId = window.setInterval(updateRemaining, 60_000);
    return () => window.clearInterval(intervalId);
  }, [endsAt]);

  if (!mounted || remainingMs === null || remainingMs <= 0) return null;

  const totalMinutes = Math.floor(remainingMs / 60_000);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  return <>{days}d {hours}h {minutes}m</>;
}
