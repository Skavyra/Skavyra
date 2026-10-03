import type { NavItem } from "@/lib/constants";
import { fullName } from "@/lib/utils";
import type { SessionUser } from "@/types";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/** Rail on the left from lg up, a sheet below that. Used by all three panels. */
export function AppShell({
  items,
  title,
  user,
  profileHref,
  children,
}: {
  items: NavItem[];
  title: string;
  user: SessionUser;
  profileHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar items={items} title={title} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          items={items}
          title={title}
          name={fullName(user.profile)}
          email={user.email}
          profileHref={profileHref}
        />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
