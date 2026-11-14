"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { findExistingPhones, importLeads, type ImportPlan, type ImportSummary } from "@/actions/leads";
import type { Counsellor } from "@/components/leads/DistributeDialog";
import { Button } from "@/components/ui/button";
import { usePanelBase } from "@/hooks/use-panel-base";
import { toast } from "@/hooks/use-toast";
import { flagLeadRows, type RowFlag } from "@/lib/excel/dedupe";
import { applyMapping, LEAD_FIELDS, matchHeaders } from "@/lib/excel/header-match";
import type { ParsedSheet } from "@/lib/excel/parse";
import { cn } from "@/lib/utils";

import { AssignStep } from "./AssignStep";
import { MappingStep } from "./MappingStep";
import { PreviewStep } from "./PreviewStep";
import { UploadStep } from "./UploadStep";

const STEPS = ["Upload", "Match columns", "Check", "Assign and confirm"];

export function ImportWizard({ counsellors }: { counsellors: Counsellor[] }) {
  const base = usePanelBase();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [sheet, setSheet] = useState<ParsedSheet | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [flags, setFlags] = useState<RowFlag[]>([]);
  const [existing, setExisting] = useState<{ phone: string; interested_course_text: string | null }[]>([]);
  const [done, setDone] = useState<ImportSummary | null>(null);
  const [pending, start] = useTransition();

  function onParsed(parsed: ParsedSheet) {
    setSheet(parsed);
    setMapping(matchHeaders(parsed.headers, LEAD_FIELDS));
    setStep(1);
  }

  function toPreview() {
    if (!sheet) return;
    const mapped = applyMapping(sheet.rows, mapping);
    start(async () => {
      const result = await findExistingPhones(mapped.map((r) => r.phone ?? ""));
      const found = result.ok ? result.data : [];
      setExisting(found);
      setRows(mapped);
      setFlags(flagLeadRows(mapped, found));
      setStep(2);
    });
  }

  function edit(index: number, key: string, value: string) {
    const next = rows.map((r, i) => (i === index ? { ...r, [key]: value } : r));
    setRows(next);
    setFlags(flagLeadRows(next, existing));
  }

  const importable = rows.filter((_, i) => flags[i] === "ok");

  function runImport(plan: ImportPlan) {
    if (!sheet) return;
    start(async () => {
      const result = await importLeads({
        fileName: sheet.fileName,
        fileType: sheet.fileType,
        mapping,
        detectedColumns: sheet.headers,
        rows: importable,
        plan,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setDone(result.data);
      toast.success(`${result.data.inserted} leads imported`);
      router.refresh();
    });
  }

  if (done) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-xl border bg-card p-6">
        <CheckCircle2 className="size-8 text-success" />
        <h2 className="font-display text-xl font-bold">{done.inserted} leads imported</h2>
        <p className="text-sm text-muted-foreground">
          {done.assigned} assigned{done.inserted - done.assigned > 0 ? `, ${done.inserted - done.assigned} left unassigned` : ""}.{" "}
          {done.duplicates} already existed and {done.skipped} were missing a name or a valid phone number. They were
          left out.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`${base}/leads?batch=${done.batch_id}`}>View these leads</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`${base}/leads`}>All leads</Link>
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setDone(null);
              setSheet(null);
              setRows([]);
              setStep(0);
            }}
          >
            Import another file
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ol className="flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
              i === step ? "border-ink bg-ink font-semibold text-ivory" : i < step ? "border-gold-300 text-gold-700" : "text-muted-foreground",
            )}
          >
            <span className="font-semibold">{i + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      {step === 0 && <UploadStep onParsed={onParsed} />}
      {step === 1 && sheet && (
        <MappingStep
          fields={LEAD_FIELDS}
          headers={sheet.headers}
          sample={sheet.rows[0]}
          mapping={mapping}
          onChange={setMapping}
          onBack={() => setStep(0)}
          onNext={toPreview}
        />
      )}
      {step === 2 && (
        <PreviewStep
          fields={LEAD_FIELDS}
          rows={rows}
          flags={flags}
          onEdit={edit}
          onBack={() => setStep(1)}
          onImport={() => setStep(3)}
          importing={pending}
        />
      )}
      {step === 3 && (
        <AssignStep
          rows={importable}
          counsellors={counsellors}
          onBack={() => setStep(2)}
          onConfirm={runImport}
          confirming={pending}
        />
      )}
    </div>
  );
}
