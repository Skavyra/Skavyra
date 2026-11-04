import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Verify a certificate",
  description: "Check that a Skavyra certificate is genuine.",
};

export default function VerifyPage() {
  async function check(formData: FormData) {
    "use server";
    const token = String(formData.get("token") ?? "").trim();
    redirect(token ? `/verify/${encodeURIComponent(token)}` : "/verify");
  }

  return (
    <>
      <section className="pb">
        <span className="pb__q" aria-hidden="true" /><span className="pb__q2" aria-hidden="true" /><span className="pb__dots" aria-hidden="true" />
        <div className="wrap"><div className="reveal">
          <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><ChevronRight className="ic" strokeWidth={1.75} /><b>Verify a certificate</b></nav>
          <p className="over"><span className="over__bar" />Certificates</p>
          <h1 className="ptitle">Verify a <span className="hl">certificate</span></h1>
          <p className="plead">Enter the verification code printed on the certificate, or open the link on it directly.</p>
        </div></div>
      </section>
      <div className="wrap"><div className="vbox reveal"><div className="formwrap"><form action={check} className="pform">
        <span className="incard__ic" style={{ margin: "0 0 18px", borderRadius: "50%" }}><ShieldCheck className="ic" strokeWidth={1.75} /></span>
        <label className="field" htmlFor="token" style={{ marginTop: 0 }}>Verification code<span className="vrow"><input id="token" name="token" placeholder="e.g. 9f2c4a7b1d3e5f60" required autoComplete="off" /><button className="btn btn--ink btn--lg" type="submit">Check certificate</button></span></label>
      </form></div></div></div>
    </>
  );
}
