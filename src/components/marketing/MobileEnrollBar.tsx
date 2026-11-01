import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
    <div className="mbar" role="region" aria-label="Enroll">
      <div className="mbar__p">
        <small>Course fee</small>
        <b>{formatInr(pricing.current)}</b>
        {struckPrice !== null && <s>{formatInr(struckPrice)}</s>}
      </div>
      <Link className="btn btn--ink" href={href}>{label}<ArrowRight className="ic" strokeWidth={1.75} /></Link>
    </div>
  );
}
