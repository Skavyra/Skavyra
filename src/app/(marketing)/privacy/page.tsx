import type { Metadata } from "next";

import { SUPPORT_EMAIL } from "@/lib/content";

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
    <div className="container section max-w-3xl">
      <h1 className="text-fluid-3xl">Privacy policy</h1>
      <p className="mt-4 text-muted-foreground">
        How Skavyra handles the information you give us. Questions about anything here can go to {SUPPORT_EMAIL}.
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
