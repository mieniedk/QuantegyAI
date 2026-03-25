# Load Testing Guide

Use the built-in script to stress key health/status/SRE endpoints and validate latency/error thresholds.

## Run

```bash
npm run loadtest:api
```

## Environment options

- `LOADTEST_BASE_URL` (default: `http://localhost:3001`)
- `LOADTEST_DURATION_SECONDS` (default: `30`)
- `LOADTEST_CONCURRENCY` (default: `20`)
- `LOADTEST_P95_TARGET_MS` (default: `500`)
- `LOADTEST_ERROR_TARGET_PERCENT` (default: `1`)

Example:

```bash
LOADTEST_DURATION_SECONDS=60 LOADTEST_CONCURRENCY=50 npm run loadtest:api
```

## Output

The script reports:

- Total requests
- Error rate
- p50 / p95 / p99 latency
- Pass/fail verdict against thresholds

Exit codes:

- `0` = pass
- `2` = thresholds breached

