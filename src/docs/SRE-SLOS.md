# SRE Service Level Objectives (SLOs)

This document defines Allen Ace LMS production reliability targets.

## 1) Availability SLO

- **Objective:** Platform monthly availability
- **Target:** `>= 99.9%` over a rolling 30-day window
- **Error budget:** `0.1%` downtime per 30 days
- **Budget in minutes:** `43.2` minutes/month

### Availability formula

`availability % = (total minutes - downtime minutes) / total minutes * 100`

Downtime includes:

- Frontend unavailable to end users
- API unavailable for core flows (auth, class view, assessments, gradebook)
- Severe partial outage equivalent to full service interruption for most users

## 2) API Latency SLO

- **Window:** rolling 24 hours
- **Target p50:** `<= 150 ms`
- **Target p95:** `<= 400 ms`
- **Target p99:** `<= 1000 ms`

Scope:

- All tracked `/api/*` endpoints except `/api/health` and `/api/sre/*`

## 3) Reliability/Error Rate SLO

- **Window:** rolling 24 hours
- **Target:** HTTP `5xx <= 0.5%`

## 4) Page Load Targets (RUM)

These are frontend performance targets to validate with real-user monitoring:

- **p75 page load:** `<= 2500 ms`
- **p95 page load:** `<= 4000 ms`

## 5) Incident Response SLOs

- **SEV-1 (critical):**
  - Ack: `<= 5 min`
  - Mitigation start: `<= 30 min`
  - Stakeholder updates: every `15 min`
- **SEV-2 (major):**
  - Ack: `<= 15 min`
  - Mitigation start: `<= 120 min`
  - Stakeholder updates: every `30 min`
- **SEV-3 (minor):**
  - Ack: `<= 60 min`
  - Mitigation start: `<= 480 min`
  - Stakeholder updates: every `120 min`

## 6) Alerting Policy (Burn-Rate Inspired)

Create alerts when either condition is true:

- **Fast burn:** >10% of monthly availability error budget consumed in 1 hour
- **Slow burn:** >25% of monthly availability error budget consumed in 6 hours
- **Latency breach:** p95 or p99 above target for 15+ consecutive minutes
- **5xx breach:** error rate above 0.5% for 10+ consecutive minutes

Burn-rate API:

- `GET /api/sre/burn-rate`

## 7) Reporting Endpoints

SLO definitions and telemetry are exposed from the backend:

- `GET /api/sre/slos`
- `GET /api/sre/metrics?windowHours=24`
- `GET /api/sre/incident-targets`
- `GET /api/sre/snapshots?limit=200`
- `POST /api/sre/alerts/check` (admin)
- `GET /api/status`

## 8) Operational Review Cadence

- Daily: check SLO dashboard and open alerts
- Weekly: error budget trend and top failing endpoints
- Monthly: postmortem review and objective adjustments

