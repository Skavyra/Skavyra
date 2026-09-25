"use client";

import { jsPDF } from "jspdf";

import { longDate, markPng, PDF_COLORS as C } from "./shared";

export type CertificateData = {
  studentName: string;
  courseTitle: string;
  durationWeeks: number | null;
  certificateNo: string;
  issuedAt: string;
  verifyUrl: string;
};

/**
 * Landscape A4 certificate following the brand template board:
 * ink frame, gold inner rule, mark, title, name in Gold 700, verified seal,
 * two signature lines, certificate ID and issue date.
 */
export async function buildCertificatePdf(data: CertificateData): Promise<Blob> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;

  doc.setFillColor(...C.ink);
  doc.rect(0, 0, W, H, "F");
  doc.setFillColor(...C.paper);
  doc.rect(7, 7, W - 14, H - 14, "F");
  doc.setDrawColor(...C.gold300);
  doc.setLineWidth(0.4);
  doc.rect(14, 14, W - 28, H - 28);

  // soft quarter circle in the lower right, as on the template
  doc.setFillColor(240, 232, 214);
  doc.circle(W - 14, H - 14, 42, "F");
  doc.setFillColor(...C.paper);
  doc.rect(W - 14, H - 60, 20, 60, "F");
  doc.rect(W - 60, H - 14, 60, 20, "F");
  doc.setDrawColor(...C.gold300);
  doc.rect(14, 14, W - 28, H - 28);

  const mark = await markPng();
  doc.addImage(mark, "PNG", W / 2 - 24, 24, 16, 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...C.ink);
  doc.text("Skavyra", W / 2 - 5, 32);

  doc.setFontSize(30);
  doc.text("Certificate of Completion", W / 2, 56, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...C.muted);
  doc.text("This certificate is proudly presented to", W / 2, 68, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...C.gold700);
  doc.text(data.studentName, W / 2, 86, { align: "center" });
  doc.setDrawColor(...C.gold300);
  doc.line(W / 2 - 55, 92, W / 2 + 55, 92);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...C.muted);
  const program = data.durationWeeks ? `the ${data.durationWeeks}-week ${data.courseTitle} program` : `the ${data.courseTitle} program`;
  doc.text(`for successfully completing ${program}.`, W / 2, 104, { align: "center", maxWidth: 170 });

  // verified seal
  doc.setDrawColor(...C.gold300);
  doc.setLineWidth(0.6);
  doc.circle(W / 2, 138, 12);
  doc.addImage(mark, "PNG", W / 2 - 6, 131, 12, 7.4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...C.gold700);
  doc.text("VERIFIED", W / 2, 144, { align: "center", charSpace: 0.6 });

  doc.setDrawColor(...C.muted);
  doc.setLineWidth(0.3);
  doc.line(40, 142, 100, 142);
  doc.line(W - 100, 142, W - 40, 142);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.ink);
  doc.text("Program Director", 70, 148, { align: "center" });
  doc.text("Lead Mentor", W - 70, 148, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text(`Certificate ID ${data.certificateNo}`, 40, 176);
  doc.text(`Issued on ${longDate(data.issuedAt)}`, W - 40, 176, { align: "right" });
  doc.text(`Verify at ${data.verifyUrl}`, W / 2, 186, { align: "center" });

  return doc.output("blob");
}
