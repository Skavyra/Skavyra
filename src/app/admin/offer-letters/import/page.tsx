import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { BulkUpload } from "@/components/offer-letters/BulkUpload";
import { requireRole } from "@/lib/auth/require-role";

export const metadata: Metadata = { title: "Bulk upload offer letters" };

export default async function ImportLettersPage() {
  await requireRole("admin");
  return (
    <>
      <Link href="/admin/offer-letters" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Offer letters
      </Link>
      <PageHeader title="Bulk upload" description="Every row becomes a draft letter. Generate the PDFs afterwards." />
      <BulkUpload />
    </>
  );
}
