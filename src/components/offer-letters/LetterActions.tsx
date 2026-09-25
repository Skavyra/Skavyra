"use client";

import { Eye, Pencil } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

export function LetterActions({ letterId }: { letterId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <span className="flex justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const next = new URLSearchParams(params.toString());
          next.set("preview", letterId);
          router.push(`${pathname}?${next.toString()}`, { scroll: false });
        }}
      >
        <Eye /> PDF
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link href={`/admin/offer-letters/new?id=${letterId}`}>
          <Pencil /> Edit
        </Link>
      </Button>
    </span>
  );
}
