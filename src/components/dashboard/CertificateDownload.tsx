"use client";

import { Download } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { buildCertificatePdf } from "@/lib/pdf/certificate";
import { BUCKETS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

/**
 * Downloads the stored PDF. If the file is missing (issued before the PDF was
 * uploaded, say) the same certificate is rebuilt in the browser from its data,
 * so the student is never stuck.
 */
export function CertificateDownload({
  certificate,
}: {
  certificate: {
    pdf_path: string | null;
    certificate_no: string;
    issued_at: string;
    verify_url: string;
    student_name: string;
    course_title: string;
    duration_weeks: number | null;
  };
}) {
  const [pending, setPending] = useState(false);

  return (
    <Button
      size="sm"
      loading={pending}
      onClick={async () => {
        setPending(true);
        try {
          if (certificate.pdf_path) {
            const supabase = createClient();
            const { data } = await supabase.storage
              .from(BUCKETS.certificates)
              .createSignedUrl(certificate.pdf_path, 120, { download: `${certificate.certificate_no}.pdf` });
            if (data?.signedUrl) {
              window.open(data.signedUrl, "_blank", "noopener");
              return;
            }
          }
          const blob = await buildCertificatePdf({
            studentName: certificate.student_name,
            courseTitle: certificate.course_title,
            durationWeeks: certificate.duration_weeks,
            certificateNo: certificate.certificate_no,
            issuedAt: certificate.issued_at,
            verifyUrl: certificate.verify_url,
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${certificate.certificate_no}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        } catch {
          toast.error("The certificate could not be prepared. Try again.");
        } finally {
          setPending(false);
        }
      }}
    >
      <Download /> Download
    </Button>
  );
}
