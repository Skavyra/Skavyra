import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { getUser, primaryRole } from "@/lib/auth/get-user";
import { ROLE_HOME } from "@/lib/constants";

import { HeaderFrame } from "./HeaderFrame";
import { MagneticWrap } from "./MagneticWrap";
import { MobileNav } from "./MobileNav";
import { DesktopNav } from "./DesktopNav";

/** Labels follow the approved hero design. "For colleges" goes to the contact form. */
export const HEADER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/flagship", label: "Flagship" },
  { href: "/contact?topic=college", label: "For colleges" },
  { href: "/mentors", label: "Mentors" },
  { href: "/about", label: "About" },
];

export async function SiteHeader() {
  const user = await getUser();
  const home = user ? ROLE_HOME[primaryRole(user.roles)] : null;

  return (
    <HeaderFrame>
      <div className="theme-ink container flex h-16 items-center justify-between gap-6 transition-[height] duration-300 group-data-[scrolled=true]:h-14 lg:h-20 lg:group-data-[scrolled=true]:h-16">
        <Logo />
        <DesktopNav links={HEADER_LINKS} />
        <div className="hidden items-center gap-5 md:flex">
          {home ? (
            <MagneticWrap>
              <Button
                asChild
                variant="gold"
                size="lg"
                className="rounded-2xl bg-yellow-400 text-black shadow-[0_4px_18px_rgba(250,204,21,0.16)] hover:bg-yellow-300"
              >
                <Link href={home}>Go to dashboard</Link>
              </Button>
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
