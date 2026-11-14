"use client";

import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { LEAD_STATUSES } from "@/lib/constants";
import { PERIODS } from "@/lib/reports/compute";

/** Period, counsellor and status. Everything is written to the URL so a report can be shared or reloaded. */
export function ReportFilters({ employees }: { employees: { id: string; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function push(patch: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const period = params.get("period") ?? "30d";
  const filtered = ["period", "from", "to", "employee", "status"].some((k) => params.get(k));

  return (
    <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border bg-card p-3">
      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Period
        <NativeSelect value={period} onChange={(e) => push({ period: e.target.value, from: "", to: "" })} className="w-44 text-sm normal-case">
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </NativeSelect>
      </label>

      {period === "custom" && (
        <>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            From
            <Input type="date" value={params.get("from") ?? ""} onChange={(e) => push({ from: e.target.value })} className="w-40 text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            To
            <Input type="date" value={params.get("to") ?? ""} onChange={(e) => push({ to: e.target.value })} className="w-40 text-sm" />
          </label>
        </>
      )}

      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Counsellor
        <NativeSelect value={params.get("employee") ?? ""} onChange={(e) => push({ employee: e.target.value })} className="w-52 text-sm normal-case">
          <option value="">Everyone</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </NativeSelect>
      </label>

      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Status
        <NativeSelect value={params.get("status") ?? ""} onChange={(e) => push({ status: e.target.value })} className="w-48 text-sm normal-case">
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </NativeSelect>
      </label>

      {filtered && (
        <Button variant="ghost" size="sm" onClick={() => router.push(pathname, { scroll: false })}>
          <X /> Reset
        </Button>
      )}
    </div>
  );
}
