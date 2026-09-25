import { z } from "zod";

import { optionalDate, optionalEmail, optionalPhone, optionalText, optionalYear, phone10 } from "./common";

const leadStatus = z.enum([
  "new",
  "interested",
  "follow_up",
  "callback_requested",
  "called_no_response",
  "not_interested",
  "invalid_contact",
  "enrolled",
]);

export const leadCreateSchema = z.object({
  full_name: z.string().trim().min(1, "Enter the student's name"),
  phone: phone10,
  alt_phone: optionalPhone,
  email: optionalEmail,
  college_name: optionalText,
  degree: optionalText,
  branch: optionalText,
  current_year: optionalYear,
  city: optionalText,
  state: optionalText,
  interested_course_text: optionalText,
  remarks: optionalText,
});

export const leadUpdateSchema = leadCreateSchema.extend({
  status: leadStatus,
  follow_up_on: optionalDate,
});

export const paymentProofSchema = z.object({
  amount: z.coerce.number().positive("Enter the amount received"),
  transaction_ref: z.string().trim().min(4, "Enter the UPI reference or UTR"),
  purpose: z.enum(["registration", "installment", "full", "balance"]),
});

export type LeadCreateInput = z.infer<typeof leadCreateSchema>;
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;
