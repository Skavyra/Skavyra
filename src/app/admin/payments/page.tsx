import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { TransactionsTable, type TransactionRow } from "@/components/payments/TransactionsTable";
import { VerifyQueue, type PendingPayment } from "@/components/payments/VerifyQueue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { formatInr, fullName } from "@/lib/utils";

export const metadata: Metadata = { title: "Payments" };

export default async function AdminPaymentsPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: payments } = await supabase
    .from("payments")
    .select(
      "*, enrollment:enrollments(course:courses(title)), profile:profiles!payments_user_id_fkey(first_name, last_name), lead:student_leads(full_name), creator:profiles!payments_created_by_fkey(first_name, last_name)",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  const all = payments ?? [];
  const pending: PendingPayment[] = all
    .filter((p) => p.status === "pending")
    .map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      purpose: p.purpose,
      transaction_ref: p.transaction_ref,
      proof_path: p.proof_path,
      created_at: p.created_at,
      lead_name: p.lead?.full_name ?? null,
      student_name: fullName(p.profile) || null,
      course_title: p.enrollment?.course?.title ?? null,
      logged_by: fullName(p.creator) || null,
    }));

  const rows: TransactionRow[] = all.map((p) => ({
    id: p.id,
    created_at: p.created_at,
    paid_at: p.paid_at,
    amount: Number(p.amount),
    purpose: p.purpose,
    provider: p.provider,
    status: p.status,
    reference: p.provider_payment_id ?? p.transaction_ref ?? "—",
    who: fullName(p.profile) || p.lead?.full_name || "—",
    course: p.enrollment?.course?.title ?? "—",
  }));

  const collected = all.filter((p) => p.status === "success").reduce((s, p) => s + Number(p.amount), 0);
  const awaiting = pending.reduce((s, p) => s + p.amount, 0);

  return (
    <>
      <PageHeader title="Payments" description="Verify offline payments and see every transaction." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Collected" value={formatInr(collected)} />
        <StatCard label="Awaiting verification" value={formatInr(awaiting)} hint={`${pending.length} payments`} tone={pending.length ? "gold" : "default"} />
        <StatCard label="Transactions" value={all.length} hint="Most recent 500" />
      </div>

      <Tabs defaultValue="queue" className="mt-8">
        <TabsList>
          <TabsTrigger value="queue">To verify ({pending.length})</TabsTrigger>
          <TabsTrigger value="all">All transactions</TabsTrigger>
        </TabsList>
        <TabsContent value="queue">
          <VerifyQueue payments={pending} />
        </TabsContent>
        <TabsContent value="all">
          <TransactionsTable rows={rows} />
        </TabsContent>
      </Tabs>
    </>
  );
}
