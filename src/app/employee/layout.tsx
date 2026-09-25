import { AppShell } from "@/components/dashboard/AppShell";
import { requireRole } from "@/lib/auth/require-role";
import { EMPLOYEE_NAV } from "@/lib/constants";

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("employee", "/employee");
  return (
    <AppShell items={EMPLOYEE_NAV} title="Counsellor" user={user}>
      {children}
    </AppShell>
  );
}
