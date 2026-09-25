import type { Metadata } from "next";

import { SUPPORT_EMAIL } from "@/lib/content";

export const metadata: Metadata = { title: "Terms of use" };

const SECTIONS = [
  {
    title: "Your account",
    body: "Keep your password to yourself. Course access is for one person: sharing your login, recording lessons or passing course material on to others ends your access without a refund.",
  },
  {
    title: "Enrolment and access",
    body: "Your lessons unlock once your first payment is received. If an installment is overdue, access can be paused until it is paid, and resumes as soon as it is.",
  },
  {
    title: "Fees and refunds",
    body: "Fees are shown on each course page in Indian rupees. Refund terms are agreed with your counsellor before you pay and are set out in writing at that time.",
  },
  {
    title: "Course content",
    body: "Videos, notes, project briefs and templates belong to Skavyra or its mentors. You may use them for your own learning and portfolio, not to teach or resell.",
  },
  {
    title: "Certificates",
    body: "A certificate records that you completed a course. Every certificate carries an ID anyone can check on our verify page. We may revoke a certificate obtained dishonestly.",
  },
  {
    title: "Changes",
    body: "Schedules, mentors and lesson order can change while a course runs. If a change is significant, we tell enrolled students first.",
  },
];

export default function TermsPage() {
  return (
    <div className="container section max-w-3xl">
      <h1 className="text-fluid-3xl">Terms of use</h1>
      <p className="mt-4 text-muted-foreground">
        The rules for using Skavyra and its courses. Write to {SUPPORT_EMAIL} if anything is unclear.
      </p>
      <div className="mt-10 flex flex-col gap-8">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="text-fluid-xl">{s.title}</h2>
            <p className="mt-3 leading-relaxed text-foreground/85">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
