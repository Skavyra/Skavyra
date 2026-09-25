import { LEAD_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { LeadStatus } from "@/types";

export type ActivityRow = {
  id: string;
  action: string;
  old_status: LeadStatus | null;
  new_status: LeadStatus | null;
  notes: string | null;
  created_at: string;
  actor_name?: string | null;
};

const label = (s: LeadStatus | null) => (s ? (LEAD_STATUSES.find((x) => x.value === s)?.label ?? s) : "");

function describe(row: ActivityRow) {
  switch (row.action) {
    case "created":
      return "Lead created";
    case "status_changed":
      return `Status changed from ${label(row.old_status)} to ${label(row.new_status)}`;
    case "reassigned":
      return "Reassigned to another counsellor";
    case "updated":
      return "Details updated";
    default:
      return row.action.replace(/_/g, " ");
  }
}

/** Written by the lead_activity_trg trigger plus the updates the app records. */
export function ActivityTimeline({ rows }: { rows: ActivityRow[] }) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">Nothing recorded yet.</p>;
  return (
    <ol className="flex flex-col gap-4">
      {rows.map((row) => (
        <li key={row.id} className="relative border-l pl-5">
          <span className="absolute -left-[5px] top-1.5 size-2.5 rounded-full bg-gold-300" aria-hidden="true" />
          <p className="text-sm font-semibold">{describe(row)}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(row.created_at, true)}
            {row.actor_name ? ` · ${row.actor_name}` : ""}
          </p>
          {row.notes && row.action !== "reassigned" && <p className="mt-1 text-sm text-muted-foreground">{row.notes}</p>}
        </li>
      ))}
    </ol>
  );
}
