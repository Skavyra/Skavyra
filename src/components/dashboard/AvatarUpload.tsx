"use client";

import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { BUCKETS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { initials } from "@/lib/utils";

/**
 * Photos go in the public brand bucket, which only admins may write to, so for
 * students this falls back to a clear message rather than a silent failure.
 */
export function AvatarUpload({ userId, name, avatarUrl }: { userId: string; name: string; avatarUrl: string | null }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState(avatarUrl);

  async function upload(file: File) {
    if (file.size > 3 * 1024 * 1024) return toast.error("Choose a photo under 3 MB.");
    setPending(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `avatars/${userId}.${ext}`;
    const { error } = await supabase.storage.from(BUCKETS.brand).upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      toast.error("Photo uploads are switched off for student accounts. Ask Skavyra to update it for you.");
      setPending(false);
      return;
    }
    const { data } = supabase.storage.from(BUCKETS.brand).getPublicUrl(path);
    const url = `${data.publicUrl}?v=${Date.now()}`;
    const { error: saveError } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
    if (saveError) toast.error(saveError.message);
    else {
      setPreview(url);
      toast.success("Photo updated");
      router.refresh();
    }
    setPending(false);
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-16">
        {preview && <AvatarImage src={preview} alt="" />}
        <AvatarFallback className="text-lg">{initials(name)}</AvatarFallback>
      </Avatar>
      <div>
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
        <Button type="button" variant="outline" size="sm" loading={pending} onClick={() => input.current?.click()}>
          <Camera /> Change photo
        </Button>
        <p className="mt-1.5 text-xs text-muted-foreground">JPG, PNG or WebP, up to 3 MB.</p>
      </div>
    </div>
  );
}
