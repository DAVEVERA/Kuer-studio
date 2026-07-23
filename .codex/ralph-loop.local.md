# Ralph Loop State

status: active
iteration: 6
max_iterations: 10
started_at: 2026-07-23T20:09:46+02:00
task: Repair all production blockers, rerun the full try-out, configure Supabase/Stripe/Vercel production, and safely embed KUER Studio on mnrv.nl.

## Completion Criteria

- [ ] Production build, typecheck, automated tests, dependency audit, and browser smoke tests pass.
- [ ] QR generation, real scan validation, artwork-preserving PNG/SVG/PDF exports, and protected persistence flows are verified.
- [ ] API quota/rate limits, webhook idempotency, security headers, iframe policy, health checks, and mobile accessibility are production-safe.
- [ ] Supabase production schema, RLS, storage, migrations, redirects, auth delivery, and advisors are verified.
- [ ] Stripe live products/prices, restricted key access, Customer Portal, and production webhook are verified without guessing tax registrations.
- [ ] KUER is deployed on studio.mnrv.nl with monitored health and successful live smoke tests.
- [ ] mnrv.nl embeds KUER only after the live quality gate, with a fullscreen fallback and safe navigation for auth/billing.
- [ ] No unintended files changed and existing user work remains intact.
- [ ] Independent quality-auditor gate passes or all remaining blockers are explicitly documented.
- [ ] Final summary prepared.

## Iteration Log

### Iteration 0

Plan:
- Establish release criteria and capture the known failing gates.

Changes:
- Created Ralph-loop state and task ledger.

Verification:
- Git repository confirmed.
- Existing dirty worktree inventoried and preserved.

Decision:
- continue

Next:
- Add failing regression coverage for the confirmed blockers before implementing fixes.

### Iteration 1

Plan:
- Reproduce and fix iframe headers, fail-open QR validation, and placeholder artwork exports.

Changes:
- Added Vitest and four production-readiness regression tests.
- Added strict MNRV-only frame ancestors, CSP, HSTS, and popup-compatible COOP.
- Made QR validation fail closed when no real decoder succeeds.
- Added artwork-preserving hybrid SVG and binary jsPDF export paths.
- Removed unsupported CMYK export copy.

Verification:
- `npm test` - failed with four expected blocker assertions before implementation.
- `npm test` - passed 4/4 after implementation.

Decision:
- continue

Next:
- Add health/readiness, cost controls, upload hardening, webhook idempotency, and AI validation.

### Iteration 2

Plan:
- Reproduce backend security gaps with focused tests, then implement the narrow fixes.

Changes:
- Added deep readiness health reporting and exposed only that route publicly.
- Added API-key rate limiting backed by an atomic Supabase function.
- Added owned-project and decoded-PNG validation for QR asset uploads.
- Added Stripe webhook claiming, retry state, ordering protection, and event persistence.
- Added real decoder validation for generated AI variants and preserved reports when saving.
- Added bounded HTTP URL, prompt, color, JSON, and image data validation.
- Added quota charging before paid prompt and vision provider calls.
- Added embedded-mode fullscreen escape, accessible toolbar names, and top-level billing navigation.

Verification:
- Focused backend suite failed with six expected assertions before implementation.
- Focused input suite failed with two expected assertions before implementation.
- Combined backend and input hardening suite passed 8/8 after implementation.

Decision:
- continue

Next:
- Run the full automated suite, typecheck, dependency audit, and production build; repair all integration failures.

### Iteration 3

Plan:
- Execute the complete local release gate and repair integration-only failures.

Changes:
- Added repeatable Vitest and Playwright production suites.
- Added authenticated E2E setup with automatic temporary-user cleanup.
- Added a 15-second deterministic unit-test timeout for heavy Stripe module loading.
- Added exact decoder verification across generated local QR variants.

Verification:
- `npm test` passed 12/12 before the Vercel packaging regression was added.
- `npm run typecheck` passed.
- `npm run audit:prod` reported 0 vulnerabilities.
- `npm run build` completed all 31 routes.
- `npm run test:e2e` passed 6 release checks with 2 project-specific skips.

Decision:
- continue

Next:
- Apply and verify Supabase production, then prepare Vercel and Stripe production configuration.

### Iteration 4

Plan:
- Configure the production database and hosting project without publishing test billing credentials.

Changes:
- Applied the production foundation and advisor-hardening migrations to Supabase.
- Aligned local migration filenames with remote migration history.
- Corrected the Vercel project framework from generic output to Next.js.
- Added 11 non-Stripe Production environment variables with appropriate public/secret visibility.
- Made `/auth/error` explicitly dynamic so Vercel packages the mixed auth segment correctly.
- Added a production runbook and scheduled deep-health workflow.

Verification:
- Supabase: 13/13 public tables have RLS; Security Advisor has 0 findings.
- Supabase: anon/authenticated cannot execute service-only functions; service role can.
- Supabase rate limiter returned allowed, allowed, denied for a limit of two and test data was removed.
- Vercel production build completed compilation, typecheck, 30/30 static generation and serverless function creation; local packaging then hit Windows symlink EPERM.
- Stripe plugin returned `USER_NOT_LOGGED_IN`; local Stripe resources are sandbox-only.

Decision:
- continue after external account gates are unlocked

Next:
- Connect Stripe, create and verify live billing resources, complete hosted Supabase Auth settings, deploy, attach DNS, run live E2E, then embed on mnrv.nl.

### Iteration 5

Plan:
- Convert every independent-auditor P1 finding into a failing regression, repair it, and repeat the full release gate.

Changes:
- Removed direct authenticated Storage writes and routed validated uploads through the service-backed API only.
- Added user-based burst rate limits to all browser AI and QR-upload endpoints.
- Sanitized OTP return paths to prevent external redirects.
- Replaced the Stripe select-then-upsert race with one conditional, atomic database RPC.
- Tightened production health checks for the canonical URL, live Stripe key shape, AI providers, and scan salt.
- Rebuilt upload dropzones as native accessible controls and enlarged mobile title/menu/task controls.

Verification:
- Auditor regression suite failed 7/7 before the fixes and passed 7/7 afterward.
- Full Vitest suite passed 20/20; typecheck and production build passed.
- Production browser suite passed 6/6 applicable checks with 2 intentional project skips.
- Live Supabase migration applied as `20260723191144_atomic_stripe_and_storage_lockdown`.
- Direct QR Storage write policies: 0; Stripe RPC: security definer with service-role-only execute.
- Live transactional Stripe ordering test accepted event 200, rejected stale event 100, preserved the current plan, and removed its test user.
- Supabase Security Advisor: 0 findings; performance notices are unused-index info before traffic.

Decision:
- continue; code and database P1 findings are repaired, while Stripe live access and hosted auth settings remain external account gates.

Next:
- Run the independent re-audit, then finish Stripe live and Supabase Auth once account access is available; only afterward deploy, attach DNS, and embed.

### Iteration 6

Plan:
- Re-audit the auditor repairs against live contracts and computed browser behavior, not source-string presence alone.

Changes:
- Matched browser rate limiting to the live RPC parameter names and table-shaped response.
- Added an authenticated E2E request through the protected upload endpoint to prove the live rate limiter no longer returns 503.
- Replaced shape-only production readiness with authenticated probes for all live Stripe prices, the Replicate account, and both configured OpenAI models.
- Raised mobile body copy to 16px and fixed CSS-specificity conflicts so actual toolbar and labelled icon controls compute to at least 44 x 44 pixels.
- Extended E2E coverage to measure real DOM target bounds at 375px.

Verification:
- Full Vitest suite passed 20/20; typecheck, dependency audit, and production build passed.
- Browser suite passed 6/6 applicable checks with 2 intentional project skips.
- Independent quality-auditor final verdict: PASS, with 0 P0 and 0 P1 findings.
- Chromium measurements: body 16px, toolbar link 49.125 x 44px, labelled content button 44 x 44px.

Decision:
- continue after external account decisions; code readiness is PASS, deployment readiness is intentionally blocked.

External gates discovered:
- Supabase Site URL change is prepared but not submitted; custom SMTP is disabled and the built-in sender is limited to 2 emails per hour.
- Supabase leaked-password protection is unavailable on the current Free plan; KUER uses OTP rather than passwords.
- The requested Stripe connector is not connected, and the logged-in browser exposes the live `Stukverdriet` account rather than a KUER-specific account.
- Vercel deployment, studio.mnrv.nl DNS activation, and the mnrv.nl iframe remain untouched to preserve the required order.

Next:
- Confirm the intended Stripe account, connect Stripe, provide/choose production SMTP, approve the prepared Supabase Auth URL submission, then deploy and perform the final live/iframe gate.
