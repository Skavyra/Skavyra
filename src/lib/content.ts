/**
 * Marketing copy for the public site, kept in one place so the client can edit
 * it without touching components. Nothing here is a claim that needs proof:
 * no rankings, no placement percentages, no invented student numbers.
 */
import type { CourseCategory } from "@/types";

export const HERO = {
  badge: "Courses for IT and non-IT graduates",
  titleStart: "Your learning partner in",
  titleAccent: "the digital era",
  body: "Learn from mentors who work in the field, build projects that prove it, and grow into the role you want.",
};

/** Shown in the hero arc only until real courses are published. Taken from the approved hero design. */
export const HERO_FALLBACK_TRACKS: { title: string; meta: string }[] = [
  { title: "Accounting & Tally", meta: "Non-IT, 8 weeks" },
  { title: "Digital Marketing", meta: "Non-IT, 10 weeks" },
  { title: "Data Analytics", meta: "IT, 12 weeks" },
  { title: "Full Stack Dev", meta: "IT, 16 weeks" },
  { title: "UI/UX Design", meta: "IT, 12 weeks" },
];

export const CATEGORIES: { label: string; category: CourseCategory; icon: "code" | "chart" | "pen" | "megaphone" | "calculator" | "users" }[] = [
  { label: "Software development", category: "it", icon: "code" },
  { label: "Data and analytics", category: "it", icon: "chart" },
  { label: "Design", category: "it", icon: "pen" },
  { label: "Marketing", category: "non_it", icon: "megaphone" },
  { label: "Finance and accounts", category: "non_it", icon: "calculator" },
  { label: "HR and operations", category: "non_it", icon: "users" },
];

export const REASONS = [
  {
    title: "Mentors who do the work",
    body: "Every track is taught by someone practising it today, not reading from a slide deck written three years ago.",
  },
  {
    title: "Projects, not just lectures",
    body: "You finish each course with work you can show an interviewer, reviewed one by one by your mentor.",
  },
  {
    title: "Built for both streams",
    body: "IT and non-IT graduates get their own tracks, so nobody sits through material meant for someone else.",
  },
  {
    title: "Support until you land the role",
    body: "Resume reviews, mock interviews and introductions carry on after the last class.",
  },
];

export const STEPS = [
  { step: "Learn", body: "Live and recorded classes from industry mentors, explained simply and at your own pace." },
  { step: "Build", body: "Real projects and assignments reviewed by mentors, which become your portfolio." },
  { step: "Grow", body: "Resume reviews, mock interviews and placement support to help you land the role." },
];

/**
 * Only real, consented quotes with name and college. The section hides itself
 * while this list is empty, so nothing made-up ever reaches the page.
 */
export const TESTIMONIALS: { quote: string; name: string; college: string; course: string }[] = [];

export const FAQS = [
  {
    q: "Do I need a computer science degree?",
    a: "No. Half the tracks are built for non-IT graduates, and the IT tracks start from the basics. Each course page lists what you need before you begin.",
  },
  {
    q: "Are classes live or recorded?",
    a: "Both. Live classes are scheduled inside each course, and recorded lessons stay in your dashboard so you can go back to them.",
  },
  {
    q: "Can I pay in installments?",
    a: "Yes, for courses that offer it. Your counsellor sets up the plan with you, and your dashboard shows every due date and receipt.",
  },
  {
    q: "When do I get access to the course?",
    a: "As soon as your first payment is received. Your lessons unlock in your dashboard straight away.",
  },
  {
    q: "Will I get a certificate?",
    a: "Yes. When you complete a course you receive a certificate with a unique ID that anyone can check on our verify page.",
  },
  {
    q: "Can I talk to someone before I enroll?",
    a: "Yes. Leave your number in the form below and a counsellor will call you back.",
  },
];

export const ABOUT = {
  title: "Skavyra helps graduates turn a degree into a first job.",
  paragraphs: [
    "Many graduates finish college with a degree but without the practical skills employers ask for. Skavyra closes that gap with focused courses for both IT and non-IT graduates.",
    "Every course follows the same method: learn from a mentor who works in the field, build projects that prove what you can do, and get support until you land the role.",
  ],
};

export const SUPPORT_EMAIL = "support@skavyra.com";
