import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CourseForm } from "@/components/courses/CourseForm";
import { CoverUpload } from "@/components/courses/CoverUpload";
import { ModuleList, type ModuleRecord } from "@/components/courses/ModuleList";
import { PublishToggle } from "@/components/courses/PublishToggle";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export default async function CourseBuilderPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  await requireRole("admin");
  const supabase = await createClient();

  const { data: course } = await supabase.from("courses").select("*").eq("id", courseId).maybeSingle();
  if (!course) notFound();

  const { data: moduleRows } = await supabase
    .from("course_modules")
    .select("id, title, summary, sort_order, lessons(*)")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });

  const lessonIds = (moduleRows ?? []).flatMap((m) => (m.lessons ?? []).map((l) => l.id));
  const { data: resources } = lessonIds.length
    ? await supabase.from("lesson_resources").select("id, lesson_id, title, storage_path").in("lesson_id", lessonIds)
    : { data: [] };

  const modules: ModuleRecord[] = (moduleRows ?? []).map((m) => ({
    id: m.id,
    title: m.title,
    summary: m.summary,
    lessons: (m.lessons ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        lesson_type: l.lesson_type,
        provider: l.provider,
        content_url: l.content_url,
        storage_path: l.storage_path,
        duration_minutes: l.duration_minutes,
        scheduled_at: l.scheduled_at,
        is_preview: l.is_preview,
        is_published: l.is_published,
        resources: (resources ?? [])
          .filter((r) => r.lesson_id === l.id)
          .map((r) => ({ id: r.id, title: r.title, storage_path: r.storage_path })),
      })),
  }));

  const lessonCount = modules.reduce((s, m) => s + m.lessons.length, 0);

  return (
    <>
      <Link href="/admin/courses" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Courses
      </Link>
      <PageHeader
        title={course.title}
        description={`${modules.length} modules, ${lessonCount} lessons.`}
        actions={<PublishToggle courseId={course.id} slug={course.slug} status={course.status} />}
      />

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
        </TabsList>
        <TabsContent value="content">
          <ModuleList courseId={course.id} modules={modules} />
        </TabsContent>
        <TabsContent value="details">
          <div className="max-w-3xl">
            <CourseForm course={course} />
          </div>
        </TabsContent>
        <TabsContent value="images">
          <div className="grid max-w-3xl gap-8 sm:grid-cols-2">
            <CoverUpload courseId={course.id} field="cover_image_url" label="Course cover" url={course.cover_image_url} />
            <CoverUpload courseId={course.id} field="mentor_avatar_url" label="Mentor photo" url={course.mentor_avatar_url} aspect="square" />
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
