import { AppShell } from "@/components/dashboard/AppShell";
import { requireRole } from "@/lib/auth/require-role";
import { STUDENT_NAV } from "@/lib/constants";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("student", "/dashboard");
  return (
    <AppShell items={STUDENT_NAV} title="Student" user={user} profileHref="/dashboard/profile">
      {children}
    </AppShell>
  );
}
