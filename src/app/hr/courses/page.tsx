import type { Metadata } from "next";

import { CoursesView, type CourseSearch } from "@/components/panels/CoursesView";

export const metadata: Metadata = { title: "Courses" };

export default async function HrCoursesPage({ searchParams }: { searchParams: Promise<CourseSearch> }) {
  return <CoursesView roles={["hr", "admin"]} params={await searchParams} />;
}
