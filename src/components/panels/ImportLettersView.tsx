import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { BulkUpload } from "@/components/offer-letters/BulkUpload";
import { requireRole } from "@/lib/auth/require-role";
import type { PanelProps } from "./types";

export async function ImportLettersView({ base, roles }: PanelProps) {
  await requireRole(roles);
  return (
    <>
      <Link href={`${base}/offer-letters`} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Offer letters
      </Link>
      <PageHeader title="Bulk upload" description="Every row becomes a draft letter. Generate the PDFs afterwards." />
      <BulkUpload />
    </>
  );
}
