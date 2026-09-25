import { z } from "zod";

import { optionalDate, optionalPhone, optionalText } from "./common";

/** Body for the create-user edge function. */
export const createStaffSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z
    .string()
    .transform((v) => (v === "" ? undefined : v))
    .refine((v) => v === undefined || v.length >= 10, "Password must be at least 10 characters, or leave it empty to send an invite")
    .optional(),
  role: z.enum(["employee", "admin", "student"]),
  first_name: z.string().trim().min(1, "Enter a first name"),
  last_name: z.string().trim(),
  phone: optionalPhone,
  employee_code: optionalText,
  designation: optionalText,
  department: optionalText,
  date_of_joining: optionalDate,
  reporting_manager_id: optionalText,
});
