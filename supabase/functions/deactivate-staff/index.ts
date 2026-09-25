// Admin deactivates a counsellor and hands their open leads to someone else.
//
// POST /functions/v1/deactivate-staff
// { "user_id": "uuid", "reassign_to": "uuid | null", "ban": false }
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
  if (!(roles ?? []).some((r: { role: string }) => r.role === "admin")) {
    return json({ error: "forbidden: admin only" }, 403);
  }

  const { user_id, reassign_to, ban } = await req.json();
  if (!user_id) return json({ error: "user_id is required" }, 400);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

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
