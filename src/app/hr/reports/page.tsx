import type { Metadata } from "next";

import { ReportsView, type ReportParams } from "@/components/panels/ReportsView";

export const metadata: Metadata = { title: "Reports" };

export default async function Page({ searchParams }: { searchParams: Promise<ReportParams> }) {
  return <ReportsView base="/hr" roles={["hr", "admin"]} params={await searchParams} />;
}
