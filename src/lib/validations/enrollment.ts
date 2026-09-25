import { z } from "zod";

export const installmentRowSchema = z.object({
  seq: z.number().int().positive(),
  label: z.string().trim().optional(),
  amount: z.number().positive("Each installment needs an amount"),
  due_date: z.string().optional(),
});

export const enrollmentSchema = z
  .object({
    user_id: z.string().uuid("Pick a student"),
    course_id: z.string().uuid("Pick a course"),
    plan: z.enum(["full", "partial"]),
    total_amount: z.number().min(0),
    installments: z.array(installmentRowSchema),
    lead_id: z.string().uuid().nullable().optional(),
  })
  .refine((v) => v.plan === "full" || v.installments.length > 0, {
    message: "Add at least one installment",
    path: ["installments"],
  })
  .refine(
    (v) =>
      v.plan === "full" ||
      Math.abs(v.installments.reduce((s, i) => s + i.amount, 0) - v.total_amount) < 0.005,
    { message: "Installments must add up to the total", path: ["installments"] },
  );

export type EnrollmentInput = z.infer<typeof enrollmentSchema>;
