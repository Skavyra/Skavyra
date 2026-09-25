"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { useDebounce } from "@/hooks/use-debounce";

export type FilterDef = { key: string; label: string; options: { value: string; label: string }[] };

/**
 * Search and dropdowns that write straight to the URL, so a filtered table can
 * be bookmarked, shared and reloaded. Typing is debounced.
 */
export function SearchFilters({
  placeholder = "Search",
  filters = [],
  children,
}: {
  placeholder?: string;
  filters?: FilterDef[];
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [term, setTerm] = useState(params.get("q") ?? "");
  const debounced = useDebounce(term);

  function push(patch: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  }

  useEffect(() => {
    if (debounced === (params.get("q") ?? "")) return;
    push({ q: debounced });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const active = filters.some((f) => params.get(f.key)) || params.get("q");

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative min-w-[12rem] flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="pl-9"
        />
      </div>
      {filters.map((f) => (
        <NativeSelect
          key={f.key}
          aria-label={f.label}
          value={params.get(f.key) ?? ""}
          onChange={(e) => push({ [f.key]: e.target.value })}
          className="w-auto min-w-[9rem]"
        >
          <option value="">{f.label}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </NativeSelect>
      ))}
      {active && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setTerm("");
            router.push(pathname);
          }}
        >
          <X /> Clear
        </Button>
      )}
      {children}
    </div>
  );
}
