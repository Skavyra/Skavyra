import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      tone: {
        neutral: "border-border bg-muted text-foreground",
        gold: "border-gold-300/60 bg-gold-100/40 text-gold-700",
        info: "border-sky-200 bg-sky-50 text-sky-800",
        warning: "border-amber-200 bg-amber-50 text-amber-800",
        muted: "border-border bg-transparent text-muted-foreground",
        danger: "border-red-200 bg-red-50 text-red-700",
        success: "border-emerald-200 bg-emerald-50 text-emerald-800",
        ink: "border-ink bg-ink text-ivory",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { Badge, badgeVariants };
