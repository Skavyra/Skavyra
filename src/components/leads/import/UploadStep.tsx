"use client";

import { FileSpreadsheet, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { parseSheet, type ParsedSheet } from "@/lib/excel/parse";
import { cn } from "@/lib/utils";

/** Step 1: the file is read in the browser; nothing is uploaded anywhere. */
export function UploadStep({ onParsed }: { onParsed: (sheet: ParsedSheet) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handle(file: File) {
    setError(null);
    setBusy(true);
    try {
      onParsed(await parseSheet(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "That file could not be read.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void handle(file);
        }}
        className={cn(
          "flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-12 text-center transition-colors",
          dragging ? "border-gold-300 bg-gold-100/20" : "bg-card",
        )}
      >
        <span className="grid size-12 place-items-center rounded-xl bg-muted">
          <FileSpreadsheet className="size-5 text-gold-700" />
        </span>
        <p className="font-display text-lg font-bold">Drop your spreadsheet here</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          An .xlsx or .csv file with one lead per row. Name and phone are required; everything else is optional.
        </p>
        <input
          ref={input}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handle(file);
            e.target.value = "";
          }}
        />
        <Button type="button" loading={busy} onClick={() => input.current?.click()}>
          <Upload /> Choose a file
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
