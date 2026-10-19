import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { FlagshipCourse } from "@/types/flagship";

export function visibleStatuses(): ("published" | "draft")[] {
  return process.env.NODE_ENV !== "production" && process.env.FLAGSHIP_PREVIEW === "1"
    ? ["published", "draft"]
    : ["published"];
}

export async function getFlagshipCourses(): Promise<FlagshipCourse[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("courses")
      .select(
        "id, slug, title, subtitle, description, category, level, cover_image_url, price, mrp, duration_weeks, mentor_name, mentor_company, learning_outcomes, sort_order, is_flagship, offer_label, offer_price, offer_ends_at, show_countdown, tools, language",
      )
      .eq("is_flagship", true)
      .in("status", visibleStatuses())
      .order("sort_order", { ascending: true });

    if (error || !data) return [];

    return data.map((course) => ({
      ...course,
      price: Number(course.price),
      mrp: course.mrp == null ? null : Number(course.mrp),
      offer_price: course.offer_price == null ? null : Number(course.offer_price),
      tools: course.tools ?? [],
    }));
  } catch {
    return [];
  }
}
