import React, { useEffect, useState } from 'react';
import SkeletonLoader from '../components/SkeletonLoader';

function badge(status) {
  if (status === 'operational') return { bg: '#dcfce7', fg: '#166534', border: '#86efac', label: 'Operational' };
  if (status === 'degraded') return { bg: '#fef3c7', fg: '#92400e', border: '#fcd34d', label: 'Degraded' };
  return { bg: '#fee2e2', fg: '#991b1b', border: '#fca5a5', label: 'Incident' };
}

export default function StatusPage() {
  const [data, setData] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const [statusRes, snapshotRes] = await Promise.all([
        fetch('/api/status'),
        fetch('/api/sre/snapshots?limit=120'),
      ]);
      const [json, snapshotJson] = await Promise.all([
        statusRes.json(),
        snapshotRes.json(),
      ]);
      if (!json?.success) throw new Error(json?.error || 'Failed to load status');
      setData(json);
      setSnapshots(Array.isArray(snapshotJson?.snapshots) ? snapshotJson.snapshots : []);
    } catch (e) {
      setError(e.message || 'Failed to load status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  const overall = badge(data?.status);
  const recent = snapshots.slice(-40);
  const maxP95 = Math.max(1, ...recent.map((s) => s?.requestSummary?.latencyMs?.p95 || 0));
  const maxErr = Math.max(0.1, ...recent.map((s) => s?.requestSummary?.error5xxRatePercent || 0));

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '28px 20px' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#0f172a' }}>QuantegyAI Status</h1>
              <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>Auto-refreshes every 30 seconds</div>
            </div>
            <div style={{ padding: '6px 12px', borderRadius: 999, background: overall.bg, color: overall.fg, border: `1px solid ${overall.border}`, fontSize: 12, fontWeight: 800 }}>
              {overall.label}
            </div>
          </div>
          {data?.generatedAt && <div style={{ marginTop: 8, fontSize: 11, color: '#94a3b8' }}>Last updated: {new Date(data.generatedAt).toLocaleString()}</div>}
          {error && <div style={{ marginTop: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 8, padding: 10, fontSize: 12 }}>{error}</div>}
        </div>

        {loading ? (
          <div style={{ padding: 24 }}>
            <SkeletonLoader variant="card" />
            <div style={{ marginTop: 16 }}>
              <SkeletonLoader variant="text" count={3} />
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 14 }}>
              {[
                { k: 'Uptime', v: data?.uptimeSeconds == null ? '--' : `${Math.floor(data.uptimeSeconds / 60)} min` },
                { k: 'API p95', v: data?.slo?.apiLatency?.p95?.valueMs == null ? '--' : `${Math.round(data.slo.apiLatency.p95.valueMs)} ms` },
                { k: 'API p99', v: data?.slo?.apiLatency?.p99?.valueMs == null ? '--' : `${Math.round(data.slo.apiLatency.p99.valueMs)} ms` },
                { k: '5xx Rate', v: data?.slo?.reliability?.error5xxPercent?.valuePercent == null ? '--' : `${data.slo.reliability.error5xxPercent.valuePercent}%` },
              ].map((x) => (
                <div key={x.k} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{x.k}</div>
                  <div style={{ marginTop: 6, fontSize: 24, color: '#0f172a', fontWeight: 900 }}>{x.v}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, marginBottom: 14 }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 16, color: '#0f172a' }}>Burn Rate Signals</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { label: '1h Burn', value: data?.burnRate?.windows?.oneHour?.burnRate, alarm: data?.burnRate?.signals?.fastBurn },
                  { label: '6h Burn', value: data?.burnRate?.windows?.sixHours?.burnRate, alarm: data?.burnRate?.signals?.slowBurn },
                ].map((b) => (
                  <div key={b.label} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${b.alarm ? '#fca5a5' : '#cbd5e1'}`, background: b.alarm ? '#fef2f2' : '#f8fafc' }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>{b.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: b.alarm ? '#b91c1c' : '#0f172a' }}>{b.value == null ? '--' : `${b.value}x`}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, marginBottom: 14 }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 16, color: '#0f172a' }}>Service History (Recent)</h3>
              {recent.length === 0 ? (
                <div style={{ fontSize: 12, color: '#94a3b8' }}>No snapshots yet. This fills as traffic is recorded.</div>
              ) : (
                <>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                    p95 latency trend (blue bars) and 5xx rate trend (red line dots)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 120, marginBottom: 8 }}>
                    {recent.map((s, i) => {
                      const p95 = s?.requestSummary?.latencyMs?.p95 || 0;
                      const h = Math.max(2, (p95 / maxP95) * 100);
                      return (
                        <div key={`${s.ts || i}-p95`} title={`${new Date(s.ts).toLocaleString()} p95=${Math.round(p95)}ms`} style={{ flex: 1, minWidth: 4 }}>
                          <div style={{ height: `${h}px`, borderRadius: '3px 3px 0 0', background: '#60a5fa' }} />
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 8 }}>
                    {recent.map((s, i) => {
                      const e = s?.requestSummary?.error5xxRatePercent || 0;
                      const size = Math.max(3, (e / maxErr) * 10);
                      const alarm = e > 0.5;
                      return (
                        <div key={`${s.ts || i}-err`} title={`${new Date(s.ts).toLocaleString()} 5xx=${e}%`} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                          <span style={{ width: size, height: size, borderRadius: 999, background: alarm ? '#dc2626' : '#fca5a5', display: 'inline-block' }} />
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    Latest snapshot: {new Date(recent[recent.length - 1]?.ts).toLocaleString()}
                  </div>
                </>
              )}
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 16, color: '#0f172a' }}>Components</h3>
              <div style={{ display: 'grid', gap: 8 }}>
                {(data?.components || []).map((c) => {
                  const cBadge = badge(c.status);
                  return (
                    <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.name}</div>
                      <div style={{ padding: '3px 8px', borderRadius: 999, background: cBadge.bg, color: cBadge.fg, border: `1px solid ${cBadge.border}`, fontSize: 11, fontWeight: 700 }}>
                        {cBadge.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

