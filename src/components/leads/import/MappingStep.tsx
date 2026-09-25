"use client";

import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { FieldDef } from "@/lib/excel/header-match";

/** Step 2: the columns we guessed, all of them changeable. */
export function MappingStep({
  fields,
  headers,
  sample,
  mapping,
  onChange,
  onBack,
  onNext,
}: {
  fields: FieldDef[];
  headers: string[];
  sample: Record<string, string> | undefined;
  mapping: Record<string, string>;
  onChange: (mapping: Record<string, string>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const missingRequired = fields.filter((f) => f.required && !mapping[f.key]);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Skavyra field</TableHead>
              <TableHead>Column in your file</TableHead>
              <TableHead>First row</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((f) => (
              <TableRow key={f.key}>
                <TableCell className="font-semibold">
                  {f.label}
                  {f.required && <span className="ml-1 text-destructive">*</span>}
                </TableCell>
                <TableCell>
                  <NativeSelect
                    aria-label={`Column for ${f.label}`}
                    value={mapping[f.key] ?? ""}
                    onChange={(e) => onChange({ ...mapping, [f.key]: e.target.value })}
                    className="max-w-xs"
                  >
                    <option value="">Not in this file</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </NativeSelect>
                </TableCell>
                <TableCell className="max-w-[16rem] truncate text-muted-foreground">
                  {mapping[f.key] ? (sample?.[mapping[f.key]] || "—") : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {missingRequired.length > 0 && (
        <p className="text-sm font-medium text-destructive">
          Pick a column for: {missingRequired.map((f) => f.label).join(", ")}.
        </p>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={missingRequired.length > 0}>
          Preview rows
        </Button>
      </div>
    </div>
  );
}
