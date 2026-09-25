"use client";

import { Check, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

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
}: {
  courseTitle: string;
  modules: PlayerModule[];
  resources: Record<string, Resource[]>;
  descriptions: Record<string, string | null>;
  enrollmentId: string;
  accessActive: boolean;
  balance: number;
}) {
  const flat = useMemo(() => modules.flatMap((m) => m.lessons), [modules]);
  const firstOpen = flat.find((l) => !l.completed && !l.locked) ?? flat.find((l) => !l.locked) ?? flat[0] ?? null;
  const [currentId, setCurrentId] = useState<string | null>(firstOpen?.id ?? null);
  const [done, setDone] = useState<Record<string, boolean>>(Object.fromEntries(flat.map((l) => [l.id, l.completed])));
  const [pending, start] = useTransition();

  const index = flat.findIndex((l) => l.id === currentId);
  const current = index >= 0 ? flat[index] : null;
  const completedCount = Object.values(done).filter(Boolean).length;

  const select = (lesson: PlayerLesson) => {
    setCurrentId(lesson.id);
    if (accessActive) void touchLesson(lesson.id, enrollmentId);
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
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="order-2 min-w-0 lg:order-1">
        {current ? (
          <>
            <LessonMedia lessonId={current.id} />
            <h2 className="mt-5 text-fluid-xl">{current.title}</h2>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                disabled={index <= 0}
                onClick={() => index > 0 && select(flat[index - 1])}
              >
                <ChevronLeft /> Previous
              </Button>
              <Button
                variant={done[current.id] ? "outline" : "default"}
                loading={pending}
                onClick={() =>
                  start(async () => {
                    const next = !done[current.id];
                    const result = await markLessonComplete(current.id, enrollmentId, next);
                    if (!result.ok) {
                      toast.error(result.error);
                      return;
                    }
                    setDone((d) => ({ ...d, [current.id]: next }));
                    if (next) {
                      toast.success("Marked complete");
                      if (index < flat.length - 1) select(flat[index + 1]);
                    }
                  })
                }
              >
                <Check /> {done[current.id] ? "Completed" : "Mark complete"}
              </Button>
              <Button
                variant="outline"
                disabled={index >= flat.length - 1}
                onClick={() => index < flat.length - 1 && select(flat[index + 1])}
              >
                Next <ChevronRight />
              </Button>
            </div>

            <Tabs defaultValue="notes" className="mt-8">
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
      </div>

      <aside className="order-1 lg:order-2">
        <div className="rounded-xl border bg-card p-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Your progress</span>
            <span className="text-muted-foreground">
              {completedCount} of {flat.length}
            </span>
          </div>
          <Progress value={percent(completedCount, flat.length)} className="mt-2" />
          <div className="mt-5 max-h-[60vh] overflow-y-auto">
            <LessonList
              modules={modules.map((m) => ({ ...m, lessons: m.lessons.map((l) => ({ ...l, completed: done[l.id] ?? false })) }))}
              currentId={currentId}
              onSelect={select}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
