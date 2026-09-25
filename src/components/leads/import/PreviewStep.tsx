"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { RowFlag } from "@/lib/excel/dedupe";
import type { FieldDef } from "@/lib/excel/header-match";
import { cn } from "@/lib/utils";

const FLAG: Record<RowFlag, { label: string; tone: "success" | "danger" | "warning" | "muted"; row: string }> = {
  ok: { label: "New", tone: "success", row: "" },
  duplicate: { label: "Already a lead", tone: "danger", row: "bg-red-50" },
  new_interest: { label: "New course interest", tone: "warning", row: "bg-amber-50" },
  invalid: { label: "Missing name or phone", tone: "muted", row: "bg-muted/60" },
};

/** Step 3: every row, editable, with duplicates in red and new interests in amber. */
export function PreviewStep({
  fields,
  rows,
  flags,
  onEdit,
  onBack,
  onImport,
  importing,
}: {
  fields: FieldDef[];
  rows: Record<string, string>[];
  flags: RowFlag[];
  onEdit: (index: number, key: string, value: string) => void;
  onBack: () => void;
  onImport: () => void;
  importing: boolean;
}) {
  const counts = flags.reduce<Record<RowFlag, number>>(
    (acc, f) => ({ ...acc, [f]: acc[f] + 1 }),
    { ok: 0, duplicate: 0, new_interest: 0, invalid: 0 },
  );
  const shown = fields.slice(0, 6);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Badge tone="success">{counts.ok} will be imported</Badge>
        {counts.duplicate > 0 && <Badge tone="danger">{counts.duplicate} already leads</Badge>}
        {counts.new_interest > 0 && <Badge tone="warning">{counts.new_interest} existing, new interest</Badge>}
        {counts.invalid > 0 && <Badge tone="muted">{counts.invalid} incomplete</Badge>}
      </div>
      <p className="text-sm text-muted-foreground">
        Only new rows are imported. Fix a phone number here and the row turns green. Rows in red are already with a
        counsellor, so they are left alone.
      </p>

      <div className="max-h-[28rem] overflow-auto rounded-xl border bg-card">
        <Table>
          <TableHeader className="sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              {shown.map((f) => (
                <TableHead key={f.key}>{f.label}</TableHead>
              ))}
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i} className={cn(FLAG[flags[i]].row)}>
                <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                {shown.map((f) => (
                  <TableCell key={f.key} className="p-1.5">
                    <Input
                      aria-label={`${f.label} row ${i + 1}`}
                      value={row[f.key] ?? ""}
                      onChange={(e) => onEdit(i, f.key, e.target.value)}
                      className="h-8 min-w-[9rem] border-transparent bg-transparent px-2 text-sm hover:border-input focus-visible:bg-card"
                    />
                  </TableCell>
                ))}
                <TableCell>
                  <Badge tone={FLAG[flags[i]].tone}>{FLAG[flags[i]].label}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} disabled={importing}>
          Back
        </Button>
        <Button onClick={onImport} loading={importing} disabled={counts.ok === 0}>
          Import {counts.ok} {counts.ok === 1 ? "lead" : "leads"}
        </Button>
      </div>
    </div>
  );
}
