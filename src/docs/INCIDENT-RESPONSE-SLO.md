# Incident Response Targets and Process

This runbook defines response expectations for production incidents.

## Severity Definitions

## SEV-1 (Critical)

- Full outage, data loss risk, or broad inability to teach/submit/grade
- Example: auth down globally, submissions failing for all students

## SEV-2 (Major)

- Significant degradation affecting many users, no immediate data-loss risk
- Example: Gradebook API elevated 5xx in a region or for a major flow

## SEV-3 (Minor)

- Limited impact, workaround exists, non-critical feature degraded

## Response Time Objectives

| Severity | Acknowledge | Mitigation Start | Status Update Cadence |
|---|---:|---:|---:|
| SEV-1 | <= 5 min | <= 30 min | Every 15 min |
| SEV-2 | <= 15 min | <= 120 min | Every 30 min |
| SEV-3 | <= 60 min | <= 480 min | Every 120 min |

## Standard Incident Workflow

1. **Detect and classify** the incident (SEV-1/2/3)
2. **Acknowledge** within target
3. **Assign incident commander** and communication owner
4. **Start mitigation** (rollback, traffic shift, feature flag, hotfix)
5. **Post regular updates** at required cadence
6. **Resolve and verify**
7. **Publish postmortem** within 2 business days for SEV-1/2

## Required Incident Metadata

- Incident ID
- Severity and impact summary
- Start time, detect time, ack time, mitigation time, resolve time
- Affected services/endpoints
- Root cause category
- Corrective/preventive actions and owners

## Escalation Policy

- If no mitigation owner within ack window, auto-escalate to engineering lead
- If incident exceeds 2x mitigation target, escalate to product + operations leadership

