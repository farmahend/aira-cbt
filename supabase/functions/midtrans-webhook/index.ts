import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY");
  const production = Deno.env.get("MIDTRANS_IS_PRODUCTION") === "true";
  if (!supabaseUrl || !serviceKey || !serverKey) return new Response("Not configured", { status: 503 });

  let notification: { order_id?: string };
  try { notification = await req.json(); } catch { return new Response("Invalid JSON", { status: 400 }); }
  if (!notification.order_id) return new Response("Missing order_id", { status: 400 });

  // Never trust the notification body alone: retrieve the transaction status directly from Midtrans.
  const statusBase = production ? "https://api.midtrans.com/v2" : "https://api.sandbox.midtrans.com/v2";
  const statusResponse = await fetch(`${statusBase}/${encodeURIComponent(notification.order_id)}/status`, {
    headers: { Authorization: `Basic ${btoa(serverKey + ":")}` },
  });
  if (!statusResponse.ok) return new Response("Midtrans status verification failed", { status: 502 });
  const status = await statusResponse.json();

  const dbHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", Prefer: "return=minimal" };
  const rowResponse = await fetch(
    `${supabaseUrl}/rest/v1/package_purchases?select=order_id,amount,package_id&order_id=eq.${encodeURIComponent(notification.order_id)}`,
    { headers: dbHeaders },
  );
  if (!rowResponse.ok) return new Response("Purchase lookup failed", { status: 502 });
  const rows = await rowResponse.json();
  const purchase = rows[0];
  if (!purchase || Number(status.gross_amount) !== Number(purchase.amount) || status.order_id !== purchase.order_id) {
    return new Response("Transaction mismatch", { status: 400 });
  }

  const transactionStatus = String(status.transaction_status || "");
  let paymentStatus = transactionStatus;
  if (transactionStatus === "capture" && status.fraud_status !== "accept") paymentStatus = "deny";
  const paid = transactionStatus === "settlement" || (transactionStatus === "capture" && status.fraud_status === "accept");
  const now = new Date();
  const patch: Record<string, unknown> = { payment_status: paymentStatus, updated_at: now.toISOString() };
  if (paid) {
    // Set the access window only once so repeated Midtrans notifications cannot extend it.
    const existingResponse = await fetch(
      `${supabaseUrl}/rest/v1/package_purchases?select=purchased_at,expires_at&order_id=eq.${encodeURIComponent(purchase.order_id)}`,
      { headers: dbHeaders },
    );
    const existingRows = existingResponse.ok ? await existingResponse.json() : [];
    if (!existingRows[0]?.purchased_at || !existingRows[0]?.expires_at) {
      const catalogResponse = await fetch(
        `${supabaseUrl}/rest/v1/package_catalog?select=duration_days&id=eq.${encodeURIComponent(purchase.package_id)}`,
        { headers: dbHeaders },
      );
      const catalogRows = catalogResponse.ok ? await catalogResponse.json() : [];
      const durationDays = Number(catalogRows[0]?.duration_days);
      if (!Number.isFinite(durationDays) || durationDays < 1) return new Response("Invalid package duration", { status: 500 });
      patch.purchased_at = now.toISOString();
      patch.expires_at = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    }
  }
  const update = await fetch(
    `${supabaseUrl}/rest/v1/package_purchases?order_id=eq.${encodeURIComponent(purchase.order_id)}`,
    { method: "PATCH", headers: dbHeaders, body: JSON.stringify(patch) },
  );
  if (!update.ok) return new Response("Purchase update failed", { status: 502 });
  return new Response("OK", { status: 200 });
});
