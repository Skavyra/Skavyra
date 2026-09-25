import { NextResponse, type NextRequest } from "next/server";

import { BUCKETS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

const SIGNED_SECONDS = 60 * 60 * 2;

function driveEmbed(url: string) {
  const id = url.match(/\/file\/d\/([^/]+)/)?.[1] ?? new URL(url).searchParams.get("id");
  return id ? `https://drive.google.com/file/d/${id}/preview` : url;
}

function youtubeEmbed(url: string) {
  try {
    const u = new URL(url);
    const id = u.hostname.includes("youtu.be") ? u.pathname.slice(1) : u.searchParams.get("v") ?? u.pathname.split("/").pop();
    return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` : url;
  } catch {
    return url;
  }
}

/**
 * Returns a playable URL for one lesson or resource.
 * Access is decided by RLS end to end: the lesson row is only readable when
 * it is a preview, or the viewer has an active enrolment, or is staff, and
 * the matching storage policy (storage_student_course_content /
 * storage_admin_course_content) gates the file the same way. Signing runs on
 * the caller's own session, so there is no service role involved.
 */
export async function GET(request: NextRequest) {
  const lessonId = request.nextUrl.searchParams.get("lessonId");
  const resourceId = request.nextUrl.searchParams.get("resourceId");
  const supabase = await createClient();

  if (resourceId) {
    const { data: resource } = await supabase.from("lesson_resources").select("storage_path, title").eq("id", resourceId).maybeSingle();
    if (!resource) return NextResponse.json({ error: "This resource is locked for your account." }, { status: 403 });
    const { data, error } = await supabase.storage
      .from(BUCKETS.lessonResources)
      .createSignedUrl(resource.storage_path, SIGNED_SECONDS, { download: resource.title });
    if (error || !data) return NextResponse.json({ error: "The file could not be found." }, { status: 404 });
    return NextResponse.json({ url: data.signedUrl });
  }

  if (!lessonId) return NextResponse.json({ error: "lessonId is required." }, { status: 400 });

  const { data: lesson } = await supabase
    .from("lessons")
    .select("lesson_type, provider, content_url, storage_path, scheduled_at")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson) {
    return NextResponse.json({ error: "This lesson unlocks once your enrolment is active." }, { status: 403 });
  }

  if (lesson.lesson_type === "live_class") {
    return NextResponse.json({ kind: "live", url: lesson.content_url, scheduled_at: lesson.scheduled_at });
  }

  if (lesson.storage_path) {
    const bucket = lesson.lesson_type === "video" ? BUCKETS.courseVideos : BUCKETS.lessonResources;
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(lesson.storage_path, SIGNED_SECONDS);
    if (error || !data) return NextResponse.json({ error: "The lesson file could not be found." }, { status: 404 });
    return NextResponse.json({ kind: lesson.lesson_type === "video" ? "video" : "document", url: data.signedUrl });
  }

  const url = lesson.content_url ?? "";
  if (!url) return NextResponse.json({ error: "This lesson has no content yet." }, { status: 404 });

  switch (lesson.provider) {
    case "drive":
      return NextResponse.json({ kind: "iframe", url: driveEmbed(url) });
    case "youtube":
      return NextResponse.json({ kind: "iframe", url: youtubeEmbed(url) });
    case "bunny":
      return NextResponse.json({ kind: "iframe", url });
    case "zoom":
      return NextResponse.json({ kind: "link", url, label: "Open in Zoom" });
    default:
      return NextResponse.json(
        lesson.lesson_type === "video" ? { kind: "iframe", url } : { kind: "link", url, label: "Open lesson" },
      );
  }
}
