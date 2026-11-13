import type { Metadata } from "next";

import { ImportLettersView } from "@/components/panels/ImportLettersView";

export const metadata: Metadata = { title: "Bulk upload offer letters" };

export default function Page() {
  return <ImportLettersView base="/hr" roles={["hr", "admin"]} />;
}
