// Admin creates an employee, another admin, or a student account.
// The Admin API needs the service role, so this never lives in the browser.
//
// POST /functions/v1/create-user
// {
//   "email": "counsellor@skavyra.com",
//   "password": "optional — omit to send an invite instead",
//   "role": "employee" | "admin" | "student",
//   "first_name": "...", "last_name": "...", "phone": "...",
//   "employee_code": "...", "designation": "...", "department": "...",
//   "date_of_joining": "2026-02-01", "reporting_manager_id": "uuid"
// }
//
// Flow: verify the caller is an admin -> create the auth user -> call
// provision_user() which writes the profile, the role and the employee row
// in one transaction, and drops the default student role for staff.

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

  // 1. who is calling, and are they an admin
  const asUser = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: { user }, error: userErr } = await asUser.auth.getUser();
  if (userErr || !user) return json({ error: "not authenticated" }, 401);

  const { data: roles } = await asUser.from("user_roles").select("role").eq("user_id", user.id);
  const isAdmin = (roles ?? []).some((r: { role: string }) => r.role === "admin");
  if (!isAdmin) return json({ error: "forbidden: admin only" }, 403);

  let body: Record<string, string | undefined>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid json body" }, 400);
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const role = body.role ?? "employee";
  if (!email) return json({ error: "email is required" }, 400);
  if (!["admin", "employee", "student"].includes(role)) {
    return json({ error: "role must be admin, employee or student" }, 400);
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  // 2. create the auth user (with a password) or invite them (without)
  let newUserId: string | undefined;

  if (body.password) {
    if (body.password.length < 10) {
      return json({ error: "password must be at least 10 characters" }, 400);
    }
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: body.password,
      email_confirm: true,
      user_metadata: { first_name: body.first_name ?? "", last_name: body.last_name ?? "" },
    });
    if (error) return json({ error: error.message }, 400);
    newUserId = data.user?.id;
  } else {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { first_name: body.first_name ?? "", last_name: body.last_name ?? "" },
    });
    if (error) return json({ error: error.message }, 400);
    newUserId = data.user?.id;
  }

  if (!newUserId) return json({ error: "could not create the auth user" }, 500);

  // 3. finish the record atomically
  const { data: provisioned, error: rpcErr } = await admin.rpc("provision_user", {
    p_user_id: newUserId,
    p_role: role,
    p_actor_id: user.id,
    p_first_name: body.first_name ?? "",
    p_last_name: body.last_name ?? "",
    p_email: email,
    p_phone: body.phone ?? null,
    p_employee_code: body.employee_code ?? null,
    p_designation: body.designation ?? null,
    p_department: body.department ?? null,
    p_date_of_joining: body.date_of_joining ?? null,
    p_reporting_manager_id: body.reporting_manager_id ?? null,
  });

  if (rpcErr) {
    // roll back the orphan auth user so a retry is clean
    await admin.auth.admin.deleteUser(newUserId);
    return json({ error: rpcErr.message }, 400);
  }

  return json({ created: true, invited: !body.password, ...provisioned });
});
