const BASE_URL = process.env.LOADTEST_BASE_URL || 'http://localhost:3001';
const DURATION_SECONDS = Number(process.env.LOADTEST_DURATION_SECONDS || 30);
const CONCURRENCY = Number(process.env.LOADTEST_CONCURRENCY || 20);
const P95_TARGET_MS = Number(process.env.LOADTEST_P95_TARGET_MS || 500);
const ERROR_TARGET_PERCENT = Number(process.env.LOADTEST_ERROR_TARGET_PERCENT || 1);

const endpoints = [
  '/api/v1/health',
  '/api/v1/status',
  '/api/v1/sre/metrics?windowHours=1',
];

function percentile(arr, p) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

async function hit(url) {
  const start = performance.now();
  try {
    const res = await fetch(url);
    const ms = performance.now() - start;
    return { ok: res.ok, ms };
  } catch {
    const ms = performance.now() - start;
    return { ok: false, ms };
  }
}

async function runWorker(deadlineMs, latencies, counters, workerId) {
  let i = workerId;
  while (Date.now() < deadlineMs) {
    const endpoint = endpoints[i % endpoints.length];
    const result = await hit(`${BASE_URL}${endpoint}`);
    latencies.push(result.ms);
    counters.total += 1;
    if (!result.ok) counters.errors += 1;
    i += 1;
  }
}

async function main() {
  const latencies = [];
  const counters = { total: 0, errors: 0 };
  const deadlineMs = Date.now() + (DURATION_SECONDS * 1000);

  const workers = Array.from({ length: CONCURRENCY }, (_, idx) =>
    runWorker(deadlineMs, latencies, counters, idx));
  await Promise.all(workers);

  const p50 = percentile(latencies, 50);
  const p95 = percentile(latencies, 95);
  const p99 = percentile(latencies, 99);
  const errorPct = counters.total ? (counters.errors / counters.total) * 100 : 0;

  console.log('API Load Test Report');
  console.log('====================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Duration: ${DURATION_SECONDS}s`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Total requests: ${counters.total}`);
  console.log(`Errors: ${counters.errors} (${errorPct.toFixed(2)}%)`);
  console.log(`Latency p50: ${Math.round(p50)} ms`);
  console.log(`Latency p95: ${Math.round(p95)} ms`);
  console.log(`Latency p99: ${Math.round(p99)} ms`);

  const pass = p95 <= P95_TARGET_MS && errorPct <= ERROR_TARGET_PERCENT;
  console.log('--------------------');
  console.log(`Thresholds: p95<=${P95_TARGET_MS}ms, errors<=${ERROR_TARGET_PERCENT}%`);
  console.log(`Result: ${pass ? 'PASS' : 'FAIL'}`);

  if (!pass) process.exit(2);
}

main();

