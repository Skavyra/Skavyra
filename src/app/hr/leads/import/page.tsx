import type { Metadata } from "next";

import { ImportLeadsView } from "@/components/panels/ImportLeadsView";

export const metadata: Metadata = { title: "Import leads" };

export default function Page() {
  return <ImportLeadsView base="/hr" roles={["hr", "admin"]} />;
}
