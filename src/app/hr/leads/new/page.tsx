import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { AddLeadForm } from "@/components/leads/AddLeadForm";
import { requireRole } from "@/lib/auth/require-role";

export const metadata: Metadata = { title: "Add lead" };

export default async function HrAddLeadPage() {
  await requireRole(["hr", "admin"]);
  return (
    <>
      <PageHeader title="Add lead" description="The lead stays unassigned until you give it to an employee." />
      <AddLeadForm redirectTo="/hr/leads" />
    </>
  );
}
