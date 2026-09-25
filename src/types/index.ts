import type { Enums, Tables, Views } from "./database.types";

export type { Database, Json, Tables, TablesInsert, TablesUpdate, Enums, Views } from "./database.types";

export type AppRole = Enums<"app_role">;
export type LeadStatus = Enums<"lead_status">;
export type CourseCategory = Enums<"course_category">;
export type CourseLevel = Enums<"course_level">;
export type CourseStatus = Enums<"course_status">;
export type LessonType = Enums<"lesson_type">;
export type MediaProvider = Enums<"media_provider">;
export type PaymentPlan = Enums<"payment_plan">;
export type AccessStatus = Enums<"access_status">;
export type LetterStatus = Enums<"letter_status">;

export type Profile = Tables<"profiles">;
export type Course = Tables<"courses">;
export type CourseModule = Tables<"course_modules">;
export type Lesson = Tables<"lessons">;
export type LessonResource = Tables<"lesson_resources">;
export type Enrollment = Tables<"enrollments">;
export type Installment = Tables<"installments">;
export type Payment = Tables<"payments">;
export type Certificate = Tables<"certificates">;
export type StudentLead = Tables<"student_leads">;
export type LeadActivity = Tables<"lead_activities">;
export type OfferLetter = Tables<"offer_letters">;
export type OfferLetterTemplate = Tables<"offer_letter_templates">;
export type OutlineRow = Views<"course_outline">;

/** Result shape every server action returns, so forms handle errors the same way. */
export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

export type SessionUser = {
  id: string;
  email: string;
  roles: AppRole[];
  profile: Profile | null;
};
