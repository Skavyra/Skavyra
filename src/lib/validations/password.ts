import { z } from "zod";

/** One password rule for sign up, reset, change and staff accounts. */
export const PASSWORD_MIN = 10;

const COMMON = new Set([
  "password12", "password123", "1234567890", "12345678910", "qwertyuiop", "iloveyou12", "welcome123", "admin12345",
  "skavyra123", "letmein1234", "abc1234567", "password1!",
]);

/** Returns a sentence describing the problem, or null when the password is acceptable. */
export function passwordProblem(password: string): string | null {
  if (password.length < PASSWORD_MIN) return `Use a password of at least ${PASSWORD_MIN} characters.`;
  if (password.length > 128) return "Use a password under 128 characters.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "Include at least one letter and one number.";
  if (COMMON.has(password.toLowerCase())) return "That password is too common. Choose another.";
  return null;
}

export const passwordSchema = z.string().superRefine((value, ctx) => {
  const problem = passwordProblem(value);
  if (problem) ctx.addIssue({ code: z.ZodIssueCode.custom, message: problem });
});
