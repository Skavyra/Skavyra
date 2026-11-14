import { MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDate, formatPhone } from "@/lib/utils";
import type { StudentLead } from "@/types";

/** Read-only view of a lead, for roles that may see leads but not edit them. */
export function LeadSummary({ lead, courses }: { lead: StudentLead; courses: { id: string; title: string }[] }) {
  const rows: [string, React.ReactNode][] = [
    ["Phone", formatPhone(lead.phone)],
    ["Alternate phone", lead.alt_phone ? formatPhone(lead.alt_phone) : "—"],
    ["Email", lead.email || "—"],
    ["College", lead.college_name || "—"],
    ["Degree", [lead.degree, lead.branch].filter(Boolean).join(" · ") || "—"],
    ["City", [lead.city, lead.state].filter(Boolean).join(", ") || "—"],
    ["Interested in", courses.length > 0 ? courses.map((c) => c.title).join(", ") : lead.interested_course_text || "—"],
    ["Follow up", formatDate(lead.follow_up_on)],
    ["Last contacted", formatDate(lead.last_contacted_at)],
    ["Attempts", String(lead.attempts_count)],
    ["Remarks", lead.remarks || "—"],
  ];
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm">
          <a href={`tel:+91${lead.phone}`}>
            <Phone /> Call
          </a>
        </Button>
        <Button asChild size="sm" variant="outline">
          <a href={`https://wa.me/91${lead.phone}`} target="_blank" rel="noreferrer">
            <MessageCircle /> WhatsApp
          </a>
        </Button>
      </div>
      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className={label === "Remarks" || label === "Interested in" ? "sm:col-span-2" : undefined}>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 whitespace-pre-wrap break-words">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
