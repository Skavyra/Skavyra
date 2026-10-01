"use client";

import { PlayCircle } from "lucide-react";
import { useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

import { LessonMedia } from "./VideoFrame";

/** Free preview lessons open in a dialog on the public course page. */
export function PreviewLesson({ lessonId, title }: { lessonId: string; title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-gold-300 bg-gold-100/20 px-2.5 py-0.5 text-xs font-semibold text-gold-700 transition-[transform,border-color,background-color,box-shadow] duration-200 hover:border-gold-500 hover:bg-gold-100/60 hover:shadow-sm motion-safe:hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <PlayCircle className="size-3.5" /> Preview
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">Free preview lesson</DialogDescription>
          {open && <LessonMedia lessonId={lessonId} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
