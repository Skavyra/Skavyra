// Admin or HR deactivates a counsellor (HR may not deactivate admins or other HR users) and hands their open leads to someone else.
//
// POST /functions/v1/deactivate-staff
// { "user_id": "uuid", "reassign_to": "uuid | null", "ban": false }
// { "action": "reactivate", "user_id": "uuid" }   switches access back on and lifts any login ban
// { "action": "release_login", "user_id": "uuid" }   after an employee is removed: frees their email so it can sign
//                                                    up again (admin only, and only when they hold no role at all)
//
// ban: true also blocks the login in Supabase Auth. Leave it false to keep
// the account for audit purposes but switch off access in the app.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "missing authorization header" }, 401);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const asUser = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: { user } } = await asUser.auth.getUser();
  if (!user) return json({ error: "not authenticated" }, 401);

  const { data: roles } = await asUser.from("user_roles").select("role").eq("user_id", user.id);
  const callerRoles = (roles ?? []).map((r: { role: string }) => r.role);
  const callerIsAdmin = callerRoles.includes("admin");
  if (!callerIsAdmin && !callerRoles.includes("hr")) {
    return json({ error: "forbidden: admin or HR only" }, 403);
  }

  const { user_id, reassign_to, ban, action } = await req.json();
  if (!user_id) return json({ error: "user_id is required" }, 400);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  // Escalation guard. deactivate_staff() enforces the same rule for direct RPC callers.
  if (!callerIsAdmin) {
    const { data: targetRoles } = await admin.from("user_roles").select("role").eq("user_id", user_id);
    if ((targetRoles ?? []).some((r: { role: string }) => r.role === "admin" || r.role === "hr")) {
      return json({ error: "HR cannot deactivate admin or HR accounts" }, 403);
    }
  }

  if (action === "release_login") {
    if (!callerIsAdmin) return json({ error: "forbidden: admins only" }, 403);

    // a login that still has any role (staff or student) is in use, so it is never touched
    const { data: remaining } = await admin.from("user_roles").select("role").eq("user_id", user_id);
    if ((remaining ?? []).length > 0) return json({ error: "That person still has a role, so their login stays." }, 409);

    const { data: found, error: findErr } = await admin.auth.admin.getUserById(user_id);
    if (findErr || !found?.user) return json({ error: "user not found" }, 404);

    const previous = found.user.email ?? "";
    const freed = `removed-${user_id}@removed.invalid`;
    if (previous === freed) return json({ released: true, already: true });

    const { error: updErr } = await admin.auth.admin.updateUserById(user_id, {
      email: freed,
      email_confirm: true,
      ban_duration: "876000h",
    });
    if (updErr) return json({ error: updErr.message }, 400);

    await admin.from("profiles").update({ email: freed }).eq("id", user_id);
    await admin.from("audit_logs").insert({
      actor_id: user.id,
      entity_type: "user",
      entity_id: user_id,
      action: "login_released",
      after: { previous_email: previous },
    });
    return json({ released: true });
  }

  if (action === "reactivate") {
    const { data, error } = await admin.rpc("reactivate_staff", { p_user_id: user_id, p_actor_id: user.id });
    if (error) return json({ error: error.message }, 400);
    // "Also block them from logging in" bans the auth user, so lift that too.
    await admin.auth.admin.updateUserById(user_id, { ban_duration: "none" });
    return json({ reactivated: true, ...data });
  }

  const { data, error } = await admin.rpc("deactivate_staff", {
    p_user_id: user_id,
    p_actor_id: user.id,
    p_reassign_to: reassign_to ?? null,
  });
  if (error) return json({ error: error.message }, 400);

  if (ban === true) {
    await admin.auth.admin.updateUserById(user_id, { ban_duration: "876000h" });
  }

  return json({ deactivated: true, banned: ban === true, ...data });
});
