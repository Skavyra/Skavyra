import Link from "next/link";

import { cn } from "@/lib/utils";

const base =
  "inline-flex size-9 items-center justify-center rounded-lg border border-input bg-transparent text-foreground transition-colors hover:border-gold-300 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:size-4";

/**
 * An icon-only button with its name shown on hover and keyboard focus. The name is also the accessible label,
 * so screen readers still announce it. Pass `href` for a link (internal paths use next/link) or `onClick`.
 */
export function IconAction({
  label,
  href,
  onClick,
  external = false,
  className,
  children,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  /** tel:, https: and other non-app links use a plain anchor. */
  external?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const control = href ? (
    external || !href.startsWith("/") ? (
      <a
        href={href}
        aria-label={label}
        className={cn(base, className)}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {children}
      </a>
    ) : (
      <Link href={href} scroll={false} aria-label={label} className={cn(base, className)}>
        {children}
      </Link>
    )
  ) : (
    <button type="button" onClick={onClick} aria-label={label} className={cn(base, className)}>
      {children}
    </button>
  );

  return (
    <span className="group relative inline-flex">
      {control}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-medium text-ivory opacity-0 shadow-md transition-opacity duration-100 group-focus-within:opacity-100 group-hover:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
