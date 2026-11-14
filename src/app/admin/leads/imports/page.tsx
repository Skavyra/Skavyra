import type { Metadata } from "next";

import { ImportHistoryView } from "@/components/panels/ImportHistoryView";

export const metadata: Metadata = { title: "Import history" };

export default function Page() {
  return <ImportHistoryView base="/admin" roles={["admin"]} />;
}
