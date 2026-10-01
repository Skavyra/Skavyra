"use client";

import { Check, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { markLessonComplete, touchLesson } from "@/actions/enrollments";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { percent } from "@/lib/utils";

import { LessonList, type PlayerLesson, type PlayerModule } from "./LessonList";
import { ResourceList, type Resource } from "./ResourceList";
import { LessonMedia } from "./VideoFrame";

/**
 * The student's course player: lesson rail, the current lesson, and its notes
 * and downloads. Locked courses show why instead of a player.
 */
export function CoursePlayer({
  courseTitle,
  modules,
  resources,
  descriptions,
  enrollmentId,
  accessActive,
  balance,
  initialLessonId,
}: {
  courseTitle: string;
  modules: PlayerModule[];
  resources: Record<string, Resource[]>;
  descriptions: Record<string, string | null>;
  enrollmentId: string;
  accessActive: boolean;
  balance: number;
  initialLessonId?: string;
}) {
  const flat = useMemo(() => modules.flatMap((m) => m.lessons), [modules]);
  const firstOpen = flat.find((l) => !l.completed && !l.locked) ?? flat.find((l) => !l.locked) ?? flat[0] ?? null;
  const requestedLesson = flat.find((lesson) => lesson.id === initialLessonId && !lesson.locked);
  const [currentId, setCurrentId] = useState<string | null>(requestedLesson?.id ?? firstOpen?.id ?? null);
  const initialLessonToTouch = useRef(currentId);
  const initialTouchStarted = useRef(false);
  const [done, setDone] = useState<Record<string, boolean>>(Object.fromEntries(flat.map((l) => [l.id, l.completed])));
  const [pending, start] = useTransition();

  useEffect(() => {
    if (initialTouchStarted.current) return;
    initialTouchStarted.current = true;
    if (accessActive && initialLessonToTouch.current) {
      void touchLesson(initialLessonToTouch.current, enrollmentId).catch(() => undefined);
    }
  }, [accessActive, enrollmentId]);

  const index = flat.findIndex((l) => l.id === currentId);
  const current = index >= 0 ? flat[index] : null;
  const completedCount = Object.values(done).filter(Boolean).length;
  const activeLessonId = current?.id;
  const currentModuleIndex = activeLessonId ? modules.findIndex((module) => module.lessons.some((lesson) => lesson.id === activeLessonId)) : -1;
  const currentModule = currentModuleIndex >= 0 ? modules[currentModuleIndex] : null;
  const currentModuleLessonIndex = activeLessonId
    ? (currentModule?.lessons.findIndex((lesson) => lesson.id === activeLessonId) ?? -1)
    : -1;

  const select = (lesson: PlayerLesson) => {
    setCurrentId(lesson.id);
    const url = new URL(window.location.href);
    url.searchParams.set("lesson", lesson.id);
    window.history.replaceState(null, "", url);
    if (accessActive) void touchLesson(lesson.id, enrollmentId).catch(() => undefined);
  };

  if (!accessActive) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed p-10 text-center">
        <Lock className="size-6 text-gold-700" />
        <p className="font-display text-lg font-bold">Your access to this course is paused</p>
        <p className="max-w-md text-sm text-muted-foreground">
          {balance > 0
            ? "Clear the outstanding balance and your lessons unlock straight away."
            : "Your counsellor can switch access back on. Get in touch and they will sort it out."}
        </p>
        <Button asChild>
          <Link href="/dashboard/payments">{balance > 0 ? "Go to payments" : "View payments"}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-card px-4 py-3 shadow-[0_12px_32px_-28px_rgba(13,13,13,0.4)] sm:px-5">
        <div className="min-w-0">
          {currentModule && current && (
            <p className="truncate text-xs font-bold uppercase tracking-[0.14em] text-gold-700">
              Module {currentModuleIndex + 1} · {currentModule.title}
            </p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            {current ? `Lesson ${currentModuleLessonIndex + 1} of ${currentModule?.lessons.length ?? flat.length}` : "Course lessons"}
            {current && flat.length > 0 ? ` · ${completedCount} of ${flat.length} complete` : ""}
          </p>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
        <section aria-labelledby="player-lesson-title" className="order-1 min-w-0 lg:order-1">
        {current ? (
          <>
            <div className="mb-4 rounded-2xl border border-ink/10 bg-card/70 px-4 py-4 sm:px-5">
              <h2 id="player-lesson-title" className="break-words text-fluid-xl">{current.title}</h2>
            </div>

            <div className="overflow-hidden rounded-2xl border bg-ink p-1.5 shadow-sm sm:p-2">
              <LessonMedia lessonId={current.id} />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-card p-3 shadow-[0_12px_32px_-28px_rgba(13,13,13,0.4)] sm:p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  disabled={index <= 0}
                  onClick={() => index > 0 && select(flat[index - 1])}
                >
                  <ChevronLeft /> Previous lesson
                </Button>
                <Button
                  variant={done[current.id] ? "outline" : "default"}
                  loading={pending}
                  aria-label={done[current.id] ? `Undo completion for ${current.title}` : `Mark ${current.title} complete`}
                  onClick={() =>
                    start(async () => {
                      const next = !done[current.id];
                      try {
                        const result = await markLessonComplete(current.id, enrollmentId, next);
                        if (!result.ok) {
                          toast.error(result.error);
                          return;
                        }
                        setDone((d) => ({ ...d, [current.id]: next }));
                        if (next) {
                          toast.success("Marked complete");
                          if (index < flat.length - 1) select(flat[index + 1]);
                        } else {
                          toast.success("Completion removed");
                        }
                      } catch {
                        toast.error("Progress could not be saved. Please try again.");
                      }
                    })
                  }
                >
                  <Check /> {done[current.id] ? "Completed · Undo" : "Mark complete"}
                </Button>
              </div>
              {index < flat.length - 1 ? (
                <Button variant="outline" onClick={() => select(flat[index + 1])}>
                  Next lesson <ChevronRight />
                </Button>
              ) : (
                <span className="px-2 text-sm font-medium text-muted-foreground">Last lesson</span>
              )}
            </div>

            <Tabs defaultValue="notes" className="mt-8 rounded-2xl border border-ink/10 bg-card/60 p-4 sm:p-5">
              <TabsList>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="resources">Downloads ({resources[current.id]?.length ?? 0})</TabsTrigger>
              </TabsList>
              <TabsContent value="notes">
                {descriptions[current.id] ? (
                  <p className="max-w-2xl whitespace-pre-line leading-relaxed text-foreground/85">{descriptions[current.id]}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Your mentor has not added notes for this lesson.</p>
                )}
              </TabsContent>
              <TabsContent value="resources">
                <ResourceList resources={resources[current.id] ?? []} />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            Lessons for {courseTitle} are being added. Check back shortly.
          </p>
        )}
        </section>

        <aside aria-label="Course lesson navigation" className="order-2 min-w-0 lg:order-2">
          <div className="rounded-2xl border border-ink/10 bg-card p-4 shadow-[0_18px_44px_-34px_rgba(13,13,13,0.45)] lg:sticky lg:top-24 sm:p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Course progress</span>
            <span className="text-muted-foreground">
              {completedCount} of {flat.length}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <Progress value={percent(completedCount, flat.length)} aria-label={`${completedCount} of ${flat.length} lessons complete`} className="flex-1" />
            <span className="w-10 text-right text-xs font-semibold tabular-nums">{percent(completedCount, flat.length)}%</span>
          </div>
          {flat.length > 0 && completedCount === flat.length && (
            <p role="status" className="mt-3 flex items-center gap-2 text-sm font-semibold text-success">
              <Check className="size-4" /> All lessons complete
            </p>
          )}
          {current && index === flat.length - 1 && (
            <p role="status" className="mt-3 text-xs text-muted-foreground">You’re at the last available lesson.</p>
          )}
            <div className="mt-5 border-t border-ink/10 pt-4 lg:max-h-[60vh] lg:overflow-y-auto">
              <LessonList
                modules={modules.map((m) => ({ ...m, lessons: m.lessons.map((l) => ({ ...l, completed: done[l.id] ?? false })) }))}
                currentId={currentId}
                onSelect={select}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
