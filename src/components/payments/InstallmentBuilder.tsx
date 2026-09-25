"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatInr } from "@/lib/utils";

export type InstallmentDraft = { seq: number; label: string; amount: number; due_date: string };

/**
 * create_enrollment() rejects a plan whose installments do not add up to the
 * total, so the running total is shown and the difference called out.
 */
export function InstallmentBuilder({
  total,
  rows,
  onChange,
}: {
  total: number;
  rows: InstallmentDraft[];
  onChange: (rows: InstallmentDraft[]) => void;
}) {
  const sum = rows.reduce((s, r) => s + (Number.isFinite(r.amount) ? r.amount : 0), 0);
  const diff = Number((total - sum).toFixed(2));

  const update = (index: number, patch: Partial<InstallmentDraft>) =>
    onChange(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <li key={i} className="grid grid-cols-[1fr_7rem_9rem_2.5rem] items-end gap-2">
            <Input
              aria-label={`Installment ${i + 1} label`}
              placeholder={i === 0 ? "Registration" : `Installment ${i + 1}`}
              value={row.label}
              onChange={(e) => update(i, { label: e.target.value })}
            />
            <Input
              aria-label={`Installment ${i + 1} amount`}
              inputMode="decimal"
              value={row.amount || ""}
              onChange={(e) => update(i, { amount: Number(e.target.value) || 0 })}
            />
            <Input
              aria-label={`Installment ${i + 1} due date`}
              type="date"
              value={row.due_date}
              onChange={(e) => update(i, { due_date: e.target.value })}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove installment ${i + 1}`}
              onClick={() => onChange(rows.filter((_, x) => x !== i).map((r, x) => ({ ...r, seq: x + 1 })))}
            >
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange([
              ...rows,
              { seq: rows.length + 1, label: "", amount: diff > 0 ? diff : 0, due_date: "" },
            ])
          }
        >
          <Plus /> Add installment
        </Button>
        <p className={cn("text-sm", diff === 0 ? "text-success" : "text-destructive")}>
          {formatInr(sum)} of {formatInr(total)}
          {diff !== 0 ? ` · ${formatInr(Math.abs(diff))} ${diff > 0 ? "still to allocate" : "over the total"}` : " · adds up"}
        </p>
      </div>
    </div>
  );
}
