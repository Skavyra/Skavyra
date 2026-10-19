import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatInr, getOfferPricing } from "@/lib/utils";

type Props = {
  price: number;
  offerPrice: number | null;
  offerEndsAt: string | null;
  mrp: number | null;
  href: string;
  label: string;
};

export function MobileEnrollBar({ price, offerPrice, offerEndsAt, mrp, href, label }: Props) {
  const pricing = getOfferPricing({ price, offer_price: offerPrice, offer_ends_at: offerEndsAt });
  const struckPrice = pricing.original ?? (mrp && mrp > pricing.current ? mrp : null);

  return (
    <div className="theme-ink fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pr-24 text-ivory backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-xl font-bold leading-tight">{formatInr(pricing.current)}</p>
          {struckPrice !== null && (
            <p className="text-xs text-ivory/50 line-through">{formatInr(struckPrice)}</p>
          )}
        </div>
        <Button asChild variant="gold" className="shrink-0">
          <Link href={href}>{label}</Link>
        </Button>
      </div>
    </div>
  );
}
