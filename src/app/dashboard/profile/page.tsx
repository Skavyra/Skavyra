import type { Metadata } from "next";

import { AvatarUpload } from "@/components/dashboard/AvatarUpload";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PasswordForm, ProfileForm } from "@/components/dashboard/ProfileForm";
import { requireRole } from "@/lib/auth/require-role";
import { fullName } from "@/lib/utils";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireRole("student");
  if (!user.profile) return <p className="text-muted-foreground">Your profile could not be loaded. Log out and back in.</p>;

  return (
    <div className="max-w-3xl">
      <PageHeader title="Profile" description="Keep your details current so your counsellor and certificate are correct." />
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-ink/10 bg-card p-5 shadow-[0_16px_40px_-34px_rgba(13,13,13,0.4)] sm:p-6">
          <AvatarUpload userId={user.id} name={fullName(user.profile) || user.email} avatarUrl={user.profile.avatar_url} />
        </div>
        <ProfileForm profile={user.profile} email={user.email} />
        <PasswordForm />
      </div>
    </div>
  );
}
