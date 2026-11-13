import type { Metadata } from "next";

import { ReportsView } from "@/components/panels/ReportsView";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
  return <ReportsView base="/hr" roles={["hr", "admin"]} />;
}
