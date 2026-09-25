import { BadgeCheck, CircleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Mark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
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
      <dl className="mt-2 grid gap-4 sm:grid-cols-2">
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
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-semibold">{value}</dd>
    </div>
  );
}

function Shell({ tone, title, children }: { tone: "good" | "bad" | "warn"; title: string; children: React.ReactNode }) {
  const Icon = tone === "good" ? BadgeCheck : CircleAlert;
  return (
    <div className="container section max-w-2xl">
      <div className="rounded-3xl border bg-card p-6 sm:p-10">
        <div className="flex items-center gap-4">
          <Mark className="w-12" seam="#FFFFFF" />
          <Icon className={tone === "good" ? "size-7 text-success" : "size-7 text-destructive"} />
        </div>
        <h1 className="mt-6 text-fluid-2xl">{title}</h1>
        <div className="mt-4 text-muted-foreground">{children}</div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/verify">Check another code</Link>
          </Button>
          <Button asChild>
            <Link href="/courses">Browse courses</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
