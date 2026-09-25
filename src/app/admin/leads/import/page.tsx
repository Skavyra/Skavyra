import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { ImportWizard } from "@/components/leads/import/ImportWizard";
import { requireRole } from "@/lib/auth/require-role";
import { fetchCounsellors } from "@/lib/leads-query";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Import leads" };

export default async function ImportLeadsPage() {
  await requireRole("admin");
  const supabase = await createClient();
  const counsellors = await fetchCounsellors(supabase);

  return (
    <>
      <Link href="/admin/leads" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Leads
      </Link>
      <PageHeader title="Import leads" description="Upload a spreadsheet, check the columns, then import." />
      <ImportWizard counsellors={counsellors} />
    </>
  );
}
