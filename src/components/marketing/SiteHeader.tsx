import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { getUser, primaryRole } from "@/lib/auth/get-user";
import { ROLE_HOME } from "@/lib/constants";

import { HeaderFrame } from "./HeaderFrame";
import { MagneticWrap } from "./MagneticWrap";
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
    <HeaderFrame>
      <div className="theme-ink container flex h-16 items-center justify-between gap-6 transition-[height] duration-300 group-data-[scrolled=true]:h-14 lg:h-20 lg:group-data-[scrolled=true]:h-16">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-9 md:flex">
          {HEADER_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="relative py-2 text-[0.9375rem] font-medium text-foreground/75 transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-center after:scale-x-0 after:bg-gold-300 after:transition-transform hover:text-gold-100 hover:after:scale-x-100">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-5 md:flex">
          {home ? (
            <MagneticWrap>
              <Button asChild variant="gold" size="lg"><Link href={home}>Go to dashboard</Link></Button>
            </MagneticWrap>
          ) : (
            <>
              <Link href="/login" className="text-[0.9375rem] font-semibold hover:text-gold-100">
                Log in
              </Link>
              <MagneticWrap>
                <Button asChild variant="gold" size="lg"><Link href="/signup">Get started</Link></Button>
              </MagneticWrap>
            </>
          )}
        </div>
        <MobileNav links={HEADER_LINKS} home={home} />
      </div>
    </HeaderFrame>
  );
}
