import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { buttonVariants } from "./button";

/** Link-based pagination; the page number lives in the URL. */
export function Pagination({
  page,
  pageCount,
  hrefFor,
  total,
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
  total?: number;
}) {
  if (pageCount <= 1) {
    return total !== undefined ? <p className="text-xs text-muted-foreground">{total} total</p> : null;
  }
  const prev = Math.max(1, page - 1);
  const next = Math.min(pageCount, page + 1);
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">
        Page {page} of {pageCount}
        {total !== undefined ? `, ${total} total` : ""}
      </p>
      <div className="flex items-center gap-1">
        <Link
          href={hrefFor(prev)}
          aria-disabled={page === 1}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), page === 1 && "pointer-events-none opacity-40")}
        >
          <ChevronLeft /> Previous
        </Link>
        <Link
          href={hrefFor(next)}
          aria-disabled={page === pageCount}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            page === pageCount && "pointer-events-none opacity-40",
          )}
        >
          Next <ChevronRight />
        </Link>
      </div>
    </nav>
  );
}
