import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { PasswordForm, ProfileForm } from "@/components/dashboard/ProfileForm";
import { requireRole } from "@/lib/auth/require-role";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireRole("student");
  if (!user.profile) return <p className="text-muted-foreground">Your profile could not be loaded. Log out and back in.</p>;

  return (
    <div className="max-w-3xl">
      <PageHeader title="Profile" description="Keep your details current so your counsellor and certificate are correct." />
      <div className="flex flex-col gap-6">
        <ProfileForm profile={user.profile} email={user.email} />
        <PasswordForm />
      </div>
    </div>
  );
}
