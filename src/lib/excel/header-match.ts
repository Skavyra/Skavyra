export type FieldDef = { key: string; label: string; required?: boolean; aliases: string[] };

/** Targets accepted by public.import_leads(). */
export const LEAD_FIELDS: FieldDef[] = [
  { key: "full_name", label: "Full name", required: true, aliases: ["name", "full name", "student name", "candidate name", "student"] },
  { key: "phone", label: "Phone", required: true, aliases: ["phone", "mobile", "mobile number", "phone number", "contact", "contact number", "whatsapp"] },
  { key: "email", label: "Email", aliases: ["email", "email id", "mail", "e-mail"] },
  { key: "college_name", label: "College", aliases: ["college", "college name", "institute", "university"] },
  { key: "degree", label: "Degree", aliases: ["degree", "qualification", "course studied"] },
  { key: "branch", label: "Branch", aliases: ["branch", "stream", "specialization", "department"] },
  { key: "current_year", label: "Current year", aliases: ["current year", "year of study", "year"] },
  { key: "started_year", label: "Started year", aliases: ["started year", "start year", "joining year"] },
  { key: "ending_year", label: "Ending year", aliases: ["ending year", "passing year", "passout year", "pass out year", "graduation year"] },
  { key: "city", label: "City", aliases: ["city", "town", "location"] },
  { key: "state", label: "State", aliases: ["state"] },
  { key: "address", label: "Address", aliases: ["address"] },
  { key: "interested_course_text", label: "Course interested", aliases: ["interested course", "course", "course interested", "interest", "program"] },
  { key: "remarks", label: "Remarks", aliases: ["remarks", "notes", "comment", "comments"] },
];

/** Targets accepted by public.import_offer_letters(). */
export const OFFER_FIELDS: FieldDef[] = [
  { key: "candidate_name", label: "Candidate name", required: true, aliases: ["name", "candidate", "candidate name", "full name", "employee name"] },
  { key: "email", label: "Email", required: true, aliases: ["email", "email id", "mail"] },
  { key: "phone", label: "Phone", aliases: ["phone", "mobile", "contact"] },
  { key: "role_title", label: "Role", required: true, aliases: ["role", "designation", "position", "title", "role title"] },
  { key: "department", label: "Department", aliases: ["department", "dept", "team"] },
  { key: "employment_type", label: "Employment type", aliases: ["employment type", "type", "intern or full time"] },
  { key: "ctc_amount", label: "Salary amount", aliases: ["ctc", "salary", "stipend", "amount", "ctc amount"] },
  { key: "ctc_period", label: "Salary period", aliases: ["period", "ctc period", "salary period"] },
  { key: "joining_date", label: "Joining date", required: true, aliases: ["joining date", "date of joining", "doj", "start date"] },
  { key: "issue_date", label: "Issue date", aliases: ["issue date", "offer date", "date"] },
  { key: "work_location", label: "Work location", aliases: ["location", "work location", "office"] },
  { key: "reporting_manager_name", label: "Reporting manager", aliases: ["manager", "reporting manager", "reports to"] },
];

const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * Picks a sheet column for each field: exact alias first, then an alias contained
 * in the header. Each sheet column is used once. The admin can change any row.
 */
export function matchHeaders(headers: string[], fields: FieldDef[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const used = new Set<string>();
  const cleaned = headers.map((h) => ({ raw: h, c: clean(h) }));

  for (const pass of ["exact", "contains"] as const) {
    for (const field of fields) {
      if (mapping[field.key]) continue;
      const hit = cleaned.find(
        (h) =>
          !used.has(h.raw) &&
          field.aliases.some((a) => (pass === "exact" ? h.c === a : h.c.includes(a) && a.length > 3)),
      );
      if (hit) {
        mapping[field.key] = hit.raw;
        used.add(hit.raw);
      }
    }
  }
  return mapping;
}

/** Sheet rows -> rows keyed by database field, using the mapping. */
export function applyMapping(rows: Record<string, string>[], mapping: Record<string, string>) {
  return rows.map((row) => {
    const out: Record<string, string> = {};
    for (const [field, column] of Object.entries(mapping)) {
      if (column) out[field] = row[column] ?? "";
    }
    return out;
  });
}
