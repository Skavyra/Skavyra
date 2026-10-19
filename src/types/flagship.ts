import type { Course } from "@/types";

export type FlagshipCourse = Pick<
  Course,
  | "id"
  | "slug"
  | "title"
  | "subtitle"
  | "description"
  | "category"
  | "level"
  | "cover_image_url"
  | "price"
  | "mrp"
  | "duration_weeks"
  | "mentor_name"
  | "mentor_company"
  | "learning_outcomes"
  | "sort_order"
> & {
  is_flagship: boolean;
  offer_label: string | null;
  offer_price: number | null;
  offer_ends_at: string | null;
  show_countdown: boolean;
  tools: string[];
  language: string | null;
};
