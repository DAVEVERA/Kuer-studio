# TODO

## Goal

Ship KUER Studio as a production-safe, monitored application on studio.mnrv.nl and embed it securely in mnrv.nl after all release gates pass.

## Tasks

- [x] Inspect current implementation and reproduce the production blockers.
- [x] Add regression tests for headers, health, validation, exports, quotas, auth boundaries, and webhook idempotency.
- [x] Repair iframe/security headers and mobile navigation accessibility.
- [x] Implement real artwork-preserving SVG/PDF exports and mandatory AI QR validation.
- [x] Enforce cost controls, request limits, API-key rate limits, upload ownership/content validation, and safe error handling.
- [x] Add readiness/health reporting.
- [x] Harden Stripe Checkout/Portal iframe escape and webhook ordering/idempotency.
- [x] Apply and verify the Supabase production migration, RLS, storage, grants, and advisors.
- [ ] Configure and verify Supabase production auth URLs, email delivery, and rate limits.
  - [ ] Submit the prepared `https://studio.mnrv.nl` Site URL and add exact auth redirect URLs.
  - [ ] Enable a production SMTP provider; the built-in sender is limited to 2 emails per hour.
- [ ] Configure and verify Stripe live products, prices, restricted key, portal, and webhook.
  - [ ] Confirm whether KUER should use the existing Stukverdriet Stripe account or a separate KUER account.
  - [ ] Connect the Stripe plugin to the intended account.
- [ ] Deploy and verify KUER on Vercel at studio.mnrv.nl.
- [ ] Add and verify the safe KUER iframe on mnrv.nl.
- [x] Run independent quality-auditor review and repair findings.
- [x] Run the post-repair build, tests, audit, desktop/mobile/iframe/browser smoke tests, and database checks.
- [ ] Run final live endpoint and billing checks after production credentials and DNS are active.
- [x] Update production runbook and scheduled health-check documentation.

## Completion Marker

ALL_TASKS_COMPLETE: false
