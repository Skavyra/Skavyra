"use client";

import { Download, FileArchive, FileText } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export type Resource = { id: string; title: string; file_size: number | null };

function size(bytes: number | null) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Downloads use a short-lived signed URL fetched when the button is pressed. */
export function ResourceList({ resources }: { resources: Resource[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  if (resources.length === 0) return <p className="text-sm text-muted-foreground">No downloads for this lesson.</p>;

  async function download(id: string) {
    setBusy(id);
    try {
      const res = await fetch(`/api/lesson-url?resourceId=${id}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "The file could not be prepared.");
      window.open(json.url, "_blank", "noopener");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The file could not be prepared.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <ul className="flex flex-col gap-2">
      {resources.map((r) => {
        const isZip = /\.zip$/i.test(r.title);
        const Icon = isZip ? FileArchive : FileText;
        return (
          <li key={r.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <Icon className="size-4 shrink-0 text-gold-700" />
            <span className="min-w-0 flex-1 truncate text-sm">{r.title}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{size(r.file_size)}</span>
            <Button variant="outline" size="sm" loading={busy === r.id} onClick={() => download(r.id)}>
              <Download /> Download
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
