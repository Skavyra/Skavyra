import { CreditCard } from "lucide-react";
import type { Metadata } from "next";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { PaymentBadge } from "@/components/dashboard/StatusBadge";
import { PayButton } from "@/components/payments/PayButton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatInr } from "@/lib/utils";

export const metadata: Metadata = { title: "Payments" };

export default async function StudentPaymentsPage() {
  const user = await requireRole("student");
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, plan, total_amount, amount_paid, balance_amount, payment_status, course:courses(title)")
    .eq("user_id", user.id);
  const list = enrollments ?? [];
  const ids = list.map((e) => e.id);

  const [{ data: installments }, { data: payments }, { data: setting }] = await Promise.all([
    ids.length
      ? supabase.from("installments").select("*").in("enrollment_id", ids).order("seq", { ascending: true })
      : Promise.resolve({ data: [] as never[] }),
    supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("app_settings").select("value").eq("key", "payments").maybeSingle(),
  ]);
  const upiId = (setting?.value as { upi_id?: string } | null)?.upi_id ?? null;

  const total = list.reduce((s, e) => s + Number(e.total_amount), 0);
  const paid = list.reduce((s, e) => s + Number(e.amount_paid), 0);
  const balance = list.reduce((s, e) => s + Number(e.balance_amount ?? 0), 0);

  if (list.length === 0) {
    return (
      <>
        <PageHeader title="Payments" />
        <EmptyState icon={CreditCard} title="Nothing to pay yet" description="Payment details appear once you are enrolled in a course." />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Payments" description="Your fees, installments and receipts." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total fees" value={formatInr(total)} />
        <StatCard label="Paid" value={formatInr(paid)} />
        <StatCard label="Balance" value={formatInr(balance)} tone={balance > 0 ? "gold" : "default"} />
      </div>

      {list.map((enrollment) => {
        const rows = (installments ?? []).filter((i) => i.enrollment_id === enrollment.id);
        const enrollmentBalance = Number(enrollment.balance_amount ?? 0);
        const firstPending = rows.find((i) => i.status === "pending");
        return (
          <section key={enrollment.id} className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold">{enrollment.course?.title}</h2>
              <span className="text-sm text-muted-foreground">
                {formatInr(enrollment.amount_paid)} paid of {formatInr(enrollment.total_amount)}
              </span>
            </div>

            {enrollment.plan === "partial" && rows.length > 0 ? (
              <div className="mt-3 rounded-xl border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Installment</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell className="font-semibold">{i.label || `Installment ${i.seq}`}</TableCell>
                        <TableCell>{formatInr(i.amount)}</TableCell>
                        <TableCell>{formatDate(i.due_date)}</TableCell>
                        <TableCell>
                          {i.status === "paid" ? (
                            <Badge tone="success">Paid</Badge>
                          ) : i.status === "overdue" ? (
                            <Badge tone="danger">Overdue</Badge>
                          ) : (
                            <Badge tone="neutral">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {i.status === "paid" ? (
                            <span className="text-xs text-muted-foreground">{formatDate(i.paid_at)}</span>
                          ) : firstPending?.id === i.id ? (
                            <PayButton
                              enrollmentId={enrollment.id}
                              amount={Number(i.amount)}
                              installmentId={i.id}
                              purpose="installment"
                              label="Pay"
                              upiId={upiId}
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">Due later</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : enrollmentBalance > 0 ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-5">
                <p className="text-sm">
                  <span className="font-semibold">{formatInr(enrollmentBalance)}</span> outstanding on this course.
                </p>
                <PayButton
                  enrollmentId={enrollment.id}
                  amount={enrollmentBalance}
                  purpose={Number(enrollment.amount_paid) > 0 ? "balance" : "full"}
                  label={`Pay ${formatInr(enrollmentBalance)}`}
                  size="default"
                  upiId={upiId}
                />
              </div>
            ) : (
              <p className="mt-3 rounded-xl border bg-card p-5 text-sm text-muted-foreground">This course is paid in full.</p>
            )}
          </section>
        );
      })}

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold">Receipts</h2>
        {(payments ?? []).length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed p-6 text-sm text-muted-foreground">No payments recorded yet.</p>
        ) : (
          <div className="mt-3 rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(payments ?? []).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{formatDate(p.paid_at ?? p.created_at)}</TableCell>
                    <TableCell className="font-semibold">{formatInr(p.amount)}</TableCell>
                    <TableCell className="capitalize">{p.method ?? p.provider.replace("_", " ")}</TableCell>
                    <TableCell className="font-mono text-xs">{p.provider_payment_id ?? p.transaction_ref ?? "—"}</TableCell>
                    <TableCell>
                      <PaymentBadge status={p.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </>
  );
}
