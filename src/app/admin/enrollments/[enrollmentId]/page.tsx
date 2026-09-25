import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AccessControl } from "@/components/dashboard/AccessControl";
import { CertificateButton } from "@/components/dashboard/CertificateButton";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { EnrollmentPaymentBadge, PaymentBadge } from "@/components/dashboard/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatInr, fullName } from "@/lib/utils";

export default async function EnrollmentPage({ params }: { params: Promise<{ enrollmentId: string }> }) {
  const { enrollmentId } = await params;
  await requireRole("admin");
  const supabase = await createClient();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select(
      "*, course:courses(title, duration_weeks), profile:profiles!enrollments_user_id_fkey(first_name, last_name, email, phone)",
    )
    .eq("id", enrollmentId)
    .maybeSingle();
  if (!enrollment) notFound();

  const [{ data: installments }, { data: payments }, { data: certificate }] = await Promise.all([
    supabase.from("installments").select("*").eq("enrollment_id", enrollmentId).order("seq"),
    supabase.from("payments").select("*").eq("enrollment_id", enrollmentId).order("created_at", { ascending: false }),
    supabase.from("certificates").select("certificate_no, issued_at, verify_token").eq("enrollment_id", enrollmentId).maybeSingle(),
  ]);

  const student = fullName(enrollment.profile) || enrollment.profile?.email || "Student";

  return (
    <>
      <Link href="/admin/students" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Students
      </Link>
      <PageHeader
        title={student}
        description={`${enrollment.course?.title} · ${enrollment.profile?.email ?? ""}`}
        actions={
          <>
            <AccessControl enrollmentId={enrollment.id} status={enrollment.access_status} />
            {certificate ? (
              <Badge tone="gold">Certificate {certificate.certificate_no}</Badge>
            ) : (
              <CertificateButton enrollmentId={enrollment.id} />
            )}
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total fee" value={formatInr(enrollment.total_amount)} />
        <StatCard label="Paid" value={formatInr(enrollment.amount_paid)} />
        <StatCard
          label="Balance"
          value={formatInr(enrollment.balance_amount ?? 0)}
          tone={Number(enrollment.balance_amount ?? 0) > 0 ? "gold" : "default"}
        />
        <StatCard label="Plan" value={enrollment.plan === "partial" ? "Installments" : "Full payment"} hint={`Started ${formatDate(enrollment.starts_at)}`} />
      </div>

      <div className="mt-4">
        <EnrollmentPaymentBadge status={enrollment.payment_status} />
      </div>

      {(installments ?? []).length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-lg font-bold">Installments</h2>
          <div className="mt-3 rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid on</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(installments ?? []).map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{i.seq}</TableCell>
                    <TableCell className="font-semibold">{i.label || `Installment ${i.seq}`}</TableCell>
                    <TableCell>{formatInr(i.amount)}</TableCell>
                    <TableCell>{formatDate(i.due_date)}</TableCell>
                    <TableCell>
                      <Badge tone={i.status === "paid" ? "success" : i.status === "overdue" ? "danger" : "neutral"}>
                        {i.status === "paid" ? "Paid" : i.status === "overdue" ? "Overdue" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(i.paid_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold">Payments</h2>
        {(payments ?? []).length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed p-6 text-sm text-muted-foreground">Nothing recorded yet.</p>
        ) : (
          <div className="mt-3 rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Towards</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(payments ?? []).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{formatDate(p.paid_at ?? p.created_at)}</TableCell>
                    <TableCell className="font-semibold">{formatInr(p.amount)}</TableCell>
                    <TableCell className="capitalize">{p.purpose}</TableCell>
                    <TableCell className="capitalize">{p.provider.replace("_", " ")}</TableCell>
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
