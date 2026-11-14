import { z } from "zod";

import { canSplit, PAYMENT_RULES } from "@/lib/payment-plan";

/**
 * The installment plan is no longer typed in by hand: a split is always the first 30% and the remaining 70%,
 * built by create_enrollment(). `installments` is kept only so older callers still type-check.
 */
export const enrollmentSchema = z
  .object({
    user_id: z.string().uuid("Pick a student"),
    course_id: z.string().uuid("Pick a course"),
    plan: z.enum(["full", "partial"]),
    total_amount: z.number().min(0),
    installments: z.array(z.unknown()).optional(),
    lead_id: z.string().uuid().nullable().optional(),
  })
  .refine((v) => v.plan === "full" || canSplit(v.total_amount), {
    message: `Fees below ₹${PAYMENT_RULES.splitFromFee.toLocaleString("en-IN")} must be paid in full`,
    path: ["plan"],
  });

export type EnrollmentInput = z.infer<typeof enrollmentSchema>;
