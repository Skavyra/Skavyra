import { z } from "zod";

import { optionalPhone, optionalText } from "./common";

export const offerLetterSchema = z.object({
  candidate_name: z.string().trim().min(1, "Enter the candidate's name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: optionalPhone,
  role_title: z.string().trim().min(1, "Enter the role"),
  department: optionalText,
  employment_type: z.enum(["intern", "full_time", "contract"]),
  ctc_amount: z.coerce.number().min(0, "Salary cannot be negative"),
  ctc_period: z.enum(["month", "year", "total"]),
  joining_date: z.string().min(1, "Pick a joining date"),
  issue_date: z.string().min(1, "Pick an issue date"),
  work_location: optionalText,
  reporting_manager_id: optionalText,
  reporting_manager_name: optionalText,
});

export type OfferLetterInput = z.infer<typeof offerLetterSchema>;
