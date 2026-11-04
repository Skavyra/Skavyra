import "@/styles/skavyra-site.css";

import { Home } from "lucide-react";
import Link from "next/link";

import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";

export default function NotFound() {
  return (
    <div className="site">
      <SiteHeader />
      <main id="main">
        <section className="nf">
          <span className="nf__d" style={{ left: "8%", top: "18%" }} />
          <span className="nf__d" style={{ right: "10%", bottom: "14%", width: 220, height: 220 }} />
          <div className="wrap">
            <p className="nf__num" aria-hidden="true">4<i />4</p>
            <h1>This page does not exist</h1>
            <p>The link may be old or mistyped. Head back home or browse the courses.</p>
            <div className="btns">
              <Link className="btn btn--ink btn--lg" href="/"><Home className="ic" strokeWidth={1.75} />Go home</Link>
              <Link className="btn btn--line btn--lg" href="/courses">Browse courses</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
