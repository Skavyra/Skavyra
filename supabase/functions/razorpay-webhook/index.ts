// Razorpay webhook. Deploy this only once the client hands over the keys.
// Set RAZORPAY_WEBHOOK_SECRET in the function secrets, and deploy with
// --no-verify-jwt, because Razorpay calls it without a Supabase token.
//
// It verifies the signature, finds the payment row by provider_order_id and
// settles it through apply_payment() — the same function the simulated flow
// uses, so nothing else in the app changes when payments go live.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });

  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
  if (!secret) return new Response("webhook secret not configured", { status: 500 });

  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const rawBody = await req.text();

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  if (signature.length !== expected.length || signature !== expected) {
    return new Response("invalid signature", { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const entity = event?.payload?.payment?.entity;
  if (!entity) return new Response("ok", { status: 200 });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { data: payment } = await admin
    .from("payments")
    .select("id, status")
    .eq("provider_order_id", entity.order_id)
    .maybeSingle();

  if (!payment) {
    // unknown order: log it rather than failing, so Razorpay stops retrying
    await admin.from("audit_logs").insert({
      entity_type: "payment",
      action: "razorpay_unmatched_order",
      after: { order_id: entity.order_id, event: event.event },
    });
    return new Response("ok", { status: 200 });
  }

  if (event.event === "payment.captured") {
    await admin.rpc("apply_payment", {
      p_payment_id: payment.id,
      p_provider_payment_id: entity.id,
      p_method: entity.method ?? null,
    });
  } else if (event.event === "payment.failed") {
    await admin
      .from("payments")
      .update({ status: "failed", raw_payload: entity })
      .eq("id", payment.id);
  }

  return new Response("ok", { status: 200 });
});
