import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Where Supabase sends people back after confirming an email, resetting a
 * password or signing in with Google. Turns the code into a session, then
 * sends each role to its own home unless a next path was given.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) return NextResponse.redirect(`${origin}/login?error=callback`);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(`${origin}/login?error=callback`);

  if (next) return NextResponse.redirect(`${origin}${next}`);

  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
  const list = (roles ?? []).map((r) => r.role);
  const home = list.includes("admin") ? "/admin" : list.includes("employee") ? "/employee" : "/dashboard";
  return NextResponse.redirect(`${origin}${home}`);
}
