"use client";

import { jsPDF } from "jspdf";

import { type CompanySettings, longDate, markPng, PDF_COLORS as C } from "./shared";

export type OfferLetterData = {
  letterNo: string;
  candidateName: string;
  email: string;
  roleTitle: string;
  department: string | null;
  employmentType: "intern" | "full_time" | "contract";
  ctcAmount: number;
  ctcPeriod: "month" | "year" | "total";
  joiningDate: string;
  issueDate: string;
  workLocation: string | null;
  reportingManagerName: string | null;
};

export type TemplateBody = { intro?: string; clauses?: string[]; closing?: string };

const EMPLOYMENT: Record<OfferLetterData["employmentType"], string> = {
  intern: "Internship",
  full_time: "Full time",
  contract: "Contract",
};
const PERIOD: Record<OfferLetterData["ctcPeriod"], string> = { month: "per month", year: "per year", total: "in total" };

/** Page 1 is the offer, page 2 the policy clauses from the active template. */
export async function buildOfferLetterPdf(
  data: OfferLetterData,
  template: TemplateBody,
  company: CompanySettings,
): Promise<Blob> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const L = 22;
  const companyName = company.legal_name || "Skavyra";
  const mark = await markPng("#FFFFFF");

  const header = () => {
    doc.addImage(mark, "PNG", L, 16, 16, 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...C.ink);
    doc.text(companyName, L + 20, 24);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    const contact = [company.address, company.support_email, company.support_phone].filter(Boolean).join("   ");
    if (contact) doc.text(contact, W - L, 20, { align: "right", maxWidth: 110 });
    if (company.gstin) doc.text(`GSTIN ${company.gstin}`, W - L, 25, { align: "right" });
    doc.setDrawColor(...C.gold300);
    doc.setLineWidth(0.5);
    doc.line(L, 31, W - L, 31);
  };

  const footer = (page: number) => {
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.text(`${data.letterNo}`, L, 285);
    doc.text(`Page ${page} of 2`, W - L, 285, { align: "right" });
  };

  // page 1
  header();
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text(`Ref: ${data.letterNo}`, L, 42);
  doc.text(`Date: ${longDate(data.issueDate)}`, W - L, 42, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...C.ink);
  doc.text("Offer of employment", L, 58);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text(`Dear ${data.candidateName},`, L, 72);
  const intro = template.intro || `We are pleased to offer you the position described below at ${companyName}.`;
  doc.text(doc.splitTextToSize(intro, W - 2 * L), L, 81);

  const rows: [string, string][] = [
    ["Role", data.roleTitle],
    ["Department", data.department || "—"],
    ["Employment type", EMPLOYMENT[data.employmentType]],
    [
      "Compensation",
      `${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
        data.ctcAmount,
      )} ${PERIOD[data.ctcPeriod]}`,
    ],
    ["Joining date", longDate(data.joiningDate)],
    ["Work location", data.workLocation || "—"],
    ["Reporting to", data.reportingManagerName || "—"],
  ];

  let y = 98;
  doc.setDrawColor(230, 223, 207);
  rows.forEach(([k, v]) => {
    doc.setTextColor(...C.muted);
    doc.text(k, L, y);
    doc.setTextColor(...C.ink);
    doc.setFont("helvetica", "bold");
    doc.text(v, L + 50, y);
    doc.setFont("helvetica", "normal");
    doc.line(L, y + 3.5, W - L, y + 3.5);
    y += 11;
  });

  y += 8;
  doc.setTextColor(...C.ink);
  doc.text(doc.splitTextToSize("The terms that apply to this offer are set out on the next page.", W - 2 * L), L, y);
  y += 22;
  doc.text(`For ${companyName}`, L, y);
  doc.line(L, y + 18, L + 60, y + 18);
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text("Authorised signatory", L, y + 23);
  footer(1);

  // page 2
  doc.addPage();
  header();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...C.ink);
  doc.text("Terms of this offer", L, 46);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  y = 58;
  (template.clauses ?? []).forEach((clause, i) => {
    const lines = doc.splitTextToSize(clause, W - 2 * L - 8);
    doc.setTextColor(...C.gold700);
    doc.text(`${i + 1}.`, L, y);
    doc.setTextColor(...C.ink);
    doc.text(lines, L + 8, y);
    y += lines.length * 5.2 + 4;
  });
  y += 6;
  if (template.closing) {
    doc.text(doc.splitTextToSize(template.closing, W - 2 * L), L, y);
    y += 18;
  }
  doc.text("Accepted by", L, y + 10);
  doc.line(L, y + 28, L + 60, y + 28);
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text(`${data.candidateName}, signature and date`, L, y + 33);
  footer(2);

  return doc.output("blob");
}
