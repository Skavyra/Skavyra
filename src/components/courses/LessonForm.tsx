"use client";

import { Paperclip, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { addLessonResource, deleteLessonResource, saveLesson } from "@/actions/courses";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { BUCKETS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { toDateTimeInput } from "@/lib/utils";
import type { LessonType, MediaProvider } from "@/types";

export type LessonRecord = {
  id: string;
  title: string;
  description: string | null;
  lesson_type: LessonType;
  provider: MediaProvider;
  content_url: string | null;
  storage_path: string | null;
  duration_minutes: number;
  scheduled_at: string | null;
  is_preview: boolean;
  is_published: boolean;
  resources: { id: string; title: string; storage_path: string }[];
};

export function LessonForm({
  courseId,
  moduleId,
  lesson,
  open,
  onOpenChange,
}: {
  courseId: string;
  moduleId: string;
  lesson: LessonRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<LessonType>(lesson?.lesson_type ?? "video");
  const [provider, setProvider] = useState<MediaProvider>(lesson?.provider ?? "drive");
  const [storagePath, setStoragePath] = useState(lesson?.storage_path ?? "");
  const [preview, setPreview] = useState(lesson?.is_preview ?? false);
  const [published, setPublished] = useState(lesson?.is_published ?? true);
  const [uploading, setUploading] = useState(false);
  const videoInput = useRef<HTMLInputElement>(null);
  const resourceInput = useRef<HTMLInputElement>(null);

  const usesUpload = provider === "supabase";

  async function uploadFile(file: File, bucket: string, prefix: string) {
    const supabase = createClient();
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${prefix}/${Date.now()}-${safe}`;
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type || undefined });
    if (upErr) throw new Error(upErr.message);
    return path;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{lesson ? "Edit lesson" : "Add lesson"}</DialogTitle>
          <DialogDescription>
            Videos can be a Drive or YouTube link, or a file uploaded here. Students only ever get a short-lived link.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          action={(formData) => {
            setError(null);
            formData.set("lesson_type", type);
            formData.set("provider", provider);
            formData.set("storage_path", storagePath);
            formData.set("is_preview", preview ? "on" : "");
            formData.set("is_published", published ? "on" : "");
            start(async () => {
              const result = await saveLesson(courseId, moduleId, lesson?.id ?? null, formData);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              toast.success(lesson ? "Lesson saved" : "Lesson added");
              onOpenChange(false);
              router.refresh();
            });
          }}
        >
          <Field label="Title" htmlFor="lesson-title">
            <Input id="lesson-title" name="title" defaultValue={lesson?.title} required autoFocus />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type" htmlFor="lesson-type">
              <NativeSelect id="lesson-type" value={type} onChange={(e) => setType(e.target.value as LessonType)}>
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="live_class">Live class</option>
                <option value="link">Link</option>
              </NativeSelect>
            </Field>
            <Field label="Where it lives" htmlFor="lesson-provider">
              <NativeSelect id="lesson-provider" value={provider} onChange={(e) => setProvider(e.target.value as MediaProvider)}>
                <option value="drive">Google Drive link</option>
                <option value="youtube">YouTube link</option>
                <option value="supabase">Uploaded here</option>
                <option value="bunny">Bunny</option>
                <option value="zoom">Zoom</option>
                <option value="other">Other link</option>
              </NativeSelect>
            </Field>
          </div>

          {usesUpload ? (
            <Field label="File" htmlFor="lesson-file" hint={storagePath ? `Stored at ${storagePath}` : "Up to a few hundred MB."}>
              <div className="flex items-center gap-2">
                <input
                  ref={videoInput}
                  id="lesson-file"
                  type="file"
                  className="sr-only"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    setUploading(true);
                    try {
                      const bucket = type === "video" ? BUCKETS.courseVideos : BUCKETS.lessonResources;
                      setStoragePath(await uploadFile(file, bucket, courseId));
                      toast.success("File uploaded");
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Upload failed");
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
                <Button type="button" variant="outline" size="sm" loading={uploading} onClick={() => videoInput.current?.click()}>
                  <Upload /> {storagePath ? "Replace file" : "Upload file"}
                </Button>
                {storagePath && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setStoragePath("")}>
                    Clear
                  </Button>
                )}
              </div>
            </Field>
          ) : (
            <Field
              label={type === "live_class" ? "Joining link" : "Link"}
              htmlFor="content_url"
              hint={type === "live_class" ? "Can be added later." : "Paste the share link."}
            >
              <Input id="content_url" name="content_url" defaultValue={lesson?.content_url ?? ""} />
            </Field>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Length in minutes" htmlFor="duration_minutes">
              <Input id="duration_minutes" name="duration_minutes" inputMode="numeric" defaultValue={lesson?.duration_minutes ?? 0} />
            </Field>
            {type === "live_class" && (
              <Field label="Scheduled for" htmlFor="scheduled_at">
                <Input id="scheduled_at" name="scheduled_at" type="datetime-local" defaultValue={toDateTimeInput(lesson?.scheduled_at)} />
              </Field>
            )}
          </div>

          <Field label="Notes for students" htmlFor="lesson-description">
            <Textarea id="lesson-description" name="description" rows={3} defaultValue={lesson?.description ?? ""} />
          </Field>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 text-sm">
              <Switch checked={preview} onCheckedChange={setPreview} />
              Free preview
            </label>
            <label className="flex items-center gap-3 text-sm">
              <Switch checked={published} onCheckedChange={setPublished} />
              Visible to students
            </label>
          </div>

          {lesson && (
            <div className="rounded-xl border p-4">
              <p className="text-sm font-semibold">Downloads</p>
              <ul className="mt-2 flex flex-col gap-2">
                {lesson.resources.length === 0 && <li className="text-xs text-muted-foreground">None yet.</li>}
                {lesson.resources.map((r) => (
                  <li key={r.id} className="flex items-center gap-2 text-sm">
                    <Paperclip className="size-3.5 text-gold-700" />
                    <span className="min-w-0 flex-1 truncate">{r.title}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        const result = await deleteLessonResource(courseId, r.id, r.storage_path);
                        if (!result.ok) toast.error(result.error);
                        else router.refresh();
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>
              <input
                ref={resourceInput}
                type="file"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  setUploading(true);
                  try {
                    const path = await uploadFile(file, BUCKETS.lessonResources, `${courseId}/resources`);
                    const result = await addLessonResource(courseId, lesson.id, {
                      title: file.name,
                      storage_path: path,
                      file_size: file.size,
                    });
                    if (!result.ok) toast.error(result.error);
                    else {
                      toast.success("Resource added");
                      router.refresh();
                    }
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Upload failed");
                  } finally {
                    setUploading(false);
                  }
                }}
              />
              <Button type="button" variant="outline" size="sm" className="mt-3" loading={uploading} onClick={() => resourceInput.current?.click()}>
                <Upload /> Add a download
              </Button>
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={pending}>
              {lesson ? "Save lesson" : "Add lesson"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
