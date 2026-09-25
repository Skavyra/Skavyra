import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { getUser, primaryRole } from "@/lib/auth/get-user";
import { ROLE_HOME } from "@/lib/constants";

import { MobileNav } from "./MobileNav";

/** Labels follow the approved hero design. "For colleges" goes to the contact form. */
export const HEADER_LINKS = [
  { href: "/courses", label: "Courses" },
  { href: "/contact?topic=college", label: "For colleges" },
  { href: "/about#mentors", label: "Mentors" },
  { href: "/about", label: "About" },
];

export async function SiteHeader() {
  const user = await getUser();
  const home = user ? ROLE_HOME[primaryRole(user.roles)] : null;

  return (
    <header className="theme-ink sticky top-0 z-40 border-b border-transparent bg-background/85 text-foreground backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between gap-6 lg:h-20">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-9 md:flex">
          {HEADER_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="text-[0.9375rem] font-medium text-foreground/85 transition-colors hover:text-gold-100">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-5 md:flex">
          {home ? (
            <Button asChild variant="gold" size="lg">
              <Link href={home}>Go to dashboard</Link>
            </Button>
          ) : (
            <>
              <Link href="/login" className="text-[0.9375rem] font-semibold hover:text-gold-100">
                Log in
              </Link>
              <Button asChild variant="gold" size="lg">
                <Link href="/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>
        <MobileNav links={HEADER_LINKS} home={home} />
      </div>
    </header>
  );
}
