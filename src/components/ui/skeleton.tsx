import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn("shimmer rounded-lg", className)} {...props} />;
}

export { Skeleton };
