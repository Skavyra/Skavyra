import Link from "next/link";

import { Mark } from "@/components/brand/logo";
import { getUser, primaryRole } from "@/lib/auth/get-user";
import { ROLE_HOME } from "@/lib/constants";

import { HeaderFrame } from "./HeaderFrame";
import { MobileNavButton, MobileNavPanel } from "./MobileNav";
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
      <div className="wrap hdr__in">
        <Link href="/" className="logo" aria-label="Skavyra home">
          <Mark className="mark" seam="#FFFFFF" />
          <span className="wordmark">Skavyra</span>
        </Link>
        <DesktopNav links={HEADER_LINKS} />
        <div className="hdr__act">
          {home ? (
            <Link className="btn btn--ink btn--sm" href={home}>Go to dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="hdr__login">Log in</Link>
              <Link className="btn btn--ink btn--sm" href="/signup">Get started</Link>
            </>
          )}
        </div>
        <MobileNavButton />
      </div>
      <MobileNavPanel links={HEADER_LINKS} home={home} />
    </HeaderFrame>
  );
}
