"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteCourse } from "@/actions/courses";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

export function DeleteCourseDialog({ courseId, title }: { courseId: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Dialog open={open} onOpenChange={(value) => { if (!pending) setOpen(value); }}>
      <DialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 /> Delete</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {title}?</DialogTitle>
          <DialogDescription>This permanently deletes the course, modules, and lessons. Courses with enrollments cannot be deleted. Uploaded files remain in storage.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" disabled={pending} onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" loading={pending} onClick={() => start(async () => {
            const result = await deleteCourse(courseId);
            if (!result.ok) { toast.error(result.error); return; }
            toast.success("Course deleted");
            setOpen(false);
            router.push("/admin/courses");
            router.refresh();
          })}>Delete course</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
