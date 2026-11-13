import type { Metadata } from "next";

import { LeadsView } from "@/components/panels/LeadsView";
import type { LeadQuery } from "@/lib/leads-query";

export const metadata: Metadata = { title: "Leads" };

export default async function Page({ searchParams }: { searchParams: Promise<LeadQuery & { lead?: string }> }) {
  return <LeadsView base="/admin" roles={["admin"]} params={await searchParams} />;
}
