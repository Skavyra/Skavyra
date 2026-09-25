import type { AppRole, CourseCategory, CourseLevel, LeadStatus, LessonType, MediaProvider } from "@/types";

export const NAV_ICONS = [
  "LayoutDashboard",
  "BookOpen",
  "CreditCard",
  "Award",
  "User",
  "PhoneCall",
  "UserPlus",
  "TrendingUp",
  "Users",
  "GraduationCap",
  "FileSignature",
  "BarChart3",
  "Settings",
] as const;

export type NavIconName = (typeof NAV_ICONS)[number];

export const SITE = {
  name: "Skavyra",
  tagline: "Learn. Build. Grow.",
  description: "Job-ready courses for IT and non-IT graduates, taught by mentors who work in the field.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export type NavItem = { href: string; label: string; icon: NavIconName };

/** Where each role lands after sign in. Admin wins over employee, employee over student. */
export const ROLE_HOME: Record<AppRole, string> = {
  admin: "/admin",
  employee: "/employee",
  student: "/dashboard",
};

export const PUBLIC_NAV = [
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const STUDENT_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/dashboard/courses", label: "My courses", icon: "BookOpen" },
  { href: "/dashboard/payments", label: "Payments", icon: "CreditCard" },
  { href: "/dashboard/certificates", label: "Certificates", icon: "Award" },
  { href: "/dashboard/profile", label: "Profile", icon: "User" },
];

export const EMPLOYEE_NAV: NavItem[] = [
  { href: "/employee", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/employee/leads", label: "My leads", icon: "PhoneCall" },
  { href: "/employee/leads/new", label: "Add lead", icon: "UserPlus" },
  { href: "/employee/courses", label: "Courses", icon: "BookOpen" },
  { href: "/employee/performance", label: "My performance", icon: "TrendingUp" },
];

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/admin/leads", label: "Leads", icon: "PhoneCall" },
  { href: "/admin/employees", label: "Employees", icon: "Users" },
  { href: "/admin/courses", label: "Courses", icon: "BookOpen" },
  { href: "/admin/students", label: "Students", icon: "GraduationCap" },
  { href: "/admin/payments", label: "Payments", icon: "CreditCard" },
  { href: "/admin/offer-letters", label: "Offer letters", icon: "FileSignature" },
  { href: "/admin/reports", label: "Reports", icon: "BarChart3" },
  { href: "/admin/settings", label: "Settings", icon: "Settings" },
];

export const LEAD_STATUSES: { value: LeadStatus; label: string; tone: Tone }[] = [
  { value: "new", label: "New", tone: "neutral" },
  { value: "interested", label: "Interested", tone: "gold" },
  { value: "follow_up", label: "Follow up", tone: "info" },
  { value: "callback_requested", label: "Callback requested", tone: "info" },
  { value: "called_no_response", label: "No response", tone: "warning" },
  { value: "not_interested", label: "Not interested", tone: "muted" },
  { value: "invalid_contact", label: "Invalid contact", tone: "danger" },
  { value: "enrolled", label: "Enrolled", tone: "success" },
];

/** Statuses that still need work. Mirrors the list deactivate_staff() leaves behind. */
export const OPEN_LEAD_STATUSES: LeadStatus[] = ["new", "interested", "follow_up", "callback_requested", "called_no_response"];

/** Payment proof upload appears only for these, per the lead detail wireframe. */
export const PAYMENT_PROOF_STATUSES: LeadStatus[] = ["interested", "enrolled"];

export type Tone = "neutral" | "gold" | "info" | "warning" | "muted" | "danger" | "success";

export const CATEGORY_LABEL: Record<CourseCategory, string> = { it: "IT", non_it: "Non-IT", both: "IT and non-IT" };
export const LEVEL_LABEL: Record<CourseLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};
export const LESSON_TYPE_LABEL: Record<LessonType, string> = {
  video: "Video",
  document: "Document",
  live_class: "Live class",
  link: "Link",
};
export const PROVIDER_LABEL: Record<MediaProvider, string> = {
  drive: "Google Drive",
  supabase: "Supabase storage",
  bunny: "Bunny",
  youtube: "YouTube",
  zoom: "Zoom",
  other: "Other",
};

export const PAGE_SIZE = 25;

export const BUCKETS = {
  courseCovers: "course-covers",
  brand: "brand",
  lessonResources: "lesson-resources",
  courseVideos: "course-videos",
  paymentProofs: "payment-proofs",
  offerLetters: "offer-letters",
  certificates: "certificates",
} as const;
