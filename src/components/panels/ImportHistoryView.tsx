import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { PanelProps } from "./types";

/** Every file that was imported, newest first, each opening the leads of that import. */
export async function ImportHistoryView({ base, roles }: PanelProps) {
  await requireRole(roles);
  const supabase = await createClient();
  const { data } = await supabase
    .from("lead_upload_batches")
    .select("id, file_name, created_at, total_rows, inserted_rows, duplicate_rows, skipped_rows")
    .order("created_at", { ascending: false })
    .limit(100);
  const batches = data ?? [];

  return (
    <>
      <Link href={`${base}/leads`} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Leads
      </Link>
      <PageHeader title="Import history" description="Every file you have imported. Open one to see its leads and who holds them." />
      {batches.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">No imports yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {batches.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{b.file_name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(b.created_at)} · {b.total_rows} rows · {b.inserted_rows} imported · {b.duplicate_rows} already leads ·{" "}
                  {b.skipped_rows} incomplete
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={`${base}/leads?batch=${b.id}`}>View leads</Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
