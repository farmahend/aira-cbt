# AIRA CBT — Midtrans + Supabase setup

This integration intentionally keeps the Midtrans Server Key on the server. It does not read payment secrets from browser/localStorage.

## 1. Apply the database migration

From the repository root, link the correct Supabase project, then run:

```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Migration: `supabase/migrations/202610290001_package_purchases.sql`.

The migration creates `package_catalog` (authoritative prices and duration) and `package_purchases` (per-user orders). It seeds the five built-in package IDs. If the admin creates or edits packages in the app, update the matching rows in `package_catalog` too; checkout deliberately uses database price/duration rather than trusting the browser.

## 2. Set Supabase Edge Function secrets

In Supabase Dashboard → Project Settings → Edge Functions → Secrets, set:

- `MIDTRANS_SERVER_KEY` = your Midtrans Sandbox **Server Key**
- `MIDTRANS_CLIENT_KEY` = your Midtrans Sandbox **Client Key**
- `MIDTRANS_IS_PRODUCTION` = `false`
- `APP_BASE_URL` = `https://aira-tka.pages.dev`
- `SUPABASE_SERVICE_ROLE_KEY` = the project's service-role key (secret)
- `SUPABASE_ANON_KEY` = the project's anon/publishable key

Never put the Server Key or service-role key in `VITE_*`, source code, GitHub, or browser storage. If a real key was ever committed or shared, rotate it in the provider dashboard.

## 3. Deploy the Edge Functions

```sh
supabase functions deploy midtrans-create
supabase functions deploy midtrans-webhook --no-verify-jwt
```

Configure the Midtrans Dashboard → Settings → Configuration → Payment Notification URL to:

```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/midtrans-webhook
```

Use the Sandbox dashboard and Sandbox keys while testing. Switch `MIDTRANS_IS_PRODUCTION=true` and use Production keys only after sandbox transactions and webhook delivery have been verified.

## 4. Cloudflare Pages environment variables

In Cloudflare Pages → Settings → Environment variables, set for Production and Preview as appropriate:

- `VITE_SUPABASE_URL` = `https://YOUR_PROJECT_REF.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = the anon/publishable key

Trigger a new deployment after changing build variables.

## 5. Important behavior and current limits

- Checkout requires a valid Supabase Auth session. The existing local-only registration/login flow does not create a Supabase Auth session; those accounts must be migrated/connected to Supabase Auth before online checkout will work.
- Only a Midtrans status retrieved server-to-server is accepted. The browser's Snap success callback alone never activates a package.
- The webhook sets expiry once using `package_catalog.duration_days`, and repeat notifications do not extend the access period.
- Students can read only their own purchases through RLS. Client-side inserts/updates to purchases are not permitted.
- This integration records one purchase per order. Bundle package access expansion and enforcing expiry on every exam-launch endpoint still need to be connected to the server-side exam authorization path before treating the entire CBT content as tamper-proof.
