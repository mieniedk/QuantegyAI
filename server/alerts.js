import nodemailer from 'nodemailer';
import { getBurnRateReport } from './sre.js';

const lastSentByKey = new Map();

function shouldSend(key, cooldownMs) {
  const now = Date.now();
  const last = lastSentByKey.get(key) || 0;
  if ((now - last) < cooldownMs) return false;
  lastSentByKey.set(key, now);
  return true;
}

function getStatus(value, target) {
  if (value == null || target == null) return 'unknown';
  if (value <= target) return 'ok';
  if (value <= target * 1.1) return 'warn';
  return 'breach';
}

export function evaluateSLOBreaches(metricsPayload, sloTargets) {
  const p95 = metricsPayload?.requestSummary?.latencyMs?.p95 ?? null;
  const p99 = metricsPayload?.requestSummary?.latencyMs?.p99 ?? null;
  const err5xx = metricsPayload?.requestSummary?.error5xxRatePercent ?? null;

  const p95Target = sloTargets?.latency?.api?.p95Ms;
  const p99Target = sloTargets?.latency?.api?.p99Ms;
  const errTarget = sloTargets?.reliability?.max5xxPercent;

  const checks = [
    { id: 'api-p95', label: 'API p95 latency', value: p95, target: p95Target, unit: 'ms' },
    { id: 'api-p99', label: 'API p99 latency', value: p99, target: p99Target, unit: 'ms' },
    { id: 'api-5xx', label: 'API 5xx error rate', value: err5xx, target: errTarget, unit: '%' },
  ].map((c) => ({ ...c, status: getStatus(c.value, c.target) }));

  const breaches = checks.filter((c) => c.status === 'breach');
  const warnings = checks.filter((c) => c.status === 'warn');
  return { checks, breaches, warnings };
}

async function sendWebhookAlert(payload) {
  const url = process.env.ALERT_WEBHOOK_URL;
  if (!url) return { sent: false, reason: 'No ALERT_WEBHOOK_URL configured' };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { sent: res.ok, status: res.status };
  } catch (err) {
    return { sent: false, reason: err.message };
  }
}

async function sendEmailAlert(subject, text) {
  const to = process.env.ALERT_EMAIL_TO;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || 'Quantegy AI <noreply@quantegyai.com>';
  const port = Number(process.env.SMTP_PORT || 587);

  if (!to || !host || !user || !pass) {
    return { sent: false, reason: 'SMTP or ALERT_EMAIL_TO not configured' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    await transporter.sendMail({ from, to, subject, text });
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: err.message };
  }
}

export async function maybeSendSLOAlerts({ metricsPayload, sloTargets, cooldownMinutes = 15 }) {
  const evaluation = evaluateSLOBreaches(metricsPayload, sloTargets);
  const burn = getBurnRateReport();
  const cooldownMs = Math.max(1, cooldownMinutes) * 60 * 1000;
  const shouldAlert = evaluation.breaches.length > 0 || burn.signals.fastBurn || burn.signals.slowBurn;
  if (!shouldAlert) {
    return { success: true, alerted: false, reason: 'No active SLO breaches', evaluation, burnRate: burn };
  }

  const burnKeys = [
    burn.signals.fastBurn ? 'fast-burn' : null,
    burn.signals.slowBurn ? 'slow-burn' : null,
  ].filter(Boolean);
  const key = [...evaluation.breaches.map((b) => b.id), ...burnKeys].sort().join('|');
  if (!shouldSend(key, cooldownMs)) {
    return { success: true, alerted: false, reason: 'Within alert cooldown window', evaluation, burnRate: burn };
  }

  const lines = [
    ...evaluation.breaches.map((b) => `${b.label}: ${b.value}${b.unit} (target <= ${b.target}${b.unit})`),
    ...(burn.signals.fastBurn ? [`Fast burn: 1h burn rate ${burn.windows.oneHour.burnRate}x (threshold 10x)`] : []),
    ...(burn.signals.slowBurn ? [`Slow burn: 6h burn rate ${burn.windows.sixHours.burnRate}x (threshold 4x)`] : []),
  ];
  const text = [
    'Allen Ace LMS SLO breach detected.',
    '',
    ...lines,
    '',
    `Window: ${metricsPayload?.windowHours || 24}h`,
    `Timestamp: ${new Date().toISOString()}`,
  ].join('\n');

  const webhook = await sendWebhookAlert({
    severity: 'high',
    title: 'SLO breach detected',
    breaches: evaluation.breaches,
    burnRate: burn,
    windowHours: metricsPayload?.windowHours || 24,
    ts: new Date().toISOString(),
  });
  const email = await sendEmailAlert('Allen Ace SLO breach detected', text);

  return {
    success: true,
    alerted: webhook.sent || email.sent,
    channels: { webhook, email },
    evaluation,
    burnRate: burn,
  };
}

