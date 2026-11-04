import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { SUPPORT_EMAIL } from "@/lib/content";
import { slugify } from "@/lib/utils";

export const metadata: Metadata = { title: "Privacy policy" };

/**
 * A plain-language starting point. The client's legal advisor should review
 * this before launch; nothing here is legal advice.
 */
const SECTIONS = [
  {
    title: "What we collect",
    body: "When you fill in a form we collect your name, mobile number and, if you give it, your email, college, degree and the course you are interested in. When you create an account we also store the profile details you add and a record of the lessons you open and complete. If you pay us, we store the amount, the date, the reference number and any payment screenshot you or your counsellor uploads.",
  },
  {
    title: "Why we use it",
    body: "To call you back about a course, to run the course you enrolled in, to keep your payment record and receipts, to issue your certificate, and to answer your questions. We do not sell your details to anyone.",
  },
  {
    title: "Who can see it",
    body: "Your counsellor sees the leads assigned to them. Administrators see all records. Other students never see your details. Our hosting and database provider stores the data on our behalf.",
  },
  {
    title: "How long we keep it",
    body: "Enrolment, payment and certificate records are kept as long as the law requires them for accounting. Enquiry records are kept while they are useful and removed on request.",
  },
  {
    title: "Your choices",
    body: "You can ask us to correct or delete your details, or to stop calling you, by writing to us. You can also edit most of your profile yourself once you have an account.",
  },
  {
    title: "Cookies",
    body: "We use a cookie to keep you signed in. There are no advertising or tracking cookies on this site.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <section className="pb">
        <span className="pb__q" aria-hidden="true" />
        <span className="pb__q2" aria-hidden="true" />
        <span className="pb__dots" aria-hidden="true" />
        <div className="wrap"><div className="reveal">
          <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><ChevronRight className="ic" strokeWidth={1.75} /><b>Privacy policy</b></nav>
          <p className="over"><span className="over__bar" />Legal</p>
          <h1 className="ptitle">Privacy <span className="hl">policy</span></h1>
          <p className="plead">How Skavyra handles the information you give us. {SUPPORT_EMAIL && <>Questions about anything here can go to <a className="alink" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</>}</p>
        </div></div>
      </section>
      <div className="wrap legal">
        <aside className="toc"><small>On this page</small>{SECTIONS.map((s) => <a key={s.title} href={`#${slugify(s.title)}`}>{s.title}</a>)}</aside>
        <div className="prose">{SECTIONS.map((s, i) => <section key={s.title} id={slugify(s.title)} className="reveal"><h2><b>{String(i + 1).padStart(2, "0")}</b>{s.title}</h2><p>{s.body}</p></section>)}</div>
      </div>
    </>
  );
}
