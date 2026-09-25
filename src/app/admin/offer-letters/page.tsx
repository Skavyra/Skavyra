import { FileSignature, Plus, Upload } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { LetterBadge } from "@/components/dashboard/StatusBadge";
import { LetterActions } from "@/components/offer-letters/LetterActions";
import { LetterPreview } from "@/components/offer-letters/LetterPreview";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/require-role";
import type { CompanySettings } from "@/lib/pdf/shared";
import type { TemplateBody } from "@/lib/pdf/offer-letter";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatInr } from "@/lib/utils";
import type { LetterStatus, OfferLetter } from "@/types";

export const metadata: Metadata = { title: "Offer letters" };

type Row = {
  id: string;
  letter_no: string;
  candidate_name: string;
  role_title: string;
  joining_date: string;
  ctc_amount: number;
  ctc_period: string;
  status: LetterStatus;
};

export default async function OfferLettersPage({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const { preview } = await searchParams;
  await requireRole("admin");
  const supabase = await createClient();

  const [{ data: letters }, { data: template }, { data: companySetting }] = await Promise.all([
    supabase.from("offer_letters").select("*").order("issue_date", { ascending: false }).limit(200),
    supabase.from("offer_letter_templates").select("body").eq("is_active", true).order("version", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("app_settings").select("value").eq("key", "company").maybeSingle(),
  ]);

  const rows: Row[] = (letters ?? []).map((l) => ({
    id: l.id,
    letter_no: l.letter_no,
    candidate_name: l.candidate_name,
    role_title: l.role_title,
    joining_date: l.joining_date,
    ctc_amount: Number(l.ctc_amount),
    ctc_period: l.ctc_period,
    status: l.status,
  }));

  const columns: Column<Row>[] = [
    { key: "no", header: "Letter", cell: (r) => <span className="font-mono text-xs">{r.letter_no}</span> },
    { key: "name", header: "Candidate", cell: (r) => <span className="font-semibold">{r.candidate_name}</span> },
    { key: "role", header: "Role", cell: (r) => r.role_title },
    { key: "salary", header: "Salary", cell: (r) => `${formatInr(r.ctc_amount)} / ${r.ctc_period}` },
    { key: "joining", header: "Joining", cell: (r) => formatDate(r.joining_date) },
    { key: "status", header: "Status", cell: (r) => <LetterBadge status={r.status} /> },
    { key: "actions", header: "", className: "text-right", cell: (r) => <LetterActions letterId={r.id} /> },
  ];

  const previewLetter = preview ? ((letters ?? []).find((l) => l.id === preview) as OfferLetter | undefined) : undefined;
  const body = (template?.body ?? {}) as TemplateBody;
  const company = (companySetting?.value ?? {}) as CompanySettings;

  return (
    <>
      <PageHeader
        title="Offer letters"
        description="Draft, generate the PDF and record what was sent."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/admin/offer-letters/import">
                <Upload /> Bulk upload
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/offer-letters/new">
                <Plus /> New letter
              </Link>
            </Button>
          </>
        }
      />
      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(r) => r.id}
        cardTitle={(r) => r.candidate_name}
        empty={
          <EmptyState
            icon={FileSignature}
            title="No offer letters yet"
            description="Write one by hand, or upload a spreadsheet to create a batch of drafts."
            action={
              <Button asChild>
                <Link href="/admin/offer-letters/new">New letter</Link>
              </Button>
            }
          />
        }
      />
      {previewLetter && (
        <LetterPreview
          letter={{
            id: previewLetter.id,
            letterNo: previewLetter.letter_no,
            candidateName: previewLetter.candidate_name,
            email: previewLetter.email,
            roleTitle: previewLetter.role_title,
            department: previewLetter.department,
            employmentType: previewLetter.employment_type,
            ctcAmount: Number(previewLetter.ctc_amount),
            ctcPeriod: previewLetter.ctc_period,
            joiningDate: previewLetter.joining_date,
            issueDate: previewLetter.issue_date,
            workLocation: previewLetter.work_location,
            reportingManagerName: previewLetter.reporting_manager_name,
          }}
          template={body}
          company={company}
          status={previewLetter.status}
        />
      )}
    </>
  );
}
