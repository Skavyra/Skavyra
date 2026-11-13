import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { ImportWizard } from "@/components/leads/import/ImportWizard";
import { requireRole } from "@/lib/auth/require-role";
import { fetchCounsellors } from "@/lib/leads-query";
import { createClient } from "@/lib/supabase/server";
import type { PanelProps } from "./types";

export async function ImportLeadsView({ base, roles }: PanelProps) {
  await requireRole(roles);
  const supabase = await createClient();
  const counsellors = await fetchCounsellors(supabase);

  return (
    <>
      <Link href={`${base}/leads`} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Leads
      </Link>
      <PageHeader title="Import leads" description="Upload a spreadsheet, check the columns, then import." />
      <ImportWizard counsellors={counsellors} />
    </>
  );
}
