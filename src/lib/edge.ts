import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Calls a Supabase edge function as the signed-in user, from the server.
 * Running it here keeps the access token out of client code and avoids CORS.
 */
export async function callEdgeFunction<T = Record<string, unknown>>(
  name: "create-user" | "deactivate-staff" | "simulate-payment",
  body: Record<string, unknown>,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false, error: "Your session has ended. Log in again." };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${name}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok || json.error) {
      if (res.status === 404) return { ok: false, error: `The ${name} function is not deployed yet.` };
      if (res.status === 401) return { ok: false, error: "Your session has ended. Log in again." };
      if (res.status === 403) return { ok: false, error: "You do not have permission to do that." };
      // 4xx messages are written for people; a 5xx is a fault, so log it and say something plain
      if (res.status >= 500) {
        console.error(`[edge:${name}]`, res.status, json.error);
        return { ok: false, error: "The server had a problem. Please try again in a moment." };
      }
      return { ok: false, error: String(json.error ?? "That request could not be completed.") };
    }
    return { ok: true, data: json as T };
  } catch (error) {
    console.error(`[edge:${name}] unreachable`, error);
    return { ok: false, error: "Could not reach the server. Check your connection and try again." };
  }
}
