import { z } from "zod";

import { optionalText } from "./common";

const money = z.coerce.number().min(0, "Amount cannot be negative");

// Unmounted optional inputs are absent from FormData; blank inputs are strings.
const optionalNumber = (schema: z.ZodNumber) => z.preprocess(
  (value) => value == null || (typeof value === "string" && value.trim() === "") ? null : value,
  schema.nullable(),
);

export const courseSchema = z
  .object({
    title: z.string().trim().min(1, "Enter a course title"),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
    subtitle: optionalText,
    description: optionalText,
    learning_outcomes: optionalText,
    target_audience: optionalText,
    prerequisites: optionalText,
    projects: optionalText,
    mentor_bio: optionalText,
    category: z.enum(["it", "non_it", "both"]),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    price: money,
    mrp: optionalNumber(z.coerce.number({ invalid_type_error: "Enter a valid amount" }).finite().min(0, "Amount cannot be negative")),
    duration_weeks: optionalNumber(z.coerce.number({ invalid_type_error: "Enter a number of weeks" }).finite().int("Enter a whole number of weeks").positive("Duration must be at least 1 week")),
    language: optionalText,
    mentor_name: optionalText,
    mentor_company: optionalText,
    allows_partial: z.boolean(),
    min_first_payment: optionalNumber(z.coerce.number({ invalid_type_error: "Enter a valid amount" }).finite().min(0, "Amount cannot be negative")),
    sort_order: z.coerce.number().int(),
  })
  .refine((v) => v.mrp === null || v.mrp >= v.price, { message: "MRP must be at least the price", path: ["mrp"] });

export function courseValidationError(error: z.ZodError) {
  const issue = error.issues[0];
  if (!issue) return "Check the course details and try again.";
  const labels: Record<string, string> = {
    title: "Title", slug: "URL slug", subtitle: "Short line", description: "Course overview",
    category: "Stream", level: "Level", price: "Fee", mrp: "MRP",
    duration_weeks: "Duration in weeks", language: "Language", mentor_name: "Mentor name",
    mentor_company: "Mentor company", allows_partial: "Allow installments",
    min_first_payment: "Smallest first payment", sort_order: "Sort order",
    learning_outcomes: "What students will learn", target_audience: "Who this course is for",
    prerequisites: "Prerequisites", projects: "Projects students will build", mentor_bio: "Mentor biography",
  };
  const label = labels[String(issue.path[0])] ?? "Course details";
  return `${label}: ${issue.message}`;
}

export const moduleSchema = z.object({
  title: z.string().trim().min(1, "Enter a module title"),
  summary: optionalText,
});

export const lessonSchema = z
  .object({
    title: z.string().trim().min(1, "Enter a lesson title"),
    description: optionalText,
    lesson_type: z.enum(["video", "document", "live_class", "link"]),
    provider: z.enum(["drive", "supabase", "bunny", "youtube", "zoom", "other"]),
    content_url: optionalText,
    storage_path: optionalText,
    duration_minutes: z.coerce.number().int().min(0),
    scheduled_at: optionalText,
    is_preview: z.boolean(),
    is_published: z.boolean(),
  })
  // mirrors the lessons_need_source check constraint
  .refine((v) => v.lesson_type === "live_class" || v.content_url || v.storage_path, {
    message: "Add a link or upload a file. Only live classes can be saved without one.",
    path: ["content_url"],
  });
