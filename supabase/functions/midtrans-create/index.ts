import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY");
  const production = Deno.env.get("MIDTRANS_IS_PRODUCTION") === "true";
  if (!supabaseUrl || !anonKey || !serviceKey || !serverKey) {
    return json({ error: "Checkout belum dikonfigurasi di server." }, 503);
  }

  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return json({ error: "Silakan masuk terlebih dahulu." }, 401);
  const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: authorization },
  });
  if (!authResponse.ok) return json({ error: "Sesi login tidak valid." }, 401);
  const user = await authResponse.json();
  if (!user?.id) return json({ error: "Pengguna tidak valid." }, 401);

  let body: { packageId?: string };
  try { body = await req.json(); } catch { return json({ error: "Request tidak valid." }, 400); }
  if (!body.packageId || typeof body.packageId !== "string") return json({ error: "Paket tidak valid." }, 400);

  const dbHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" };
  const packageResponse = await fetch(
    `${supabaseUrl}/rest/v1/package_catalog?select=id,title,price,duration_days&is_active=eq.true&id=eq.${encodeURIComponent(body.packageId)}`,
    { headers: dbHeaders },
  );
  if (!packageResponse.ok) return json({ error: "Gagal memeriksa katalog paket." }, 502);
  const packages = await packageResponse.json();
  const pkg = packages[0];
  if (!pkg || pkg.price <= 0) return json({ error: "Paket tidak ditemukan atau tidak dapat dibeli." }, 404);

  const orderId = `AIRA-${crypto.randomUUID()}`;
  const purchaseResponse = await fetch(`${supabaseUrl}/rest/v1/package_purchases`, {
    method: "POST",
    headers: { ...dbHeaders, Prefer: "return=minimal" },
    body: JSON.stringify({ user_id: user.id, package_id: pkg.id, order_id: orderId, amount: pkg.price, payment_status: "pending" }),
  });
  if (!purchaseResponse.ok) return json({ error: "Tidak dapat membuat catatan transaksi." }, 502);

  const snapBase = production ? "https://app.midtrans.com/snap/v1/transactions" : "https://app.sandbox.midtrans.com/snap/v1/transactions";
  const midtransResponse = await fetch(snapBase, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(serverKey + ":")}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      transaction_details: { order_id: orderId, gross_amount: pkg.price },
      item_details: [{ id: pkg.id, price: pkg.price, quantity: 1, name: String(pkg.title).slice(0, 50) }],
      customer_details: { first_name: String(user.user_metadata?.full_name || user.email || "Siswa").slice(0, 50), email: user.email || "" },
      callbacks: { finish: Deno.env.get("APP_BASE_URL") || "https://aira-tka.pages.dev" },
    }),
  });
  const snapData = await midtransResponse.json();
  if (!midtransResponse.ok || !snapData.token) {
    await fetch(`${supabaseUrl}/rest/v1/package_purchases?order_id=eq.${encodeURIComponent(orderId)}`, {
      method: "PATCH", headers: dbHeaders, body: JSON.stringify({ payment_status: "failure", updated_at: new Date().toISOString() }),
    });
    return json({ error: "Midtrans gagal membuat sesi pembayaran.", detail: snapData.message || snapData.error_messages?.join(", ") }, 502);
  }
  return json({ token: snapData.token, orderId, clientKey: Deno.env.get("MIDTRANS_CLIENT_KEY") || "" });
});
