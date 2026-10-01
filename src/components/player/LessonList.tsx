"use client";

import { CheckCircle2, FileText, Lock, PlayCircle, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LessonType } from "@/types";

export type PlayerLesson = {
  id: string;
  title: string;
  lesson_type: LessonType;
  duration_minutes: number;
  is_preview: boolean;
  completed: boolean;
  locked: boolean;
};

export type PlayerModule = { id: string; title: string; lessons: PlayerLesson[] };

const ICON: Record<LessonType, typeof PlayCircle> = { video: PlayCircle, document: FileText, live_class: Video, link: FileText };

export function LessonList({
  modules,
  currentId,
  onSelect,
}: {
  modules: PlayerModule[];
  currentId: string | null;
  onSelect: (lesson: PlayerLesson) => void;
}) {
  return (
    <nav aria-label="Lessons" className="flex flex-col gap-5">
      {modules.map((m, mi) => (
        <div key={m.id}>
          <div className="flex items-start justify-between gap-3 px-1">
            <h3 className="min-w-0 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Module {mi + 1}. {m.title}
            </h3>
            <span className="shrink-0 text-[0.6875rem] tabular-nums text-muted-foreground">
              {m.lessons.filter((lesson) => lesson.completed).length}/{m.lessons.length}
            </span>
          </div>
          <ul className="mt-2 flex flex-col gap-0.5">
            {m.lessons.map((l) => {
              const Icon = l.locked ? Lock : l.completed ? CheckCircle2 : ICON[l.lesson_type];
              const state = [
                currentId === l.id ? "current lesson" : null,
                l.completed ? "completed" : null,
                l.locked ? "locked" : null,
                l.is_preview ? "preview lesson" : null,
              ].filter(Boolean).join(", ");
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => !l.locked && onSelect(l)}
                    aria-current={currentId === l.id ? "step" : undefined}
                    aria-label={`${l.title}${state ? `, ${state}` : ""}`}
                    disabled={l.locked}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg border-l-2 border-transparent px-3 py-2.5 text-left text-sm transition-[background-color,color,border-color] duration-200 focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2",
                      currentId === l.id ? "border-l-gold-700 bg-gold-100/40 font-bold text-foreground" : "hover:bg-muted",
                      l.locked && "cursor-not-allowed opacity-60",
                    )}
                  >
                    <Icon aria-hidden="true" className={cn("size-4 shrink-0", l.locked ? "text-muted-foreground" : l.completed ? "text-success" : "text-gold-700")} />
                    <span className="min-w-0 flex-1 truncate">{l.title}</span>
                    {l.is_preview && <Badge tone="muted" className="px-1.5 py-0 text-[0.625rem]">Preview</Badge>}
                    {!!l.duration_minutes && <span className="shrink-0 text-xs text-muted-foreground">{l.duration_minutes}m</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
