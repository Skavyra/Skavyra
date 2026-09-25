import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * The Skavyra mark: quarter circles in Fibonacci squares (89, 55, 34, 21, 13, 8),
 * each one 1.618 times the next, coloured Gold 700 -> Gold 100.
 * The thin seams between the pieces are drawn with the surface colour.
 */
export function Mark({
  className,
  seam = "#0D0D0D",
  mono,
  title,
}: {
  className?: string;
  seam?: string;
  mono?: string;
  title?: string;
}) {
  const c = (hex: string) => mono ?? hex;
  return (
    <svg
      viewBox="0 0 144 89"
      className={cn("h-auto", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <g stroke={seam} strokeWidth="2.2" strokeLinejoin="round">
        <path d="M0 89A89 89 0 0 1 89 0V89Z" fill={c("#8E6718")} />
        <path d="M89 0A55 55 0 0 1 144 55H89Z" fill={c("#B98A24")} />
        <path d="M144 55A34 34 0 0 1 110 89V55Z" fill={c("#DDAA2F")} />
        <path d="M110 89A21 21 0 0 1 89 68H110Z" fill={c("#F2C75C")} />
        <path d="M89 68A13 13 0 0 1 102 55V68Z" fill={mono ? seam : "#0D0D0D"} />
        <path d="M102 55A8 8 0 0 1 110 63H102Z" fill={c("#DDAA2F")} />
      </g>
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return <span className={cn("font-display font-bold tracking-[-0.03em]", className)}>Skavyra</span>;
}

export function Logo({
  className,
  seam,
  textClassName,
  href = "/",
}: {
  className?: string;
  seam?: string;
  textClassName?: string;
  href?: string | null;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Mark seam={seam} className="w-10 sm:w-11" />
      <Wordmark className={cn("text-xl sm:text-2xl", textClassName)} />
    </span>
  );
  if (!href) return content;
  return (
    <Link href={href} className="inline-flex rounded-md" aria-label="Skavyra home">
      {content}
    </Link>
  );
}

/** LEARN | BUILD | GROW, spaced and ruled, as on the logo system board. */
export function TaglineRule({ className }: { className?: string }) {
  return (
    <span className={cn("tagline inline-flex items-center gap-3", className)}>
      <span>Learn</span>
      <span aria-hidden="true" className="h-3 w-px bg-current opacity-40" />
      <span>Build</span>
      <span aria-hidden="true" className="h-3 w-px bg-current opacity-40" />
      <span>Grow</span>
    </span>
  );
}
