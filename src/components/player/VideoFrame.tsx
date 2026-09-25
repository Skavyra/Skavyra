"use client";

import { ExternalLink, FileText, Lock, Video } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

export type LessonMediaPayload =
  | { kind: "video"; url: string }
  | { kind: "iframe"; url: string }
  | { kind: "link"; url: string; label: string }
  | { kind: "live"; url: string | null; scheduled_at: string | null }
  | { kind: "document"; url: string };

/**
 * Asks /api/lesson-url for a playable URL each time a lesson opens. The URL is
 * never in the page source: the server checks access first and signs storage
 * files for a short time.
 */
export function LessonMedia({ lessonId, onLoaded }: { lessonId: string; onLoaded?: () => void }) {
  const [state, setState] = useState<{ loading: boolean; error?: string; media?: LessonMediaPayload }>({ loading: true });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true });
    fetch(`/api/lesson-url?lessonId=${lessonId}`, { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) setState({ loading: false, error: json.error ?? "This lesson could not load." });
        else {
          setState({ loading: false, media: json as LessonMediaPayload });
          onLoaded?.();
        }
      })
      .catch(() => !cancelled && setState({ loading: false, error: "This lesson could not load. Check your connection." }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  if (state.loading) return <Skeleton className="aspect-video w-full rounded-xl" />;
  if (state.error || !state.media) {
    return (
      <div className="grid aspect-video w-full place-items-center rounded-xl border border-dashed bg-muted/50 p-6 text-center">
        <div className="flex max-w-sm flex-col items-center gap-2">
          <Lock className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{state.error}</p>
        </div>
      </div>
    );
  }

  const m = state.media;
  if (m.kind === "video") {
    return (
      <video
        key={m.url}
        src={m.url}
        controls
        controlsList="nodownload"
        playsInline
        className="aspect-video w-full rounded-xl bg-ink"
        onContextMenu={(e) => e.preventDefault()}
      />
    );
  }
  if (m.kind === "iframe") {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-ink">
        <iframe
          src={m.url}
          title="Lesson"
          className="size-full"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  if (m.kind === "document") {
    return (
      <div className="flex flex-col gap-3">
        <iframe src={m.url} title="Lesson document" className="h-[70vh] w-full rounded-xl border bg-card" />
        <Button asChild variant="outline" size="sm" className="self-start">
          <a href={m.url} target="_blank" rel="noreferrer">
            <FileText /> Open in a new tab
          </a>
        </Button>
      </div>
    );
  }
  if (m.kind === "live") {
    return (
      <div className="grid aspect-video w-full place-items-center rounded-xl bg-ink p-6 text-center text-ivory">
        <div className="flex flex-col items-center gap-3">
          <Video className="size-8 text-gold-300" />
          <p className="font-display text-xl font-bold">Live class</p>
          <p className="text-sm text-ivory/70">{m.scheduled_at ? formatDate(m.scheduled_at, true) : "Time to be announced"}</p>
          {m.url ? (
            <Button asChild variant="gold">
              <a href={m.url} target="_blank" rel="noreferrer">
                Join live class <ExternalLink />
              </a>
            </Button>
          ) : (
            <p className="text-xs text-ivory/60">The joining link appears here once your mentor adds it.</p>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="grid aspect-video w-full place-items-center rounded-xl border bg-muted/40 p-6">
      <Button asChild size="lg">
        <a href={m.url} target="_blank" rel="noreferrer">
          {m.label} <ExternalLink />
        </a>
      </Button>
    </div>
  );
}
