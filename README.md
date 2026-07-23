# KUER Studio

KUER Studio is a Windows 95-inspired production web app for creating, validating, managing, publishing, and measuring branded QR codes.

## Local setup

1. Copy `.env.example` to `.env.local` and add the Supabase, Stripe, Replicate, and OpenAI credentials.
2. Apply the timestamped migrations under `supabase/migrations` to the target Supabase project.
3. Run `npm run stripe:setup` to idempotently provision the KUER Stripe sandbox products and prices.
4. Run `npm run dev` and open `http://localhost:3000`.

## Required Supabase Auth settings

- Set the Site URL to the deployed application URL.
- Add `http://localhost:3000/auth/callback` and the production `/auth/callback` URL to Redirect URLs.
- Keep email OTP enabled. The app accepts both a one-time email code and the secure email link.

## Stripe webhooks

Forward local events with:

```powershell
stripe listen --project-name kuer-studio --forward-to http://localhost:3000/api/stripe/webhook
```

Production must send `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted` to `/api/stripe/webhook` with its production signing secret.

Do not enable Stripe automatic tax until an active tax registration has been confirmed for the business.

## Production release order

1. Run the full verification matrix below.
2. Apply Supabase migrations and require a clean Security Advisor.
3. In Supabase Auth, set the Site URL to `https://studio.mnrv.nl`, allow `https://studio.mnrv.nl/auth/callback`, configure custom SMTP, verify OTP delivery, and enable leaked-password protection.
4. Connect the live Stripe account; create live Pro/Studio monthly and yearly prices, a Customer Portal configuration, a restricted live key, and the signed webhook at `https://studio.mnrv.nl/api/stripe/webhook`.
5. Set the live Stripe IDs/secrets as Vercel Production environment variables. Never copy sandbox IDs into Production.
6. Deploy KUER to the linked Vercel `kuer-studio` project and require `/api/health` to return HTTP 200 with `status: ready`.
7. Attach `studio.mnrv.nl` and add the DNS record requested by Vercel.
8. Verify desktop, 375px mobile, authenticated generation, exact QR decoding, exports, billing escape from the iframe, and an approved `mnrv.nl` iframe.
9. Only then publish the iframe change on `mnrv.nl`.

## Operations

- Deep health endpoint: `GET https://studio.mnrv.nl/api/health`.
- Scheduled monitoring is defined in `.github/workflows/production-health.yml` and fails if the endpoint is not both HTTP 200 and `ready`.
- Review Vercel runtime errors and Supabase Auth/Postgres/Storage logs after every release and during incidents.
- Run Supabase Security and Performance Advisors after every migration. Unused-index notices on an empty database are informational; new security warnings are release blockers.
- Stripe webhook events are claimed idempotently in `stripe_webhook_events`; investigate any rows left in `failed` or `processing` for more than five minutes.
- Rotate API keys, Stripe restricted keys, webhook secrets, Supabase secret keys, AI provider keys, and `SCAN_HASH_SALT` on suspected exposure.

## Verification

```powershell
npm run typecheck
npm test
npm run build
npm run audit:prod
npm run test:e2e
```
