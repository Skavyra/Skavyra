type OutlineProgressRow = { course_id: string | null; lesson_id: string | null };
type LessonProgressRow = { lesson_id: string; completed: boolean };

export type CourseProgress = { total: number; done: number };

/** One dashboard progress calculation shared by the dashboard and My Courses. */
export function calculateCourseProgress(
  outline: readonly OutlineProgressRow[],
  progress: readonly LessonProgressRow[],
) {
  const completedLessons = new Set(progress.filter((row) => row.completed).map((row) => row.lesson_id));
  const byCourse = new Map<string, CourseProgress>();
  const seen = new Set<string>();

  for (const row of outline) {
    if (!row.course_id || !row.lesson_id) continue;
    const key = `${row.course_id}:${row.lesson_id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const course = byCourse.get(row.course_id) ?? { total: 0, done: 0 };
    course.total += 1;
    if (completedLessons.has(row.lesson_id)) course.done += 1;
    byCourse.set(row.course_id, course);
  }

  return {
    byCourse,
    totalLessons: [...byCourse.values()].reduce((sum, course) => sum + course.total, 0),
    completedLessons: [...byCourse.values()].reduce((sum, course) => sum + course.done, 0),
  };
}
