import type { Metadata } from "next";

import { CoursesView, type CourseSearch } from "@/components/panels/CoursesView";

export const metadata: Metadata = { title: "Courses" };

export default async function EmployeeCoursesPage({ searchParams }: { searchParams: Promise<CourseSearch> }) {
  return <CoursesView roles={["employee"]} params={await searchParams} />;
}
