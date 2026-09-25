"use client";

/** The mark as SVG, rasterised in the browser so jsPDF can place it. */
const MARK_SVG = (seam: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 89" width="576" height="356"><g stroke="${seam}" stroke-width="2.2" stroke-linejoin="round"><path d="M0 89A89 89 0 0 1 89 0V89Z" fill="#8E6718"/><path d="M89 0A55 55 0 0 1 144 55H89Z" fill="#B98A24"/><path d="M144 55A34 34 0 0 1 110 89V55Z" fill="#DDAA2F"/><path d="M110 89A21 21 0 0 1 89 68H110Z" fill="#F2C75C"/><path d="M89 68A13 13 0 0 1 102 55V68Z" fill="#0D0D0D"/><path d="M102 55A8 8 0 0 1 110 63H102Z" fill="#DDAA2F"/></g></svg>`;

export async function markPng(seam = "#FBF9F4"): Promise<string> {
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(MARK_SVG(seam))}`;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = 576;
  canvas.height = 356;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  ctx.drawImage(img, 0, 0, 576, 356);
  return canvas.toDataURL("image/png");
}

export const PDF_COLORS = {
  ink: [13, 13, 13] as const,
  ivory: [244, 239, 227] as const,
  paper: [251, 249, 244] as const,
  gold300: [221, 170, 47] as const,
  gold700: [142, 103, 24] as const,
  muted: [96, 92, 86] as const,
};

export type CompanySettings = {
  legal_name?: string;
  address?: string;
  support_email?: string;
  support_phone?: string;
  gstin?: string;
};

export function longDate(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * A simple branded table PDF, used by the report exports. Loaded on demand so
 * jspdf stays out of the first page load.
 */
export async function downloadTablePdf({
  title,
  filename,
  head,
  body,
}: {
  title: string;
  filename: string;
  head: string[];
  body: string[][];
}) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const mark = await markPng();

  doc.addImage(mark, "PNG", 40, 28, 26, 26);
  doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(...PDF_COLORS.ink);
  doc.text("Skavyra", 76, 47);
  doc.setFont("helvetica", "normal").setFontSize(11).setTextColor(...PDF_COLORS.muted);
  doc.text(title, 76, 62);
  doc.text(longDate(new Date()), doc.internal.pageSize.getWidth() - 40, 47, { align: "right" });

  autoTable(doc, {
    head: [head],
    body,
    startY: 84,
    margin: { left: 40, right: 40 },
    styles: { font: "helvetica", fontSize: 9, cellPadding: 6, textColor: [...PDF_COLORS.ink] },
    headStyles: { fillColor: [...PDF_COLORS.ink], textColor: [...PDF_COLORS.ivory], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [...PDF_COLORS.paper] },
  });

  doc.save(filename);
}
