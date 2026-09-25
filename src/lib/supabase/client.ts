import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database.types";

/** Browser client. Uses the public anon key; RLS decides what it can see. */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
