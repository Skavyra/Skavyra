import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { SUPPORT_EMAIL } from "@/lib/content";
import { slugify } from "@/lib/utils";

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
    <>
      <section className="pb">
        <span className="pb__q" aria-hidden="true" />
        <span className="pb__q2" aria-hidden="true" />
        <span className="pb__dots" aria-hidden="true" />
        <div className="wrap"><div className="reveal">
          <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><ChevronRight className="ic" strokeWidth={1.75} /><b>Terms of use</b></nav>
          <p className="over"><span className="over__bar" />Legal</p>
          <h1 className="ptitle">Terms of <span className="hl">use</span></h1>
          <p className="plead">The rules for using Skavyra and its courses. {SUPPORT_EMAIL && <>Write to <a className="alink" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> if anything is unclear.</>}</p>
        </div></div>
      </section>
      <div className="wrap legal">
        <aside className="toc"><small>On this page</small>{SECTIONS.map((s) => <a key={s.title} href={`#${slugify(s.title)}`}>{s.title}</a>)}</aside>
        <div className="prose">{SECTIONS.map((s, i) => <section key={s.title} id={slugify(s.title)} className="reveal"><h2><b>{String(i + 1).padStart(2, "0")}</b>{s.title}</h2><p>{s.body}</p></section>)}</div>
      </div>
    </>
  );
}
