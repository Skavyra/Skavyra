import { z } from "zod";

import { optionalText } from "./common";

const money = z.coerce.number().min(0, "Amount cannot be negative");

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
    category: z.enum(["it", "non_it", "both"]),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    price: money,
    mrp: z
      .union([z.literal(""), z.coerce.number().min(0)])
      .transform((v) => (v === "" ? null : v))
      .nullable(),
    duration_weeks: z
      .union([z.literal(""), z.coerce.number().int().positive()])
      .transform((v) => (v === "" ? null : v))
      .nullable(),
    language: optionalText,
    mentor_name: optionalText,
    mentor_company: optionalText,
    allows_partial: z.boolean(),
    min_first_payment: z
      .union([z.literal(""), z.coerce.number().min(0)])
      .transform((v) => (v === "" ? null : v))
      .nullable(),
    sort_order: z.coerce.number().int(),
  })
  .refine((v) => v.mrp === null || v.mrp >= v.price, { message: "MRP must be at least the price", path: ["mrp"] });

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
