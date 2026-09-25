import { z } from "zod";

export const optionalText = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional();

/** Ten digits, as the student_leads.phone check requires. */
export const phone10 = z
  .string()
  .transform((v) => {
    const d = v.replace(/\D/g, "");
    return d.length > 10 ? d.slice(-10) : d;
  })
  .refine((v) => /^[0-9]{10}$/.test(v), "Enter a 10 digit mobile number");

export const optionalPhone = z
  .string()
  .trim()
  .transform((v) => {
    const d = v.replace(/\D/g, "");
    return d === "" ? null : d.length > 10 ? d.slice(-10) : d;
  })
  .refine((v) => v === null || /^[0-9]{10}$/.test(v), "Enter a 10 digit mobile number")
  .nullable()
  .optional();

export const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .transform((v) => (v === "" ? null : v))
  .refine((v) => v === null || z.string().email().safeParse(v).success, "Enter a valid email")
  .nullable()
  .optional();

export const optionalYear = z
  .union([z.string(), z.number()])
  .transform((v) => (v === "" || v === null ? null : Number(v)))
  .refine((v) => v === null || (Number.isInteger(v) && v >= 1980 && v <= 2100), "Enter a year like 2024")
  .nullable()
  .optional();

export const optionalDate = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional();

/** Pulls the first zod message so forms can show one clear line. */
export function firstError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Check the form and try again.";
}

/** FormData -> plain object of strings (checkboxes arrive as "on"). */
export function formToObject(formData: FormData) {
  const out: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") out[key] = value;
  });
  return out;
}
