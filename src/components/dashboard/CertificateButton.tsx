"use client";

import { Award } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { issueCertificate } from "@/actions/enrollments";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { BUCKETS } from "@/lib/constants";
import { buildCertificatePdf } from "@/lib/pdf/certificate";
import { createClient } from "@/lib/supabase/client";

/**
 * issue_certificate() assigns the number, the PDF is drawn here and uploaded
 * to the certificates bucket at the path the record already points to.
 */
export function CertificateButton({ enrollmentId }: { enrollmentId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="gold"
      loading={pending}
      onClick={async () => {
        setPending(true);
        const result = await issueCertificate(enrollmentId);
        if (!result.ok) {
          toast.error(result.error);
          setPending(false);
          return;
        }
        const cert = result.data;
        try {
          const blob = await buildCertificatePdf({
            studentName: cert.studentName,
            courseTitle: cert.courseTitle,
            durationWeeks: cert.durationWeeks,
            certificateNo: cert.certificateNo,
            issuedAt: cert.issuedAt,
            verifyUrl: cert.verifyUrl,
          });
          const supabase = createClient();
          const { error } = await supabase.storage
            .from(BUCKETS.certificates)
            .upload(cert.pdfPath, blob, { upsert: true, contentType: "application/pdf" });
          if (error) throw new Error(error.message);
          toast.success(`Certificate ${cert.certificateNo} issued`);
        } catch {
          toast.success(`Certificate ${cert.certificateNo} issued. The PDF will be built when it is downloaded.`);
        } finally {
          setPending(false);
          router.refresh();
        }
      }}
    >
      <Award /> Issue certificate
    </Button>
  );
}
