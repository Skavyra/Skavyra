import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { AccessBadge } from "@/components/dashboard/StatusBadge";
import { CoursePlayer } from "@/components/player/CoursePlayer";
import type { PlayerModule } from "@/components/player/LessonList";
import type { Resource } from "@/components/player/ResourceList";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export default async function PlayerPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const user = await requireRole("student");
  const supabase = await createClient();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, access_status, balance_amount, course:courses(id, title)")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();
  if (!enrollment) notFound();

  const active = enrollment.access_status === "active" || enrollment.access_status === "completed";

  // lesson rows are readable only where RLS allows: preview lessons, or all of
  // them while access is active
  const { data: moduleRows } = await supabase
    .from("course_modules")
    .select("id, title, sort_order, lessons(id, title, description, lesson_type, duration_minutes, is_preview, is_published, sort_order)")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });

  const { data: progress } = await supabase.from("progress").select("lesson_id, completed").eq("user_id", user.id);
  const done = new Set((progress ?? []).filter((p) => p.completed).map((p) => p.lesson_id));

  const modules: PlayerModule[] = (moduleRows ?? []).map((m) => ({
    id: m.id,
    title: m.title,
    lessons: (m.lessons ?? [])
      .filter((l) => l.is_published)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((l) => ({
        id: l.id,
        title: l.title,
        lesson_type: l.lesson_type,
        duration_minutes: l.duration_minutes,
        is_preview: l.is_preview,
        completed: done.has(l.id),
        locked: !active && !l.is_preview,
      })),
  }));

  const lessonIds = modules.flatMap((m) => m.lessons.map((l) => l.id));
  const { data: resourceRows } = lessonIds.length
    ? await supabase.from("lesson_resources").select("id, lesson_id, title, file_size").in("lesson_id", lessonIds)
    : { data: [] };
  const resources: Record<string, Resource[]> = {};
  for (const r of resourceRows ?? []) {
    (resources[r.lesson_id] ??= []).push({ id: r.id, title: r.title, file_size: r.file_size });
  }

  const descriptions: Record<string, string | null> = {};
  for (const m of moduleRows ?? []) for (const l of m.lessons ?? []) descriptions[l.id] = l.description;

  return (
    <>
      <Link href="/dashboard/courses" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> My courses
      </Link>
      <PageHeader title={enrollment.course?.title ?? "Course"} actions={<AccessBadge status={enrollment.access_status} />} />
      <CoursePlayer
        courseTitle={enrollment.course?.title ?? ""}
        modules={modules}
        resources={resources}
        descriptions={descriptions}
        enrollmentId={enrollment.id}
        accessActive={active}
        balance={Number(enrollment.balance_amount ?? 0)}
      />
    </>
  );
}
