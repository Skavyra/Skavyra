import { BadgeCheck, ChevronRight, CircleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Mark } from "@/components/brand/logo";
import { createClient } from "@/lib/supabase/server";
import { formatDate, fullName } from "@/lib/utils";

export const metadata: Metadata = { title: "Certificate", robots: { index: false } };

/**
 * Public check by verify_token, via verify_certificate(): a security-definer
 * function that returns only the name, course and issue date, so visitors
 * never need table access to certificates/enrollments/profiles.
 */
export default async function VerifyTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();

  const { data } = await supabase.rpc("verify_certificate", { p_token: token }).maybeSingle();

  if (!data) {
    return (
      <Shell tone="bad" title="No certificate matches this code">
        <p>Check the code on the certificate and try again. Codes are 24 characters with no spaces.</p>
      </Shell>
    );
  }

  if (data.revoked_at) {
    return (
      <Shell tone="bad" title="This certificate has been revoked">
        <p>
          Certificate {data.certificate_no} was revoked on {formatDate(data.revoked_at)}. Contact Skavyra if you need
          more detail.
        </p>
      </Shell>
    );
  }

  const name = fullName({ first_name: data.first_name, last_name: data.last_name }) || "Student";

  return (
    <Shell tone="good" title="This certificate is genuine">
      <dl>
        <Row label="Awarded to" value={name} />
        <Row label="Course" value={data.course_title ?? "—"} />
        <Row label="Certificate ID" value={data.certificate_no} />
        <Row label="Issued on" value={formatDate(data.issued_at)} />
        {data.duration_weeks ? <Row label="Programme length" value={`${data.duration_weeks} weeks`} /> : null}
      </dl>
    </Shell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "16px 0", borderBottom: "1px solid #E6E4DE" }}>
      <dt style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#8B8983" }}>{label}</dt>
      <dd style={{ marginTop: 4, fontSize: 17, fontWeight: 600, color: "#0D0D0D" }}>{value}</dd>
    </div>
  );
}

function Shell({ tone, title, children }: { tone: "good" | "bad" | "warn"; title: string; children: React.ReactNode }) {
  const Icon = tone === "good" ? BadgeCheck : CircleAlert;
  const titleWords = title.split(" ");
  const highlightedWord = titleWords.pop();
  return (
    <>
      <section className="pb">
        <span className="pb__q" aria-hidden="true" /><span className="pb__q2" aria-hidden="true" /><span className="pb__dots" aria-hidden="true" />
        <div className="wrap"><div className="reveal">
          <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><ChevronRight className="ic" strokeWidth={1.75} /><b>Certificate verification</b></nav>
          <p className="over"><span className="over__bar" />Certificates</p>
          <h1 className="ptitle">{titleWords.join(" ")} <span className="hl">{highlightedWord}</span></h1>
        </div></div>
      </section>
      <div className="wrap"><div className="vbox reveal"><div className="pform">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Mark className="w-12" seam="#FFFFFF" />
          <Icon className={`ic ${tone === "good" ? "text-success" : "text-destructive"}`} strokeWidth={1.75} />
        </div>
        <div style={{ marginTop: 20, color: "#5C5B57" }}>{children}</div>
        <div className="btns">
          <Link className="btn btn--line btn--lg" href="/verify">Check another code</Link>
          <Link className="btn btn--ink btn--lg" href="/courses">Browse courses</Link>
        </div>
      </div></div></div>
    </>
  );
}
