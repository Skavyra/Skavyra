"use client";

import { Eye, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setCourseStatus } from "@/actions/courses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { CourseStatus } from "@/types";

export function PublishToggle({ courseId, slug, status }: { courseId: string; slug: string; status: CourseStatus }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const change = (next: CourseStatus, message: string) =>
    start(async () => {
      const result = await setCourseStatus(courseId, next);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(message);
      router.refresh();
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge tone={status === "published" ? "success" : status === "archived" ? "muted" : "neutral"}>
        {status === "published" ? "Published" : status === "archived" ? "Archived" : "Draft"}
      </Badge>
      <Button asChild variant="outline" size="sm">
        <Link href={`/courses/${slug}`} target="_blank">
          <Eye /> Preview
        </Link>
      </Button>
      {status === "published" ? (
        <Button variant="outline" size="sm" loading={pending} onClick={() => change("draft", "Moved back to draft")}>
          Unpublish
        </Button>
      ) : (
        <Button variant="gold" size="sm" loading={pending} onClick={() => change("published", "Course published")}>
          <Send /> Publish
        </Button>
      )}
    </div>
  );
}
