import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const SRE_SNAPSHOTS_PATH = path.join(DATA_DIR, 'sre-metrics.jsonl');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const SLO_TARGETS = {
  availability: {
    objective: 'Monthly availability',
    targetPercent: 99.9,
    windowDays: 30,
    errorBudgetPercent: 0.1,
    maxDowntimeMinutesPerWindow: 43.2,
  },
  latency: {
    objective: 'API response latency',
    windowHours: 24,
    api: {
      p50Ms: 150,
      p95Ms: 400,
      p99Ms: 1000,
    },
    pageLoad: {
      p75Ms: 2500,
      p95Ms: 4000,
    },
  },
  reliability: {
    objective: 'Server error rate',
    windowHours: 24,
    max5xxPercent: 0.5,
  },
  incidentResponse: {
    sev1: { ackMinutes: 5, mitigateMinutes: 30, commsUpdateMinutes: 15 },
    sev2: { ackMinutes: 15, mitigateMinutes: 120, commsUpdateMinutes: 30 },
    sev3: { ackMinutes: 60, mitigateMinutes: 480, commsUpdateMinutes: 120 },
  },
};

const metricsStore = {
  requests: [],
};

const MAX_REQUEST_SAMPLES = 50000;
const EXCLUDED_PREFIXES = ['/api/health', '/api/sre'];
const SNAPSHOT_INTERVAL_MS = 60 * 1000;
let lastSnapshotAt = 0;

function shouldTrack(pathname) {
  return !EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p));
}

function percentile(values, pct) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((pct / 100) * sorted.length) - 1),
  );
  return sorted[idx];
}

function getWindowedRequests(hours = 24) {
  const cutoff = Date.now() - (hours * 60 * 60 * 1000);
  return metricsStore.requests.filter((r) => r.ts >= cutoff);
}

function summarizeRequests(samples) {
  const durations = samples.map((s) => s.durationMs);
  const total = samples.length;
  const fiveXX = samples.filter((s) => s.statusCode >= 500).length;
  const twoXX = samples.filter((s) => s.statusCode >= 200 && s.statusCode < 300).length;
  const slowOver1s = samples.filter((s) => s.durationMs > 1000).length;

  return {
    totalRequests: total,
    successRatePercent: total ? Number(((twoXX / total) * 100).toFixed(2)) : null,
    error5xxRatePercent: total ? Number(((fiveXX / total) * 100).toFixed(3)) : null,
    slowOver1sPercent: total ? Number(((slowOver1s / total) * 100).toFixed(2)) : null,
    latencyMs: {
      p50: percentile(durations, 50),
      p95: percentile(durations, 95),
      p99: percentile(durations, 99),
      max: durations.length ? Math.max(...durations) : null,
    },
  };
}

function appendSnapshot(snapshot) {
  try {
    fs.appendFileSync(SRE_SNAPSHOTS_PATH, `${JSON.stringify(snapshot)}\n`, 'utf8');
  } catch (err) {
    console.error('[sre] Failed to persist snapshot:', err.message);
  }
}

function maybePersistSnapshot(windowHours = 24) {
  const now = Date.now();
  if ((now - lastSnapshotAt) < SNAPSHOT_INTERVAL_MS) return;
  const summary = buildMetricsPayload(windowHours);
  appendSnapshot({ ts: new Date(now).toISOString(), ...summary });
  lastSnapshotAt = now;
}

function readSnapshots(limit = 200) {
  try {
    if (!fs.existsSync(SRE_SNAPSHOTS_PATH)) return [];
    const lines = fs.readFileSync(SRE_SNAPSHOTS_PATH, 'utf8').split('\n').filter(Boolean);
    return lines.slice(-Math.max(1, Math.min(2000, Number(limit) || 200))).map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);
  } catch (err) {
    console.error('[sre] Failed to read snapshots:', err.message);
    return [];
  }
}

function compareToTargets(summary) {
  const p95 = summary.latencyMs.p95;
  const p99 = summary.latencyMs.p99;
  const err = summary.error5xxRatePercent;
  return {
    apiLatency: {
      p95: { targetMs: SLO_TARGETS.latency.api.p95Ms, valueMs: p95, meets: p95 == null ? null : p95 <= SLO_TARGETS.latency.api.p95Ms },
      p99: { targetMs: SLO_TARGETS.latency.api.p99Ms, valueMs: p99, meets: p99 == null ? null : p99 <= SLO_TARGETS.latency.api.p99Ms },
    },
    reliability: {
      error5xxPercent: {
        targetPercent: SLO_TARGETS.reliability.max5xxPercent,
        valuePercent: err,
        meets: err == null ? null : err <= SLO_TARGETS.reliability.max5xxPercent,
      },
    },
  };
}

function summarizeErrorRate(hours = 1) {
  const samples = getWindowedRequests(hours);
  const total = samples.length;
  const fiveXX = samples.filter((s) => s.statusCode >= 500).length;
  const errorRatePercent = total ? Number(((fiveXX / total) * 100).toFixed(3)) : null;
  return { windowHours: hours, totalRequests: total, errorRatePercent };
}

export function getBurnRateReport() {
  const budgetPercent = SLO_TARGETS.availability.errorBudgetPercent;
  const oneHour = summarizeErrorRate(1);
  const sixHours = summarizeErrorRate(6);
  const oneHourBurn = oneHour.errorRatePercent == null ? null : Number((oneHour.errorRatePercent / budgetPercent).toFixed(2));
  const sixHourBurn = sixHours.errorRatePercent == null ? null : Number((sixHours.errorRatePercent / budgetPercent).toFixed(2));

  // Multi-window burn-rate style signals.
  const fastBurn = oneHourBurn != null && oneHourBurn >= 10;
  const slowBurn = sixHourBurn != null && sixHourBurn >= 4;

  return {
    success: true,
    errorBudgetPercent: budgetPercent,
    windows: {
      oneHour: { ...oneHour, burnRate: oneHourBurn },
      sixHours: { ...sixHours, burnRate: sixHourBurn },
    },
    signals: {
      fastBurn,
      slowBurn,
      healthy: !fastBurn && !slowBurn,
    },
  };
}

export function createSREMetricsMiddleware() {
  return (req, res, next) => {
    if (!shouldTrack(req.path)) return next();
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1_000_000;
      metricsStore.requests.push({
        ts: Date.now(),
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Number(durationMs.toFixed(2)),
      });
      if (metricsStore.requests.length > MAX_REQUEST_SAMPLES) {
        metricsStore.requests.splice(0, metricsStore.requests.length - MAX_REQUEST_SAMPLES);
      }
      maybePersistSnapshot(24);
    });
    next();
  };
}

function buildMetricsPayload(windowHours = 24) {
  const samples = getWindowedRequests(windowHours);
  const summary = summarizeRequests(samples);
  return {
    success: true,
    windowHours,
    processUptimeSeconds: Math.floor(process.uptime()),
    requestSummary: summary,
    targetEvaluation: compareToTargets(summary),
  };
}

export function getSREMetrics(windowHours = 24) {
  const bounded = Math.max(1, Math.min(24 * 30, Number(windowHours) || 24));
  return buildMetricsPayload(bounded);
}

export function createSRERouter(express) {
  const router = express.Router();

  router.get('/slos', (req, res) => {
    res.json({ success: true, targets: SLO_TARGETS });
  });

  router.get('/metrics', (req, res) => {
    const windowHours = Math.max(1, Math.min(24 * 30, Number(req.query.windowHours) || 24));
    const payload = buildMetricsPayload(windowHours);
    appendSnapshot({ ts: new Date().toISOString(), ...payload });
    res.json(payload);
  });

  router.get('/incident-targets', (req, res) => {
    res.json({
      success: true,
      incidentResponseTargets: SLO_TARGETS.incidentResponse,
    });
  });

  router.get('/snapshots', (req, res) => {
    const limit = Math.max(10, Math.min(2000, Number(req.query.limit) || 200));
    res.json({
      success: true,
      snapshots: readSnapshots(limit),
    });
  });

  router.get('/burn-rate', (req, res) => {
    res.json(getBurnRateReport());
  });

  return router;
}

