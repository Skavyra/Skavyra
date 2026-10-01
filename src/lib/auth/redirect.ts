/** Keep auth return URLs on this site and reject protocol-relative paths. */
export function safeNextPath(value?: string | null): string | undefined {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return undefined;

  try {
    const destination = new URL(value, "https://skavyra.invalid");
    if (destination.origin !== "https://skavyra.invalid") return undefined;
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return undefined;
  }
}
