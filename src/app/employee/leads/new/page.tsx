import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { AddLeadForm } from "@/components/leads/AddLeadForm";
import { requireRole } from "@/lib/auth/require-role";

export const metadata: Metadata = { title: "Add lead" };

export default async function AddLeadPage() {
  await requireRole("employee");
  return (
    <>
      <PageHeader title="Add lead" description="New leads you add are assigned to you straight away." />
      <AddLeadForm redirectTo="/employee/leads" />
    </>
  );
}
