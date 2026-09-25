"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { currentUserWithRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { firstError, formToObject } from "@/lib/validations/common";
import { courseSchema, lessonSchema, moduleSchema } from "@/lib/validations/course";
import type { ActionResult, CourseStatus } from "@/types";

async function adminOnly() {
  const user = await currentUserWithRole("admin");
  return user;
}

function revalidateCourse(courseId?: string) {
  revalidatePath("/admin/courses");
  if (courseId) revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/courses");
  revalidatePath("/");
}

export async function createCourse(title: string): Promise<ActionResult<{ id: string }>> {
  const user = await adminOnly();
  if (!user) return { ok: false, error: "Only admins can create courses." };
  const clean = title.trim();
  if (!clean) return { ok: false, error: "Enter a course title." };

  const supabase = await createClient();
  const base = slugify(clean) || "course";
  // find a free slug: base, base-2, base-3...
  const { data: taken } = await supabase.from("courses").select("slug").like("slug", `${base}%`);
  const used = new Set((taken ?? []).map((r) => r.slug));
  let slug = base;
  for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;

  const { data, error } = await supabase
    .from("courses")
    .insert({ title: clean, slug, price: 0, status: "draft", created_by: user.id })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidateCourse();
  return { ok: true, data: { id: data.id } };
}

export async function updateCourse(courseId: string, formData: FormData): Promise<ActionResult> {
  if (!(await adminOnly())) return { ok: false, error: "Only admins can edit courses." };
  const raw = formToObject(formData);
  const parsed = courseSchema.safeParse({ ...raw, allows_partial: raw.allows_partial === "on" });
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("courses").update(parsed.data).eq("id", courseId);
  if (error) return { ok: false, error: error.code === "23505" ? "Another course already uses this URL slug." : error.message };
  revalidateCourse(courseId);
  return { ok: true, data: undefined };
}

/** Cover and mentor photo are uploaded from the browser to course-covers; this saves the public URL. */
export async function setCourseImage(
  courseId: string,
  field: "cover_image_url" | "mentor_avatar_url",
  url: string | null,
): Promise<ActionResult> {
  if (!(await adminOnly())) return { ok: false, error: "Only admins can edit courses." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("courses")
    .update(field === "cover_image_url" ? { cover_image_url: url } : { mentor_avatar_url: url })
    .eq("id", courseId);
  if (error) return { ok: false, error: error.message };
  revalidateCourse(courseId);
  return { ok: true, data: undefined };
}

/** Publishing sets published_at and makes the course visible to visitors. */
export async function setCourseStatus(courseId: string, status: CourseStatus): Promise<ActionResult> {
  if (!(await adminOnly())) return { ok: false, error: "Only admins can publish courses." };
  const supabase = await createClient();

  if (status === "published") {
    const { data: course } = await supabase.from("courses").select("price, published_at").eq("id", courseId).single();
    if (!course) return { ok: false, error: "Course not found." };
    const { count } = await supabase
      .from("course_modules")
      .select("id", { count: "exact", head: true })
      .eq("course_id", courseId);
    if (!count) return { ok: false, error: "Add at least one module with a lesson before publishing." };
    const { error } = await supabase
      .from("courses")
      .update({ status, published_at: course.published_at ?? new Date().toISOString() })
      .eq("id", courseId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("courses").update({ status }).eq("id", courseId);
    if (error) return { ok: false, error: error.message };
  }
  revalidateCourse(courseId);
  return { ok: true, data: undefined };
}

// ---------- modules ----------

export async function saveModule(courseId: string, moduleId: string | null, formData: FormData): Promise<ActionResult> {
  if (!(await adminOnly())) return { ok: false, error: "Only admins can edit courses." };
  const parsed = moduleSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const supabase = await createClient();

  if (moduleId) {
    const { error } = await supabase.from("course_modules").update(parsed.data).eq("id", moduleId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { count } = await supabase
      .from("course_modules")
      .select("id", { count: "exact", head: true })
      .eq("course_id", courseId);
    const { error } = await supabase
      .from("course_modules")
      .insert({ ...parsed.data, course_id: courseId, sort_order: count ?? 0 });
    if (error) return { ok: false, error: error.message };
  }
  revalidateCourse(courseId);
  return { ok: true, data: undefined };
}

export async function deleteModule(courseId: string, moduleId: string): Promise<ActionResult> {
  if (!(await adminOnly())) return { ok: false, error: "Only admins can edit courses." };
  const supabase = await createClient();
  const { error } = await supabase.from("course_modules").delete().eq("id", moduleId);
  if (error) return { ok: false, error: error.message };
  revalidateCourse(courseId);
  return { ok: true, data: undefined };
}

/** Saves a new order after drag and drop: ids in their new order. */
export async function reorder(
  courseId: string,
  table: "course_modules" | "lessons",
  orderedIds: string[],
  moduleId?: string,
): Promise<ActionResult> {
  if (!(await adminOnly())) return { ok: false, error: "Only admins can edit courses." };
  const ids = z.array(z.string().uuid()).safeParse(orderedIds);
  if (!ids.success) return { ok: false, error: "Invalid order." };
  const supabase = await createClient();
  for (const [index, id] of ids.data.entries()) {
    const update =
      table === "lessons" && moduleId
        ? supabase.from("lessons").update({ sort_order: index, module_id: moduleId }).eq("id", id)
        : supabase.from(table).update({ sort_order: index }).eq("id", id);
    const { error } = await update;
    if (error) return { ok: false, error: error.message };
  }
  revalidateCourse(courseId);
  return { ok: true, data: undefined };
}

// ---------- lessons ----------

export async function saveLesson(
  courseId: string,
  moduleId: string,
  lessonId: string | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  if (!(await adminOnly())) return { ok: false, error: "Only admins can edit courses." };
  const raw = formToObject(formData);
  const parsed = lessonSchema.safeParse({
    ...raw,
    is_preview: raw.is_preview === "on",
    is_published: raw.is_published === "on",
  });
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  const values = {
    ...parsed.data,
    scheduled_at: parsed.data.scheduled_at ? new Date(parsed.data.scheduled_at).toISOString() : null,
  };

  const supabase = await createClient();
  if (lessonId) {
    const { error } = await supabase.from("lessons").update(values).eq("id", lessonId);
    if (error) return { ok: false, error: error.message };
    revalidateCourse(courseId);
    return { ok: true, data: { id: lessonId } };
  }
  const { count } = await supabase.from("lessons").select("id", { count: "exact", head: true }).eq("module_id", moduleId);
  const { data, error } = await supabase
    .from("lessons")
    .insert({ ...values, module_id: moduleId, sort_order: count ?? 0 })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidateCourse(courseId);
  return { ok: true, data: { id: data.id } };
}

export async function deleteLesson(courseId: string, lessonId: string): Promise<ActionResult> {
  if (!(await adminOnly())) return { ok: false, error: "Only admins can edit courses." };
  const supabase = await createClient();
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
  if (error) return { ok: false, error: error.message };
  revalidateCourse(courseId);
  return { ok: true, data: undefined };
}

/** Resource file is uploaded from the browser to lesson-resources; this records it. */
export async function addLessonResource(
  courseId: string,
  lessonId: string,
  resource: { title: string; storage_path: string; file_size: number },
): Promise<ActionResult> {
  if (!(await adminOnly())) return { ok: false, error: "Only admins can edit courses." };
  if (!resource.title.trim()) return { ok: false, error: "Give the resource a title." };
  const supabase = await createClient();
  const { error } = await supabase.from("lesson_resources").insert({ lesson_id: lessonId, ...resource });
  if (error) return { ok: false, error: error.message };
  revalidateCourse(courseId);
  return { ok: true, data: undefined };
}

export async function deleteLessonResource(courseId: string, resourceId: string, storagePath: string): Promise<ActionResult> {
  if (!(await adminOnly())) return { ok: false, error: "Only admins can edit courses." };
  const supabase = await createClient();
  await supabase.storage.from("lesson-resources").remove([storagePath]);
  const { error } = await supabase.from("lesson_resources").delete().eq("id", resourceId);
  if (error) return { ok: false, error: error.message };
  revalidateCourse(courseId);
  return { ok: true, data: undefined };
}
