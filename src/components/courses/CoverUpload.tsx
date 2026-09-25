"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { setCourseImage } from "@/actions/courses";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { BUCKETS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

/** Images go to the public course-covers bucket, which admins may write to. */
export function CoverUpload({
  courseId,
  field,
  label,
  url,
  aspect = "video",
}: {
  courseId: string;
  field: "cover_image_url" | "mentor_avatar_url";
  label: string;
  url: string | null;
  aspect?: "video" | "square";
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);

  async function upload(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Choose an image under 5 MB.");
      return;
    }
    setPending(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${courseId}/${field === "cover_image_url" ? "cover" : "mentor"}.${ext}`;
    const { error } = await supabase.storage.from(BUCKETS.courseCovers).upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      toast.error(error.message);
      setPending(false);
      return;
    }
    const { data } = supabase.storage.from(BUCKETS.courseCovers).getPublicUrl(path);
    const result = await setCourseImage(courseId, field, `${data.publicUrl}?v=${Date.now()}`);
    if (!result.ok) toast.error(result.error);
    else {
      toast.success(`${label} updated`);
      router.refresh();
    }
    setPending(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold">{label}</p>
      <div
        className={`relative overflow-hidden rounded-xl border bg-muted ${aspect === "video" ? "aspect-[16/9]" : "aspect-square max-w-[10rem]"}`}
      >
        {url ? (
          <Image src={url} alt="" fill sizes="360px" className="object-cover" />
        ) : (
          <span className="grid size-full place-items-center text-xs text-muted-foreground">No image yet</span>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" loading={pending} onClick={() => input.current?.click()}>
          <ImagePlus /> {url ? "Replace" : "Upload"}
        </Button>
        {url && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={async () => {
              const result = await setCourseImage(courseId, field, null);
              if (!result.ok) toast.error(result.error);
              else router.refresh();
            }}
          >
            <Trash2 /> Remove
          </Button>
        )}
      </div>
    </div>
  );
}
