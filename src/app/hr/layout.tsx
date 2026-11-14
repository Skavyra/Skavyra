import { redirect } from "next/navigation";

import { AppShell } from "@/components/dashboard/AppShell";
import { requireRole } from "@/lib/auth/require-role";
import { HR_NAV } from "@/lib/constants";

export default async function HrLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["hr", "admin"], "/hr");
  // The HR panel is the restricted view (read-only leads, no remove). An admin must never land in it, even if
  // they also hold the hr role, so they get the full admin panel instead.
  if (user.roles.includes("admin")) redirect("/admin");
  return (
    <AppShell items={HR_NAV} title="HR" user={user}>
      {children}
    </AppShell>
  );
}
