// Simulated payment. Creates a payment row and settles it through the same
// apply_payment() function the Razorpay webhook will call later, so switching
// to live payments does not change any other code path.
//
// POST { enrollment_id, amount, installment_id?, purpose?, outcome? }
// outcome: "success" (default) | "failed"  — "failed" lets you test the UI.

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

  // 1. who is calling
  const asUser = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userErr } = await asUser.auth.getUser();
  if (userErr || !user) return json({ error: "not authenticated" }, 401);

  const { data: roles } = await asUser.from("user_roles").select("role").eq("user_id", user.id);
  const isStaff = (roles ?? []).some((r: { role: string }) => r.role === "admin" || r.role === "employee");

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid json body" }, 400);
  }

  const enrollmentId = body.enrollment_id as string | undefined;
  const amount = Number(body.amount);
  const installmentId = (body.installment_id as string | undefined) ?? null;
  const purpose = (body.purpose as string | undefined) ?? "full";
  const outcome = (body.outcome as string | undefined) ?? "success";

  if (!enrollmentId || !Number.isFinite(amount) || amount <= 0) {
    return json({ error: "enrollment_id and a positive amount are required" }, 400);
  }

  // 2. service role from here: the browser must never write payment rows
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: enrollment, error: enrErr } = await admin
    .from("enrollments")
    .select("id, user_id, total_amount, amount_paid")
    .eq("id", enrollmentId)
    .single();

  if (enrErr || !enrollment) return json({ error: "enrollment not found" }, 404);

  // a student may only pay for their own enrolment; staff may pay for anyone
  if (!isStaff && enrollment.user_id !== user.id) {
    return json({ error: "forbidden" }, 403);
  }

  const remaining = Number(enrollment.total_amount) - Number(enrollment.amount_paid);
  if (amount > remaining + 0.001) {
    return json({ error: `amount exceeds balance of ${remaining}` }, 400);
  }

  const { data: payment, error: payErr } = await admin
    .from("payments")
    .insert({
      enrollment_id: enrollmentId,
      installment_id: installmentId,
      user_id: enrollment.user_id,
      amount,
      purpose,
      provider: "simulated",
      status: "created",
      method: "simulated",
      created_by: user.id,
      raw_payload: { simulated: true, requested_by: user.id },
    })
    .select()
    .single();

  if (payErr) return json({ error: payErr.message }, 400);

  if (outcome === "failed") {
    await admin.from("payments").update({ status: "failed" }).eq("id", payment.id);
    return json({ status: "failed", payment_id: payment.id });
  }

  const { data: settled, error: applyErr } = await admin.rpc("apply_payment", {
    p_payment_id: payment.id,
    p_provider_payment_id: `sim_${payment.id.slice(0, 12)}`,
    p_method: "simulated",
  });

  if (applyErr) return json({ error: applyErr.message }, 400);

  return json({ status: "success", payment: settled });
});
