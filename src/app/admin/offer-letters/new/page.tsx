import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { LetterForm } from "@/components/offer-letters/LetterForm";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { fullName } from "@/lib/utils";
import type { OfferLetter } from "@/types";

export const metadata: Metadata = { title: "New offer letter" };

export default async function NewLetterPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  await requireRole("admin");
  const supabase = await createClient();

  const [{ data: letter }, { data: employees }] = await Promise.all([
    id ? supabase.from("offer_letters").select("*").eq("id", id).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from("employees").select("id, profile:profiles!employees_id_fkey(first_name, last_name)").eq("is_active", true),
  ]);

  const managers = (employees ?? []).map((e) => ({ id: e.id, name: fullName(e.profile) || "Unnamed" }));

  return (
    <>
      <Link href="/admin/offer-letters" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Offer letters
      </Link>
      <PageHeader
        title={letter ? `Edit ${letter.letter_no}` : "New offer letter"}
        description="The letter number is assigned automatically when the draft is saved."
      />
      <LetterForm letter={(letter as OfferLetter) ?? null} managers={managers} />
    </>
  );
}
