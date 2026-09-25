import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  href?: string;
  tone?: "default" | "gold";
}) {
  const body = (
    <div
      className={cn(
        "flex h-full flex-col gap-2 rounded-xl border p-5 transition-colors",
        tone === "gold" ? "border-gold-300 bg-gold-100/25" : "bg-card",
        href && "hover:border-gold-300",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && <Icon className="size-4 shrink-0 text-gold-700" />}
      </div>
      <p className="font-display text-3xl font-bold leading-none">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}
