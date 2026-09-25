"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { importOfferLetters } from "@/actions/offer-letters";
import { MappingStep } from "@/components/leads/import/MappingStep";
import { UploadStep } from "@/components/leads/import/UploadStep";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { applyMapping, matchHeaders, OFFER_FIELDS } from "@/lib/excel/header-match";
import { toIsoDate, type ParsedSheet } from "@/lib/excel/parse";
import { cn } from "@/lib/utils";

/** Rows missing a name, email, role or joining date are flagged and skipped. */
function invalid(row: Record<string, string>) {
  const missing: string[] = [];
  if (!row.candidate_name?.trim()) missing.push("name");
  if (!row.email?.trim()) missing.push("email");
  if (!row.role_title?.trim()) missing.push("role");
  if (!toIsoDate(row.joining_date ?? "")) missing.push("joining date");
  return missing;
}

export function BulkUpload() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [sheet, setSheet] = useState<ParsedSheet | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [done, setDone] = useState<{ inserted: number; skipped: number } | null>(null);
  const [pending, start] = useTransition();

  if (done) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-xl border bg-card p-6">
        <CheckCircle2 className="size-8 text-success" />
        <h2 className="font-display text-xl font-bold">{done.inserted} letters created as drafts</h2>
        <p className="text-sm text-muted-foreground">
          {done.skipped} rows were missing a name, email, role or joining date and were skipped.
        </p>
        <Button asChild>
          <Link href="/admin/offer-letters">Go to offer letters</Link>
        </Button>
      </div>
    );
  }

  if (step === 0) {
    return (
      <UploadStep
        onParsed={(parsed) => {
          setSheet(parsed);
          setMapping(matchHeaders(parsed.headers, OFFER_FIELDS));
          setStep(1);
        }}
      />
    );
  }

  if (step === 1 && sheet) {
    return (
      <MappingStep
        fields={OFFER_FIELDS}
        headers={sheet.headers}
        sample={sheet.rows[0]}
        mapping={mapping}
        onChange={setMapping}
        onBack={() => setStep(0)}
        onNext={() => {
          setRows(
            applyMapping(sheet.rows, mapping).map((r) => ({
              ...r,
              joining_date: toIsoDate(r.joining_date ?? ""),
              issue_date: toIsoDate(r.issue_date ?? ""),
            })),
          );
          setStep(2);
        }}
      />
    );
  }

  const good = rows.filter((r) => invalid(r).length === 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Badge tone="success">{good.length} will be created</Badge>
        {rows.length - good.length > 0 && <Badge tone="muted">{rows.length - good.length} incomplete</Badge>}
      </div>
      <div className="max-h-[26rem] overflow-auto rounded-xl border bg-card">
        <Table>
          <TableHeader className="sticky top-0 z-10">
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joining</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => {
              const missing = invalid(r);
              return (
                <TableRow key={i} className={cn(missing.length > 0 && "bg-muted/60")}>
                  <TableCell className="font-semibold">{r.candidate_name || "—"}</TableCell>
                  <TableCell>{r.email || "—"}</TableCell>
                  <TableCell>{r.role_title || "—"}</TableCell>
                  <TableCell>{r.joining_date || "—"}</TableCell>
                  <TableCell>{r.ctc_amount || "—"}</TableCell>
                  <TableCell>
                    {missing.length === 0 ? <Badge tone="success">Ready</Badge> : <Badge tone="muted">Missing {missing.join(", ")}</Badge>}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(1)} disabled={pending}>
          Back
        </Button>
        <Button
          loading={pending}
          disabled={good.length === 0}
          onClick={() =>
            start(async () => {
              if (!sheet) return;
              const result = await importOfferLetters({
                fileName: sheet.fileName,
                sourceType: sheet.fileType,
                mapping,
                detectedColumns: sheet.headers,
                rows: good,
              });
              if (!result.ok) {
                toast.error(result.error);
                return;
              }
              setDone(result.data);
              router.refresh();
            })
          }
        >
          Create {good.length} drafts
        </Button>
      </div>
    </div>
  );
}
