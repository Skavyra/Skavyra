"use client";

import { ArrowLeft, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Mark } from "@/components/brand/logo";

const POINTS = [
  "Learn from mentors who work in the field",
  "Build real projects for your portfolio",
  "Earn a certificate on completion",
];

export default function AuthPanelPhoto({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSignup = pathname === "/signup";
  const photo = isSignup ? "/images/site/photo-hero-student.jpg" : "/images/site/photo-laptop-study.jpg";

  return (
    <div className={`auth${isSignup ? " auth--signup" : ""}`}>
      <aside className="auth__panel">
        <Link href="/" className="logo logo--light" aria-label="Skavyra home"><Mark className="mark" seam="#0D0D0D" /><span className="wordmark">Skavyra</span></Link>
        <span className="auth__ph" aria-hidden="true"><Image src={photo} alt="" fill sizes="300px" /></span>
        <span className="auth__q" aria-hidden="true" />
        <h2>Your learning partner in the <span className="hl">digital era</span></h2>
        <p>Courses for IT and non-IT graduates, taught by mentors who work in the field.</p>
        <ul className="ticks">{POINTS.map((point) => <li key={point}><Check className="ic" strokeWidth={1.75} />{point}</li>)}</ul>
        <p className="tagline">Learn <i /> Build <i /> Grow</p>
      </aside>
      <main className="auth__main" id="main">
        <div className="auth__box reveal in">
          <Link href="/" className="logo auth__mlogo" aria-label="Skavyra home"><Mark className="mark" seam="#FFFFFF" /><span className="wordmark">Skavyra</span></Link>
          <Link className="auth__back" href="/"><ArrowLeft className="ic" strokeWidth={1.75} />Back to home</Link>
          {children}
        </div>
      </main>
    </div>
  );
}
