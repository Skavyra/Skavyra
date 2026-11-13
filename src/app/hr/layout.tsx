import { AppShell } from "@/components/dashboard/AppShell";
import { requireRole } from "@/lib/auth/require-role";
import { HR_NAV } from "@/lib/constants";

export default async function HrLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["hr", "admin"], "/hr");
  return (
    <AppShell items={HR_NAV} title="HR" user={user}>
      {children}
    </AppShell>
  );
}
