import React, { useEffect, useMemo, useState } from 'react';
import SkeletonLoader from './SkeletonLoader';

function statusColor(state) {
  if (state === 'good') return { bg: '#dcfce7', fg: '#166534', border: '#86efac' };
  if (state === 'warn') return { bg: '#fef3c7', fg: '#92400e', border: '#fcd34d' };
  return { bg: '#fee2e2', fg: '#991b1b', border: '#fca5a5' };
}

function evaluateRatio(value, target, lowerIsBetter = true) {
  if (value == null || target == null) return { state: 'warn', label: 'No data' };
  const ratio = lowerIsBetter ? value / target : target / value;
  if (ratio <= 1) return { state: 'good', label: 'On target' };
  if (ratio <= 1.1) return { state: 'warn', label: 'Near breach' };
  return { state: 'bad', label: 'Breached' };
}

export default function SLODashboard() {
  const [loading, setLoading] = useState(true);
  const [windowHours, setWindowHours] = useState(24);
  const [slos, setSlos] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);
  const [incidentTargets, setIncidentTargets] = useState(null);
  const [burnRate, setBurnRate] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [sloRes, metricRes, healthRes, incidentRes] = await Promise.all([
        fetch('/api/sre/slos'),
        fetch(`/api/sre/metrics?windowHours=${windowHours}`),
        fetch('/api/health'),
        fetch('/api/sre/incident-targets'),
      ]);
      const [sloJson, metricJson, healthJson, incidentJson] = await Promise.all([
        sloRes.json(),
        metricRes.json(),
        healthRes.json(),
        incidentRes.json(),
      ]);
      setSlos(sloJson?.targets || null);
      setMetrics(metricJson || null);
      setHealth(healthJson || null);
      setIncidentTargets(incidentJson?.incidentResponseTargets || null);
      try {
        const burnRes = await fetch('/api/sre/burn-rate');
        const burnJson = await burnRes.json();
        setBurnRate(burnJson || null);
      } catch (err) {
        console.warn('Burn rate fetch failed:', err);
        setBurnRate(null);
      }
    } catch (e) {
      setError('Could not load SLO telemetry endpoints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [windowHours]);

  const checks = useMemo(() => {
    const p95 = metrics?.requestSummary?.latencyMs?.p95 ?? null;
    const p99 = metrics?.requestSummary?.latencyMs?.p99 ?? null;
    const err5xx = metrics?.requestSummary?.error5xxRatePercent ?? null;
    const targets = slos || {};
    return [
      {
        id: 'availability',
        title: 'Availability',
        value: `${targets?.availability?.targetPercent ?? '99.9'}% target`,
        sub: `${targets?.availability?.maxDowntimeMinutesPerWindow ?? 43.2} min/mo budget`,
        verdict: { state: 'good', label: 'Policy set' },
      },
      {
        id: 'p95',
        title: 'API p95 Latency',
        value: p95 == null ? '--' : `${Math.round(p95)} ms`,
        sub: `Target <= ${targets?.latency?.api?.p95Ms ?? 400} ms`,
        verdict: evaluateRatio(p95, targets?.latency?.api?.p95Ms ?? 400, true),
      },
      {
        id: 'p99',
        title: 'API p99 Latency',
        value: p99 == null ? '--' : `${Math.round(p99)} ms`,
        sub: `Target <= ${targets?.latency?.api?.p99Ms ?? 1000} ms`,
        verdict: evaluateRatio(p99, targets?.latency?.api?.p99Ms ?? 1000, true),
      },
      {
        id: '5xx',
        title: '5xx Error Rate',
        value: err5xx == null ? '--' : `${err5xx.toFixed(3)}%`,
        sub: `Target <= ${targets?.reliability?.max5xxPercent ?? 0.5}%`,
        verdict: evaluateRatio(err5xx, targets?.reliability?.max5xxPercent ?? 0.5, true),
      },
    ];
  }, [metrics, slos]);

  const requestSummary = metrics?.requestSummary;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>SLO Dashboard</h3>
            <div style={{ marginTop: 4, fontSize: 12, color: '#64748b' }}>
              Tracks uptime, API latency, and error budget against defined targets.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={windowHours}
              onChange={(e) => setWindowHours(Number(e.target.value))}
              style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, fontWeight: 600 }}
            >
              <option value={1}>Last 1 hour</option>
              <option value={6}>Last 6 hours</option>
              <option value={24}>Last 24 hours</option>
              <option value={72}>Last 72 hours</option>
            </select>
            <button
              type="button"
              onClick={load}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}
            >
              Refresh
            </button>
          </div>
        </div>
        {error && (
          <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', fontSize: 12 }}>
            {error}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {checks.map((c) => {
          const palette = statusColor(c.verdict.state);
          return (
            <div key={c.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 14 }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 }}>{c.title}</div>
              <div style={{ marginTop: 8, fontSize: 26, fontWeight: 800, color: '#0f172a' }}>{c.value}</div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#64748b' }}>{c.sub}</div>
              <div style={{ marginTop: 10, display: 'inline-block', padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: palette.bg, color: palette.fg, border: `1px solid ${palette.border}` }}>
                {c.verdict.label}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16 }}>
        <h4 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Live Request Telemetry</h4>
        {loading ? (
          <div style={{ padding: 16 }}>
            <SkeletonLoader variant="card" height={80} />
            <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonLoader key={i} variant="text" width={80} height={40} />
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
            {[
              { k: 'Requests', v: requestSummary?.totalRequests ?? '--' },
              { k: 'Success Rate', v: requestSummary?.successRatePercent == null ? '--' : `${requestSummary.successRatePercent}%` },
              { k: 'p50', v: requestSummary?.latencyMs?.p50 == null ? '--' : `${Math.round(requestSummary.latencyMs.p50)} ms` },
              { k: 'p95', v: requestSummary?.latencyMs?.p95 == null ? '--' : `${Math.round(requestSummary.latencyMs.p95)} ms` },
              { k: 'p99', v: requestSummary?.latencyMs?.p99 == null ? '--' : `${Math.round(requestSummary.latencyMs.p99)} ms` },
              { k: '5xx Rate', v: requestSummary?.error5xxRatePercent == null ? '--' : `${requestSummary.error5xxRatePercent}%` },
              { k: 'Uptime', v: health?.uptimeSeconds == null ? '--' : `${Math.floor(health.uptimeSeconds / 60)} min` },
            ].map((item) => (
              <div key={item.k} style={{ padding: 10, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{item.k}</div>
                <div style={{ marginTop: 4, fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{item.v}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16 }}>
        <h4 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Burn Rate Signals</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {[
            { k: '1h Burn Rate', v: burnRate?.windows?.oneHour?.burnRate == null ? '--' : `${burnRate.windows.oneHour.burnRate}x`, bad: burnRate?.signals?.fastBurn },
            { k: '6h Burn Rate', v: burnRate?.windows?.sixHours?.burnRate == null ? '--' : `${burnRate.windows.sixHours.burnRate}x`, bad: burnRate?.signals?.slowBurn },
            { k: 'Error Budget', v: burnRate?.errorBudgetPercent == null ? '--' : `${burnRate.errorBudgetPercent}%`, bad: false },
          ].map((item) => (
            <div key={item.k} style={{ padding: 10, borderRadius: 8, border: `1px solid ${item.bad ? '#fca5a5' : '#e2e8f0'}`, background: item.bad ? '#fef2f2' : '#f8fafc' }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{item.k}</div>
              <div style={{ marginTop: 4, fontSize: 20, fontWeight: 800, color: item.bad ? '#b91c1c' : '#0f172a' }}>{item.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16 }}>
        <h4 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Incident Response Targets</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                {['Severity', 'Ack', 'Mitigation Start', 'Comms Update Cadence'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', color: '#64748b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(incidentTargets || {}).map(([sev, cfg]) => (
                <tr key={sev} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '9px 10px', fontWeight: 800, color: sev === 'sev1' ? '#dc2626' : sev === 'sev2' ? '#d97706' : '#2563eb' }}>{sev.toUpperCase()}</td>
                  <td style={{ padding: '9px 10px' }}>{cfg.ackMinutes} min</td>
                  <td style={{ padding: '9px 10px' }}>{cfg.mitigateMinutes} min</td>
                  <td style={{ padding: '9px 10px' }}>{cfg.commsUpdateMinutes} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

