"use client";

import { CheckCircle2, FileText, Lock, PlayCircle, Video } from "lucide-react";

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
          <p className="px-1 text-xs font-semibold text-muted-foreground">
            Module {mi + 1}. {m.title}
          </p>
          <ul className="mt-2 flex flex-col">
            {m.lessons.map((l) => {
              const Icon = l.completed ? CheckCircle2 : l.locked ? Lock : ICON[l.lesson_type];
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => !l.locked && onSelect(l)}
                    aria-current={currentId === l.id ? "true" : undefined}
                    disabled={l.locked}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                      currentId === l.id ? "bg-gold-100/40 font-semibold" : "hover:bg-muted",
                      l.locked && "cursor-not-allowed opacity-60",
                    )}
                  >
                    <Icon className={cn("size-4 shrink-0", l.completed ? "text-success" : "text-gold-700")} />
                    <span className="min-w-0 flex-1 truncate">{l.title}</span>
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
