import * as XLSX from "xlsx";

export type ParsedSheet = {
  fileName: string;
  fileType: "csv" | "xlsx";
  headers: string[];
  rows: Record<string, string>[];
};

/**
 * Reads the first sheet of an .xlsx or .csv file in the browser.
 * Nothing is uploaded to storage; the rows go straight to the preview step.
 */
export async function parseSheet(file: File): Promise<ParsedSheet> {
  const lower = file.name.toLowerCase();
  const fileType = lower.endsWith(".csv") ? "csv" : "xlsx";
  if (!lower.endsWith(".csv") && !lower.endsWith(".xlsx") && !lower.endsWith(".xls")) {
    throw new Error("Upload an .xlsx or .csv file.");
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error("The file has no sheets.");

  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: false,
    dateNF: "yyyy-mm-dd",
    defval: "",
    blankrows: false,
  });
  if (matrix.length === 0) throw new Error("The sheet is empty.");

  const headers = (matrix[0] as unknown[]).map((h, i) => String(h ?? "").trim() || `Column ${i + 1}`);
  const rows = matrix
    .slice(1)
    .map((cells) => {
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = String((cells as unknown[])[i] ?? "").trim();
      });
      return row;
    })
    .filter((row) => Object.values(row).some((v) => v !== ""));

  return { fileName: file.name, fileType, headers, rows };
}

/** Accepts 2026-02-01, 01/02/2026, 1-2-2026 or an Excel date string, returns YYYY-MM-DD or "". */
export function toIsoDate(value: string) {
  const v = value.trim();
  if (!v) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  const m = v.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  if (m) {
    const [, d, mo, y] = m;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const parsed = new Date(v);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

export function downloadSheet(fileName: string, sheetName: string, rows: Record<string, unknown>[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, fileName);
}
