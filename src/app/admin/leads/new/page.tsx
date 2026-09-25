import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { AddLeadForm } from "@/components/leads/AddLeadForm";
import { requireRole } from "@/lib/auth/require-role";

export const metadata: Metadata = { title: "Add lead" };

export default async function AdminAddLeadPage() {
  await requireRole("admin");
  return (
    <>
      <PageHeader title="Add lead" description="The lead stays unassigned until you give it to a counsellor." />
      <AddLeadForm redirectTo="/admin/leads" />
    </>
  );
}
