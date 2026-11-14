"use client";

import { useMemo, useState } from "react";

import type { ImportPlan } from "@/actions/leads";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { Counsellor } from "../DistributeDialog";

type Mode = "even" | "counts" | "manual" | "none";

const MODES: { value: Mode; label: string; hint: string }[] = [
  { value: "even", label: "Split evenly", hint: "Share the leads equally between the counsellors you tick." },
  { value: "counts", label: "Set a number each", hint: "For example 40 to one, 30 to another. Any left over stay unassigned." },
  { value: "manual", label: "Pick by hand", hint: "Tick leads yourself and give them to a counsellor." },
  { value: "none", label: "Leave unassigned", hint: "Import now and assign later from the Leads page." },
];

/** Step 4: decide who gets which of the checked rows, then confirm. Nothing is saved until Confirm. */
export function AssignStep({
  rows,
  counsellors,
  onBack,
  onConfirm,
  confirming,
}: {
  /** Only the rows that will be imported. */
  rows: Record<string, string>[];
  counsellors: Counsellor[];
  onBack: () => void;
  onConfirm: (plan: ImportPlan) => void;
  confirming: boolean;
}) {
  const [mode, setMode] = useState<Mode>("even");
  const [picked, setPicked] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [manual, setManual] = useState<Record<number, string>>({});
  const [ticked, setTicked] = useState<Set<number>>(new Set());
  const [target, setTarget] = useState("");

  const nameOf = (id: string) => counsellors.find((c) => c.id === id)?.name ?? "";

  /** row index -> counsellor id, for the current mode. */
  const assignment = useMemo(() => {
    const map = new Map<number, string>();
    if (mode === "even" && picked.length > 0) {
      rows.forEach((_, i) => map.set(i, picked[i % picked.length]));
    } else if (mode === "counts") {
      let next = 0;
      for (const id of picked) {
        const n = Math.max(0, Math.floor(Number(counts[id]) || 0));
        for (let k = 0; k < n && next < rows.length; k++) map.set(next++, id);
      }
    } else if (mode === "manual") {
      for (const [i, id] of Object.entries(manual)) if (id) map.set(Number(i), id);
    }
    return map;
  }, [mode, picked, counts, manual, rows]);

  const requested = mode === "counts" ? picked.reduce((s, id) => s + Math.max(0, Math.floor(Number(counts[id]) || 0)), 0) : 0;
  const tooMany = mode === "counts" && requested > rows.length;
  const nothing = mode !== "none" && assignment.size === 0;

  const perPerson = new Map<string, number>();
  assignment.forEach((id) => perPerson.set(id, (perPerson.get(id) ?? 0) + 1));

  function buildPlan(): ImportPlan {
    const byId = new Map<string, string[]>();
    assignment.forEach((id, i) => byId.set(id, [...(byId.get(id) ?? []), rows[i].phone ?? ""]));
    return [...byId.entries()].map(([employee_id, phones]) => ({ employee_id, phones }));
  }

  function togglePicked(id: string, on: boolean) {
    setPicked((p) => (on ? [...p, id] : p.filter((x) => x !== id)));
  }

  function giveTicked() {
    if (!target || ticked.size === 0) return;
    setManual((m) => {
      const next = { ...m };
      ticked.forEach((i) => (next[i] = target));
      return next;
    });
    setTicked(new Set());
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-2 sm:grid-cols-2">
        {MODES.map((m) => (
          <label
            key={m.value}
            className={cn(
              "flex cursor-pointer flex-col gap-0.5 rounded-xl border p-3 text-sm",
              mode === m.value ? "border-gold-500 bg-gold-100/40" : "hover:bg-muted",
            )}
          >
            <span className="flex items-center gap-2 font-semibold">
              <input type="radio" name="assign-mode" checked={mode === m.value} onChange={() => setMode(m.value)} />
              {m.label}
            </span>
            <span className="pl-6 text-muted-foreground">{m.hint}</span>
          </label>
        ))}
      </div>

      {mode !== "none" && mode !== "manual" && (
        <div className="rounded-xl border bg-card p-3">
          <p className="mb-2 text-sm font-semibold">Counsellors</p>
          {counsellors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active counsellors yet. Add one under Employees first.</p>
          ) : (
            <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
              {counsellors.map((c) => (
                <li key={c.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-muted">
                  <label className="flex flex-1 cursor-pointer items-center gap-3">
                    <Checkbox checked={picked.includes(c.id)} onCheckedChange={(v) => togglePicked(c.id, v === true)} />
                    <span className="flex-1">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.openLeads} open</span>
                  </label>
                  {mode === "counts" && picked.includes(c.id) && (
                    <Input
                      aria-label={`Leads for ${c.name}`}
                      inputMode="numeric"
                      placeholder="0"
                      value={counts[c.id] ?? ""}
                      onChange={(e) => setCounts((s) => ({ ...s, [c.id]: e.target.value.replace(/\D/g, "") }))}
                      className="h-8 w-20 text-right"
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {mode === "manual" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3 text-sm">
            <span className="font-semibold">{ticked.size} ticked</span>
            <NativeSelect value={target} onChange={(e) => setTarget(e.target.value)} className="h-9 w-56 text-sm" aria-label="Counsellor for the ticked leads">
              <option value="">Choose counsellor…</option>
              {counsellors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </NativeSelect>
            <Button size="sm" onClick={giveTicked} disabled={!target || ticked.size === 0}>
              Give ticked leads
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setTicked(new Set(rows.map((_, i) => i).filter((i) => !manual[i])))}>
              Tick all unassigned
            </Button>
          </div>
          <div className="max-h-[24rem] overflow-auto rounded-xl border bg-card">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Counsellor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Checkbox
                        checked={ticked.has(i)}
                        onCheckedChange={(v) =>
                          setTicked((s) => {
                            const next = new Set(s);
                            if (v === true) next.add(i);
                            else next.delete(i);
                            return next;
                          })
                        }
                        aria-label={`Tick ${r.full_name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{r.full_name}</TableCell>
                    <TableCell className="font-mono text-sm">{r.phone}</TableCell>
                    <TableCell className={manual[i] ? "" : "text-muted-foreground"}>{manual[i] ? nameOf(manual[i]) : "Unassigned"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-muted p-3 text-sm">
        {mode === "none" ? (
          <>{rows.length} leads will be imported and left unassigned.</>
        ) : (
          <>
            <strong>{assignment.size}</strong> of {rows.length} leads will be assigned
            {rows.length - assignment.size > 0 ? `, ${rows.length - assignment.size} left unassigned` : ""}.
            {perPerson.size > 0 && (
              <span className="mt-1 block text-muted-foreground">
                {[...perPerson.entries()].map(([id, n]) => `${nameOf(id)}: ${n}`).join(" · ")}
              </span>
            )}
            {tooMany && <span className="mt-1 block font-medium text-destructive">You asked for {requested} but only {rows.length} leads are being imported.</span>}
          </>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} disabled={confirming}>
          Back
        </Button>
        <Button onClick={() => onConfirm(mode === "none" ? [] : buildPlan())} loading={confirming} disabled={nothing || tooMany}>
          Confirm and import {rows.length} {rows.length === 1 ? "lead" : "leads"}
        </Button>
      </div>
    </div>
  );
}
