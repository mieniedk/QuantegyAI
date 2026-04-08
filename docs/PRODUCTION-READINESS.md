# Production Readiness Assessment

**Date:** 2026-03-27
**Branch:** `cursor/production-readiness-status-451b`
**Verdict:** NOT production ready — critical security and reliability issues must be resolved first.

---

## Summary

| Category | Status | Details |
|----------|--------|---------|
| **Build** | PASS | Vite production build succeeds (4.9s) |
| **Lint** | FAIL | 536 errors, 97 warnings |
| **Unit Tests** | FAIL | 3 of 44 tests failing |
| **npm Audit** | FAIL | 7 vulnerabilities (2 high, 1 moderate, 4 low) |
| **Security** | CRITICAL | Unauthenticated password reset, open AI endpoints, IDOR risks |
| **Error Handling** | NEEDS WORK | Errors returned with HTTP 200, inconsistent status codes |
| **Deployment Config** | PARTIAL | Docker + Vercel configs exist but incomplete |
| **Test Coverage** | LOW | Large API surface untested; no component tests |
| **Observability** | PARTIAL | Audit log exists but no structured logging framework |

---

## CRITICAL — Must Fix Before Production

### 1. Unauthenticated Password Reset

`POST /api/auth/reset-password` accepts `{ username, newPassword }` with **no proof of identity** — no email verification, no OTP, no admin gate. Any actor who can guess a username can reset the password.

**File:** `server/index.js` (around line 1214)
**Fix:** Require email-token or OTP verification before allowing password change, or restrict to admin-only with `requireAdmin` middleware.

### 2. Unauthenticated AI / LLM Endpoints (Cost & Abuse Exposure)

Many Anthropic-backed routes have **no `requireAuth` middleware**:
- `POST /api/chat`
- `POST /api/generate-*` (multiple endpoints)
- `POST /api/ai/plagiarism-check`
- `POST /api/test-key`
- `POST /api/question-bank`
- `GET /api/models`

Any unauthenticated user (or bot) can burn API quota and cost. Rate limiting alone is insufficient — it is in-memory and per-process.

**Fix:** Add `requireAuth` (or at minimum `requireTeacher`) to all AI-powered and cost-bearing routes.

### 3. Broken Object-Level Authorization (IDOR)

- `GET /api/auth/submissions/student/:studentId` — any logged-in user can read any student's submissions.
- Wiki, SCORM, course-export routers verify `requireTeacher` but **do not check the teacher owns the `classId`** — cross-tenant read/write risk.

**Fix:** Enforce ownership checks: compare `req.user.username` against the teacher who owns the class before returning or modifying data.

### 4. Development Auth Backdoor

`authMiddleware` accepts `req.body.username` as the authenticated identity when `NODE_ENV !== 'production'`. If production ever starts without `NODE_ENV=production` set, authentication is bypassed entirely.

**Fix:** Remove the body-username fallback or explicitly fail-closed when `JWT_SECRET` is absent regardless of `NODE_ENV`.

### 5. Demo SSO (Not Real OAuth)

SSO callbacks ignore the authorization `code` and mint a fake user with a redirect token. This is stub code, not a working OAuth integration.

**Fix:** Implement proper OAuth code exchange with the identity provider, or remove SSO routes from production builds.

---

## HIGH — Should Fix Before Production

### 6. npm Vulnerabilities (7 total, 2 high)

| Package | Severity | Issue |
|---------|----------|-------|
| `multer` < 2.1.1 | HIGH | DoS via uncontrolled recursion |
| `socket.io-parser` 4.0.0–4.2.5 | HIGH | Unbounded binary attachments |
| `dompurify` 3.1.3–3.3.1 | MODERATE | XSS vulnerability |
| `nodemailer` < 8.0.4 | LOW | SMTP command injection |
| `qs` 6.7.0–6.14.1 | LOW | arrayLimit bypass DoS |
| `quill` 2.0.3 | LOW | XSS via HTML export |

Most are fixable with `npm audit fix`. The `quill` XSS requires a breaking-change upgrade of `react-quill-new`.

### 7. ESLint: 536 Errors

Primarily `no-unused-vars` (unused destructured variables, function params) and `react-hooks/exhaustive-deps` warnings. While many are non-functional, they signal dead code and potential bugs. The orphaned `texes_comp001_questions.js` at repo root also triggers a parse error.

### 8. Failing Unit Tests (3 of 44)

All 3 failures are in `learning-loop-production.test.mjs`:
- `maybeMigrateDomainToStandard` — migration logic not writing expected keys
- `retryMasteryPersist` — mastery entry structure mismatch
- `touchLoopSessionStart` — session cap logic returning null

These indicate regressions in the mastery/learning-loop storage layer.

### 9. Socket.IO Security

- CORS set to `origin: '*'` — any website can connect.
- Invalid JWT falls back to "guest" instead of rejecting the connection.
- No enrollment verification before allowing `chat:*` messages.
- Default JWT secret fallback in code if `JWT_SECRET` env var is unset.

### 10. Stripe Webhook Verification Bypass

`/api/billing/webhook` falls back to `JSON.parse(req.body)` when `STRIPE_WEBHOOK_SECRET` is unset. In production, this allows anyone to forge webhook events.

**Fix:** Fail closed — refuse to process webhooks without signature verification.

### 11. Error Handling Returns HTTP 200 for Errors

`asyncHandler` and the global Express error middleware return `{ success: false, error: msg }` with **status 200**. This breaks HTTP semantics and makes monitoring/alerting on error rates unreliable.

---

## MEDIUM — Should Address for Production Quality

### 12. No `.env.example`

No documentation of required environment variables in the repo. Operators must read source code to discover `JWT_SECRET`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SMTP_*`, `GOOGLE_CLIENT_ID`, `MICROSOFT_CLIENT_ID`, etc.

### 13. `index.html` Stack Trace Exposure

`window.onerror` handler renders error message, source URL, line number, column, and stack into the DOM. In production this leaks implementation details to users.

### 14. Hardcoded Fallback API URL

`src/utils/studentAuth.js` and `src/components/SaveProgressModal.jsx` fall back to `https://quantegyai-api.onrender.com` when `VITE_API_URL` is unset. This creates implicit coupling to a specific deployment.

### 15. Firebase Client Config in Public HTML

`public/games/q-blocks.html` contains a Firebase `apiKey` and `projectId`. While client-side Firebase keys are semi-public by design, they still require Firebase Console restrictions (domain allowlists, App Check) to prevent abuse.

### 16. Rate Limiting is In-Memory Only

`rateLimit.js` uses per-process in-memory buckets. Across multiple server instances (Docker replicas, horizontal scaling), rate limits are not shared. Consider Redis or edge-level rate limiting.

### 17. No Structured Logging

Server uses `console.log`/`console.error` throughout. No JSON-structured logging (Pino, Winston) for aggregation, alerting, or trace correlation. The audit module writes JSONL but doesn't cover general request/response logging.

### 18. Large Untested API Surface

`server/index.js` registers ~156 route handlers. API tests cover a fraction: auth basics, health, RBAC samples, billing, grades, mastery admin, notifications, search, LTI admin, onboarding. Uncovered: all AI routes, chat, assessments, student billing flows, webhooks, Socket.IO, wiki, SCORM, course export, announcements, discussions, file management, calendar.

### 19. No Automated Code Coverage Gate

Neither Vitest nor CI is configured to measure or enforce code coverage thresholds.

### 20. Orphaned File at Repo Root

`texes_comp001_questions.js` is an invalid JavaScript fragment at the repo root with no imports referencing it. It should be removed or merged into `src/data/`.

---

## What Works Well

- **Build pipeline:** Vite production build with manual chunking, hashed assets, and code splitting (lazy routes with `React.lazy` + prefetch).
- **CI/CD foundation:** GitHub Actions pipeline covering lint, build, unit tests, API tests, security guardrails subset, onboarding + accessibility E2E, and Docker image build.
- **Security headers:** Custom middleware sets `X-Content-Type-Options`, `Referrer-Policy`, `COOP`/`COEP`, `Permissions-Policy`, and CSP (though `helmet` would be more maintainable).
- **Audit logging:** `audit.js` writes JSONL with sensitive field redaction (`password`, `token`, `secret`, `apiKey`).
- **SRE tooling:** In-memory request metrics, SLO monitoring, alerting hooks, and a load test script.
- **React error boundaries:** Global boundary + per-route boundaries for game/prep pages.
- **Database:** SQLite with WAL mode, busy timeout, foreign keys, parameterized queries (strong SQL injection prevention), and versioned migrations.
- **Production env validation:** `validateProductionEnv()` checks for `JWT_SECRET` and SSO configuration at startup.
- **Backup/restore scripts:** Data backup, restore, and verification tooling.
- **Accessibility:** Dedicated E2E accessibility smoke tests and screen-reader testing documentation.

---

## Prioritized Action Plan

### Phase 1 — Security (Block Production)
1. Fix unauthenticated password reset (add email/OTP verification)
2. Add `requireAuth` to all AI/LLM endpoints
3. Fix IDOR on submissions and cross-tenant wiki/SCORM/export routes
4. Remove dev auth backdoor or make it fail-closed
5. Require Stripe webhook signature verification in production
6. Lock down Socket.IO: reject invalid JWT, restrict CORS origins, verify enrollment
7. Run `npm audit fix` for high/moderate vulnerabilities

### Phase 2 — Reliability (Before Launch)
8. Fix 3 failing unit tests
9. Fix ESLint errors (at minimum, address unused vars and remove orphaned root file)
10. Return proper HTTP status codes from error handlers
11. Remove stack trace exposure from `index.html` error handler
12. Add `.env.example` with all required variables documented
13. Replace hardcoded fallback API URLs with build-time validation

### Phase 3 — Operational Maturity (Before Scale)
14. Add structured JSON logging (Pino or Winston)
15. Implement distributed rate limiting (Redis)
16. Expand API test coverage to critical untested routes
17. Add code coverage measurement and CI gate
18. Add SAST/dependency scanning to CI pipeline
19. Add multi-browser E2E (WebKit, Firefox) and critical-flow tests to CI
20. Complete SSO implementation or remove SSO routes
