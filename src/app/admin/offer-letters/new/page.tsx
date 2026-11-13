import type { Metadata } from "next";

import { NewLetterView } from "@/components/panels/NewLetterView";

export const metadata: Metadata = { title: "New offer letter" };

export default async function Page({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return <NewLetterView base="/admin" roles={["admin"]} id={id} />;
}
