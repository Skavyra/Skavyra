import { normalizePhone } from "@/lib/utils";

export type RowFlag = "ok" | "duplicate" | "new_interest" | "invalid";

export type ExistingLead = { phone: string; interested_course_text: string | null };

/**
 * Flags each row the way the preview step shows it:
 *  invalid      - no name or not a 10 digit phone (the database would skip it)
 *  duplicate    - phone repeats inside the sheet, or already a live lead (red)
 *  new_interest - already a live lead, and the sheet names a different course (amber)
 * The import function skips every row that is not "ok".
 */
export function flagLeadRows(rows: Record<string, string>[], existing: ExistingLead[]): RowFlag[] {
  const existingByPhone = new Map(existing.map((e) => [e.phone, e]));
  const seen = new Set<string>();

  return rows.map((row) => {
    const phone = normalizePhone(row.phone);
    if (!row.full_name?.trim() || phone.length !== 10) return "invalid";
    if (seen.has(phone)) return "duplicate";
    seen.add(phone);

    const match = existingByPhone.get(phone);
    if (!match) return "ok";

    const sheetCourse = (row.interested_course_text ?? "").trim().toLowerCase();
    const dbCourse = (match.interested_course_text ?? "").trim().toLowerCase();
    return sheetCourse && sheetCourse !== dbCourse ? "new_interest" : "duplicate";
  });
}

export function chunk<T>(items: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
