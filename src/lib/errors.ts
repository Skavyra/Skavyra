/**
 * What a database or API error is allowed to say to a user.
 *
 * Messages we raise ourselves in SQL functions (`raise exception '...'`, code P0001) are written for people and pass
 * through. Everything else (constraint names, column names, policy text, driver errors) is logged on the server and
 * replaced by a plain sentence, so internals never reach the browser.
 */
type DbErrorLike = { message?: string; code?: string } | null | undefined;

const BY_CODE: Record<string, string> = {
  "23505": "That already exists.",
  "23503": "This is linked to other records, so it cannot be changed.",
  "23502": "A required value is missing.",
  "23514": "One of the values is not allowed.",
  "22P02": "One of the values is not in the right format.",
  "42501": "You do not have permission to do that.",
  PGRST116: "That record was not found.",
  PGRST202: "This feature is not set up yet. Ask an admin to finish the setup.",
  PGRST204: "This feature is not set up yet. Ask an admin to finish the setup.",
  PGRST301: "Your session has ended. Log in again.",
};

export function dbError(error: DbErrorLike, fallback = "Something went wrong. Please try again."): string {
  if (!error) return fallback;
  const code = error.code ?? "";
  if (code === "P0001" && error.message) return error.message;

  console.error("[server]", code || "no-code", error.message);

  if (BY_CODE[code]) return BY_CODE[code];
  if (/row-level security|permission denied/i.test(error.message ?? "")) return BY_CODE["42501"];
  if (/JWT|not authenticated/i.test(error.message ?? "")) return BY_CODE.PGRST301;
  return fallback;
}
