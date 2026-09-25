import { Badge } from "@/components/ui/badge";
import { LEAD_STATUSES, type Tone } from "@/lib/constants";
import type { AccessStatus, LeadStatus, LetterStatus } from "@/types";

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const item = LEAD_STATUSES.find((s) => s.value === status);
  return <Badge tone={item?.tone ?? "neutral"}>{item?.label ?? status}</Badge>;
}

const ACCESS: Record<AccessStatus, { label: string; tone: Tone }> = {
  active: { label: "Active", tone: "success" },
  suspended: { label: "Suspended", tone: "warning" },
  completed: { label: "Completed", tone: "gold" },
  refunded: { label: "Refunded", tone: "muted" },
};

export function AccessBadge({ status }: { status: AccessStatus }) {
  return <Badge tone={ACCESS[status].tone}>{ACCESS[status].label}</Badge>;
}

const PAYMENT: Record<string, { label: string; tone: Tone }> = {
  created: { label: "Created", tone: "neutral" },
  pending: { label: "Awaiting verification", tone: "warning" },
  success: { label: "Verified", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
  refunded: { label: "Refunded", tone: "muted" },
};

export function PaymentBadge({ status }: { status: string }) {
  const item = PAYMENT[status] ?? { label: status, tone: "neutral" as Tone };
  return <Badge tone={item.tone}>{item.label}</Badge>;
}

const LETTER: Record<LetterStatus, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "neutral" },
  generated: { label: "Generated", tone: "info" },
  sent: { label: "Sent", tone: "gold" },
  accepted: { label: "Accepted", tone: "success" },
  declined: { label: "Declined", tone: "danger" },
  revoked: { label: "Revoked", tone: "danger" },
};

export function LetterBadge({ status }: { status: LetterStatus }) {
  return <Badge tone={LETTER[status].tone}>{LETTER[status].label}</Badge>;
}

const ENROLLMENT_PAYMENT: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "Unpaid", tone: "warning" },
  partial: { label: "Part paid", tone: "info" },
  paid: { label: "Paid", tone: "success" },
  refunded: { label: "Refunded", tone: "muted" },
};

export function EnrollmentPaymentBadge({ status }: { status: string }) {
  const item = ENROLLMENT_PAYMENT[status] ?? { label: status, tone: "neutral" as Tone };
  return <Badge tone={item.tone}>{item.label}</Badge>;
}
