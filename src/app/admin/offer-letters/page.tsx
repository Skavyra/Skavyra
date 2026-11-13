import type { Metadata } from "next";

import { OfferLettersView } from "@/components/panels/OfferLettersView";

export const metadata: Metadata = { title: "Offer letters" };

export default async function Page({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const { preview } = await searchParams;
  return <OfferLettersView base="/admin" roles={["admin"]} preview={preview} />;
}
