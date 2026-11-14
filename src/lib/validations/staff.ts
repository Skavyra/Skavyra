import { z } from "zod";

import { passwordProblem } from "./password";

import { optionalDate, optionalPhone, optionalText } from "./common";

/** Body for the create-user edge function. */
export const createStaffSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z
    .string()
    .transform((v) => (v === "" ? undefined : v))
    .refine((v) => v === undefined || passwordProblem(v) === null, (v) => ({ message: (v ? passwordProblem(v) : null) ?? "Choose a stronger password, or leave it empty to send an invite" }))
    .optional(),
  role: z.enum(["employee", "admin", "student", "hr"]),
  first_name: z.string().trim().min(1, "Enter a first name"),
  last_name: z.string().trim(),
  phone: optionalPhone,
  employee_code: optionalText,
  designation: optionalText,
  department: optionalText,
  date_of_joining: optionalDate,
  reporting_manager_id: optionalText,
});
