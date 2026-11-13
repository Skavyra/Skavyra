import type { Metadata } from "next";

import { LeadsView } from "@/components/panels/LeadsView";
import type { LeadQuery } from "@/lib/leads-query";

export const metadata: Metadata = { title: "Leads" };

export default async function Page({ searchParams }: { searchParams: Promise<LeadQuery & { lead?: string }> }) {
  return <LeadsView base="/hr" roles={["hr", "admin"]} params={await searchParams} />;
}
