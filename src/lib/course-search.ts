/** Course search shared by the courses page and the home "Popular courses" box.
 * Every typed word must match the start of a word in the title, subtitle or overview.
 * Title hits rank first, then subtitle, then overview. Common short forms are expanded (ai -> artificial intelligence). */
const ALIASES: Record<string, string[]> = {
  ai: ["artificial intelligence", "machine learning", "genai", "gen ai", "ml"],
  ml: ["machine learning"],
  cyber: ["security", "cybersecurity"],
  data: ["analytics", "analysis"],
  web: ["frontend", "full stack", "website"],
  ui: ["user interface", "ux"],
  ux: ["user experience"],
  hr: ["human resources"],
  seo: ["search engine"],
};

export function searchTerms(q?: string | null): string[] {
  return (q ?? "").toLowerCase().split(/\s+/).map((t) => t.replace(/[^\p{L}\p{N}+#.]/gu, "")).filter(Boolean).slice(0, 6);
}

function wordStart(text: string, term: string) {
  if (!term) return false;
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\p{L}\\p{N}])${esc}`, "u").test(text);
}

function termScore(title: string, sub: string, body: string, term: string): number {
  const forms = [term, ...(ALIASES[term] ?? [])];
  let best = -1;
  for (const f of forms) {
    const weight = f === term ? 1 : 0.8;
    if (wordStart(title, f)) best = Math.max(best, 4 * weight);
    else if (wordStart(sub, f)) best = Math.max(best, 2 * weight);
    else if (wordStart(body, f)) best = Math.max(best, 1 * weight);
  }
  return best;
}

/** -1 when a typed word is not found; otherwise a score (higher = closer match). */
export function scoreCourse(row: { title: string; subtitle?: string | null; description?: string | null }, terms: string[]): number {
  if (!terms.length) return 0;
  const title = row.title.toLowerCase();
  const sub = (row.subtitle ?? "").toLowerCase();
  const body = (row.description ?? "").toLowerCase();
  let score = 0;
  for (const t of terms) {
    const s = termScore(title, sub, body, t);
    if (s < 0) return -1;
    score += s;
  }
  return score;
}
