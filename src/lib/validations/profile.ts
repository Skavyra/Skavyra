import { z } from "zod";

import { optionalPhone, optionalText, optionalYear } from "./common";

export const profileSchema = z.object({
  first_name: z.string().trim().min(1, "Enter your first name"),
  last_name: z.string().trim(),
  phone: optionalPhone,
  college_name: optionalText,
  degree: optionalText,
  branch: optionalText,
  started_year: optionalYear,
  passing_out_year: optionalYear,
  city: optionalText,
  state: optionalText,
});

export const passwordSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match", path: ["confirm"] });
