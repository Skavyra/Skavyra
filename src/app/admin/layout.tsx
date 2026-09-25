import { AppShell } from "@/components/dashboard/AppShell";
import { requireRole } from "@/lib/auth/require-role";
import { ADMIN_NAV } from "@/lib/constants";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("admin", "/admin");
  return (
    <AppShell items={ADMIN_NAV} title="Admin" user={user}>
      {children}
    </AppShell>
  );
}
