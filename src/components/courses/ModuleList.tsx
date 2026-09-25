"use client";

import { ChevronDown, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteLesson, deleteModule, reorder, saveModule } from "@/actions/courses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { LESSON_TYPE_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { LessonForm, type LessonRecord } from "./LessonForm";

export type ModuleRecord = { id: string; title: string; summary: string | null; lessons: LessonRecord[] };

/**
 * Modules and lessons with drag to reorder, using the browser's own drag and
 * drop so there is no extra dependency. Keyboard users get the arrow buttons.
 */
export function ModuleList({ courseId, modules }: { courseId: string; modules: ModuleRecord[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [openModules, setOpenModules] = useState<string[]>(modules.slice(0, 1).map((m) => m.id));
  const [moduleDialog, setModuleDialog] = useState<{ open: boolean; module: ModuleRecord | null }>({ open: false, module: null });
  const [lessonDialog, setLessonDialog] = useState<{ open: boolean; moduleId: string; lesson: LessonRecord | null }>({
    open: false,
    moduleId: "",
    lesson: null,
  });
  const [dragging, setDragging] = useState<{ moduleId: string; lessonId: string } | null>(null);

  function move(moduleId: string, lessonId: string, direction: -1 | 1) {
    const target = modules.find((m) => m.id === moduleId);
    if (!target) return;
    const ids = target.lessons.map((l) => l.id);
    const from = ids.indexOf(lessonId);
    const to = from + direction;
    if (to < 0 || to >= ids.length) return;
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    start(async () => {
      const result = await reorder(courseId, "lessons", ids, moduleId);
      if (!result.ok) toast.error(result.error);
      else router.refresh();
    });
  }

  function dropOn(moduleId: string, targetLessonId: string) {
    if (!dragging || dragging.moduleId !== moduleId || dragging.lessonId === targetLessonId) return;
    const target = modules.find((m) => m.id === moduleId);
    if (!target) return;
    const ids = target.lessons.map((l) => l.id);
    const from = ids.indexOf(dragging.lessonId);
    const to = ids.indexOf(targetLessonId);
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    setDragging(null);
    start(async () => {
      const result = await reorder(courseId, "lessons", ids, moduleId);
      if (!result.ok) toast.error(result.error);
      else router.refresh();
    });
  }

  function moveModule(moduleId: string, direction: -1 | 1) {
    const ids = modules.map((m) => m.id);
    const from = ids.indexOf(moduleId);
    const to = from + direction;
    if (to < 0 || to >= ids.length) return;
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    start(async () => {
      const result = await reorder(courseId, "course_modules", ids);
      if (!result.ok) toast.error(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {modules.length === 0 && (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No modules yet. Add the first one to start building the syllabus.
        </p>
      )}

      {modules.map((mod, mi) => {
        const expanded = openModules.includes(mod.id);
        return (
          <section key={mod.id} className="rounded-xl border bg-card">
            <div className="flex flex-wrap items-center gap-2 p-4">
              <button
                type="button"
                onClick={() => setOpenModules((o) => (expanded ? o.filter((id) => id !== mod.id) : [...o, mod.id]))}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
                aria-expanded={expanded}
              >
                <ChevronDown className={cn("size-4 shrink-0 transition-transform", !expanded && "-rotate-90")} />
                <span className="truncate font-display text-base font-bold">
                  <span className="mr-2 text-muted-foreground">Module {mi + 1}</span>
                  {mod.title}
                </span>
                <Badge tone="muted">{mod.lessons.length} lessons</Badge>
              </button>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" aria-label="Move module up" disabled={mi === 0 || pending} onClick={() => moveModule(mod.id, -1)}>
                  ↑
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Move module down"
                  disabled={mi === modules.length - 1 || pending}
                  onClick={() => moveModule(mod.id, 1)}
                >
                  ↓
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setModuleDialog({ open: true, module: mod })}>
                  <Pencil /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (!confirm(`Delete "${mod.title}" and its ${mod.lessons.length} lessons?`)) return;
                    start(async () => {
                      const result = await deleteModule(courseId, mod.id);
                      if (!result.ok) toast.error(result.error);
                      else {
                        toast.success("Module deleted");
                        router.refresh();
                      }
                    });
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>

            {expanded && (
              <div className="border-t p-4">
                {mod.summary && <p className="mb-3 text-sm text-muted-foreground">{mod.summary}</p>}
                <ul className="flex flex-col">
                  {mod.lessons.map((lesson, li) => (
                    <li
                      key={lesson.id}
                      draggable
                      onDragStart={() => setDragging({ moduleId: mod.id, lessonId: lesson.id })}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => dropOn(mod.id, lesson.id)}
                      className={cn(
                        "flex flex-wrap items-center gap-2 rounded-lg border-b px-2 py-2.5 last:border-0",
                        dragging?.lessonId === lesson.id && "opacity-50",
                      )}
                    >
                      <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{lesson.title}</span>
                      <Badge tone="muted">{LESSON_TYPE_LABEL[lesson.lesson_type]}</Badge>
                      {lesson.is_preview && <Badge tone="gold">Preview</Badge>}
                      {!lesson.is_published && <Badge tone="neutral">Hidden</Badge>}
                      {!!lesson.duration_minutes && <span className="text-xs text-muted-foreground">{lesson.duration_minutes}m</span>}
                      <span className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" aria-label="Move lesson up" disabled={li === 0 || pending} onClick={() => move(mod.id, lesson.id, -1)}>
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Move lesson down"
                          disabled={li === mod.lessons.length - 1 || pending}
                          onClick={() => move(mod.id, lesson.id, 1)}
                        >
                          ↓
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setLessonDialog({ open: true, moduleId: mod.id, lesson })}>
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (!confirm(`Delete "${lesson.title}"?`)) return;
                            start(async () => {
                              const result = await deleteLesson(courseId, lesson.id);
                              if (!result.ok) toast.error(result.error);
                              else {
                                toast.success("Lesson deleted");
                                router.refresh();
                              }
                            });
                          }}
                        >
                          <Trash2 />
                        </Button>
                      </span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setLessonDialog({ open: true, moduleId: mod.id, lesson: null })}>
                  <Plus /> Add lesson
                </Button>
              </div>
            )}
          </section>
        );
      })}

      <Button variant="outline" className="self-start" onClick={() => setModuleDialog({ open: true, module: null })}>
        <Plus /> Add module
      </Button>

      <Dialog open={moduleDialog.open} onOpenChange={(open) => setModuleDialog((d) => ({ ...d, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{moduleDialog.module ? "Edit module" : "Add module"}</DialogTitle>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            action={(formData) =>
              start(async () => {
                const result = await saveModule(courseId, moduleDialog.module?.id ?? null, formData);
                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }
                toast.success(moduleDialog.module ? "Module saved" : "Module added");
                setModuleDialog({ open: false, module: null });
                router.refresh();
              })
            }
          >
            <Field label="Title" htmlFor="module-title">
              <Input id="module-title" name="title" defaultValue={moduleDialog.module?.title} required autoFocus />
            </Field>
            <Field label="Summary" htmlFor="module-summary">
              <Textarea id="module-summary" name="summary" rows={3} defaultValue={moduleDialog.module?.summary ?? ""} />
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModuleDialog({ open: false, module: null })}>
                Cancel
              </Button>
              <Button type="submit" loading={pending}>
                Save module
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {lessonDialog.open && (
        <LessonForm
          key={lessonDialog.lesson?.id ?? `new-${lessonDialog.moduleId}`}
          courseId={courseId}
          moduleId={lessonDialog.moduleId}
          lesson={lessonDialog.lesson}
          open={lessonDialog.open}
          onOpenChange={(open) => setLessonDialog((d) => ({ ...d, open }))}
        />
      )}
    </div>
  );
}
