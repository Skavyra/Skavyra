import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/** Each panel belongs to exactly one role. Anyone else is sent to their own home. */
const PANELS: { prefix: string; roles: string[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/employee", roles: ["employee"] },
  { prefix: "/dashboard", roles: ["student"] },
];

const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];

function homeFor(roles: string[]) {
  if (roles.includes("admin")) return "/admin";
  if (roles.includes("employee")) return "/employee";
  return "/dashboard";
}

export async function middleware(request: NextRequest) {
  const { supabase, user, response } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  const panel = PANELS.find((p) => pathname === p.prefix || pathname.startsWith(`${p.prefix}/`));
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (!panel && !isAuthPage) return response;

  if (panel && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (!user) return response;

  const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const roles = (data ?? []).map((r) => r.role as string);

  if (isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = homeFor(roles);
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (panel && !panel.roles.some((r) => roles.includes(r))) {
    const url = request.nextUrl.clone();
    url.pathname = homeFor(roles);
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg|logo-mark.svg|logo-full.svg|og-image.png|api/health).*)"],
};
