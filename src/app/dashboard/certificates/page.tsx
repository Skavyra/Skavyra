import { Award, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { CertificateDownload } from "@/components/dashboard/CertificateDownload";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { formatDate, fullName } from "@/lib/utils";

export const metadata: Metadata = { title: "Certificates" };

export default async function CertificatesPage() {
  const user = await requireRole("student");
  const supabase = await createClient();

  const { data: enrollments } = await supabase.from("enrollments").select("id").eq("user_id", user.id);
  const ids = (enrollments ?? []).map((e) => e.id);

  const { data: certificates } = ids.length
    ? await supabase
        .from("certificates")
        .select("id, certificate_no, verify_token, pdf_path, issued_at, revoked_at, enrollment:enrollments(course:courses(title, duration_weeks))")
        .in("enrollment_id", ids)
        .order("issued_at", { ascending: false })
    : { data: [] };

  const { data: setting } = await supabase.from("app_settings").select("value").eq("key", "certificates").maybeSingle();
  const base = (((setting?.value as { verify_base_url?: string } | null)?.verify_base_url) ?? `${process.env.NEXT_PUBLIC_SITE_URL}/verify`).replace(/\/$/, "");
  const name = fullName(user.profile) || user.email;

  return (
    <>
      <PageHeader title="Certificates" description="Every certificate carries an ID anyone can check." />
      {(certificates ?? []).length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates yet"
          description="Finish a course and your certificate appears here, ready to download and share."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {(certificates ?? []).map((c) => (
            <li key={c.id} className="flex flex-col gap-3 rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-display text-lg font-bold leading-tight">{c.enrollment?.course?.title}</p>
                {c.revoked_at ? <Badge tone="danger">Revoked</Badge> : <Badge tone="gold">Issued</Badge>}
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Certificate ID</dt>
                  <dd className="font-mono text-xs">{c.certificate_no}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Issued</dt>
                  <dd>{formatDate(c.issued_at)}</dd>
                </div>
              </dl>
              {!c.revoked_at && (
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                  <CertificateDownload
                    certificate={{
                      pdf_path: c.pdf_path,
                      certificate_no: c.certificate_no,
                      issued_at: c.issued_at,
                      verify_url: `${base}/${c.verify_token}`,
                      student_name: name,
                      course_title: c.enrollment?.course?.title ?? "",
                      duration_weeks: c.enrollment?.course?.duration_weeks ?? null,
                    }}
                  />
                  <Link
                    href={`/verify/${c.verify_token}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-gold-700 hover:underline"
                  >
                    Verify page <ExternalLink className="size-3.5" />
                  </Link>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
