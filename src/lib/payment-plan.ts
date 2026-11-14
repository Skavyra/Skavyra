/**
 * The fee rules, in one place. The database enforces the same numbers in create_enrollment() and apply_payment(),
 * so change both together.
 *
 *   fee below ₹20,000       pay in full
 *   fee ₹20,000 or above    pay in full, or 30% now and the other 70% within 10 days of that first payment
 */
export const PAYMENT_RULES = {
  /** Fees at or above this may be split in two. */
  splitFromFee: 20000,
  firstPercent: 30,
  balanceDays: 10,
} as const;

export function canSplit(fee: number) {
  return fee >= PAYMENT_RULES.splitFromFee;
}

/** The two amounts of a split plan, rounded to paise so they add up exactly. */
export function splitAmounts(fee: number) {
  const first = Math.round(fee * PAYMENT_RULES.firstPercent) / 100;
  return { first, balance: Math.round((fee - first) * 100) / 100 };
}

/** A pending installment past its due date is overdue, even if nothing has flipped its stored status yet. */
export function effectiveInstallmentStatus(status: string, dueDate: string | null) {
  if (status !== "pending" || !dueDate) return status;
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  return dueDate < today ? "overdue" : status;
}

/* ---------- what a counsellor may log for one lead and one course ---------- */

export type PayKind = "full" | "first" | "balance";
export type LoggedPayment = { purpose: string; amount: number | string; status: string; created_at: string };

/** The payment's purpose column holds the kind: the first 30% is stored as "registration". */
export const PURPOSE_OF: Record<PayKind, "full" | "registration" | "balance"> = {
  full: "full",
  first: "registration",
  balance: "balance",
};

export type PayOption = { kind: PayKind; label: string; amount: number };

/**
 * The payments a counsellor may log next. The amount is never typed: it comes from the course fee and from what is
 * already logged (pending or verified), so a partial or made-up figure cannot be entered.
 */
export function paymentOptions(fee: number, logged: LoggedPayment[]): { options: PayOption[]; balanceDueBy: string | null; note: string | null } {
  const live = logged.filter((p) => p.status !== "failed" && p.status !== "refunded");
  const paid = live.reduce((s, p) => s + Number(p.amount), 0);
  const first = live
    .filter((p) => p.purpose === PURPOSE_OF.first)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))[0];

  if (live.some((p) => p.purpose === PURPOSE_OF.full) || paid >= fee) {
    return { options: [], balanceDueBy: null, note: "The full fee is already logged for this course." };
  }

  if (first) {
    const due = new Date(first.created_at);
    due.setDate(due.getDate() + PAYMENT_RULES.balanceDays);
    return {
      options: [{ kind: "balance", label: `Balance (${100 - PAYMENT_RULES.firstPercent}%)`, amount: Math.round((fee - paid) * 100) / 100 }],
      balanceDueBy: due.toISOString(),
      note: null,
    };
  }

  const options: PayOption[] = [{ kind: "full", label: "Full fee", amount: fee }];
  if (canSplit(fee)) options.push({ kind: "first", label: `First ${PAYMENT_RULES.firstPercent}%`, amount: splitAmounts(fee).first });
  return {
    options,
    balanceDueBy: null,
    note: canSplit(fee) ? null : `Fees below ₹${PAYMENT_RULES.splitFromFee.toLocaleString("en-IN")} are paid in full.`,
  };
}

export const PLAN_SUMMARY = `Pay in full, or ${PAYMENT_RULES.firstPercent}% now and the rest within ${PAYMENT_RULES.balanceDays} days.`;
