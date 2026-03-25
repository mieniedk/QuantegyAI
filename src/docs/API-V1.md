# API v1 Reference

Allen Ace LMS exposes stable versioned endpoints under `/api/v1/*`.

## Versioning policy

- Current stable version: `v1`
- Clients should prefer `/api/v1/*` endpoints for long-lived integrations.
- Legacy `/api/*` endpoints remain available for first-party app compatibility.
- Response header: `X-API-Supported-Versions: v1`

## Public endpoints

### `GET /api/v1/health`

Returns service readiness flags and process uptime.

Example response:

```json
{
  "success": true,
  "version": "v1",
  "ok": true,
  "hasKey": true,
  "hasStripe": false,
  "hasAnthropic": true,
  "uptimeSeconds": 12345
}
```

### `GET /api/v1/status`

Returns customer-facing operational status, component states, SLO posture, and burn-rate signals.

### `GET /api/v1/sre/metrics?windowHours=24`

Returns request latency/error telemetry over the selected window.

## OpenAPI and Swagger UI

- Machine-readable OpenAPI spec: `GET /api/v1/openapi.json`
- Interactive API explorer UI: `/api-docs`
- The Swagger UI page reads the live spec from `/api/v1/openapi.json`

## Auth and tenant boundaries

Most write/read teacher data endpoints require JWT auth and enforce tenant scope:

- Self-or-admin guard for `:username` resources
- Class membership/ownership guard for class-scoped chat access

If scope is violated, APIs return:

- `403 Forbidden: tenant boundary violation`

## Error model

Standard API error payload:

```json
{
  "success": false,
  "error": "Human-readable message"
}
```

