import React, { useState, useEffect } from 'react';

const PRESETS = {
  canvas: { name: 'Canvas LMS', authSuffix: '/api/lti/authorize_redirect', tokenSuffix: '/login/oauth2/token', jwksSuffix: '/api/lti/security/jwks' },
  moodle: { name: 'Moodle', authSuffix: '/mod/lti/auth.php', tokenSuffix: '/mod/lti/token.php', jwksSuffix: '/mod/lti/certs.php' },
  blackboard: { name: 'Blackboard Learn', authSuffix: '/api/v1/gateway/oidcauth', tokenSuffix: '/api/v1/gateway/oauth2/jwttoken', jwksSuffix: '/api/v1/management/applications/jwks' },
  d2l: { name: 'D2L Brightspace', authSuffix: '/d2l/lti/authenticate', tokenSuffix: '/core/connect/token', jwksSuffix: '/d2l/.well-known/jwks' },
  schoology: { name: 'Schoology', authSuffix: '/lti/authorize_redirect', tokenSuffix: '/oauth2/token', jwksSuffix: '/.well-known/jwks' },
  custom: { name: 'Custom LMS', authSuffix: '', tokenSuffix: '', jwksSuffix: '' },
};

function authHeaders() {
  const token = localStorage.getItem('quantegy-auth-token');
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

export default function LTIAdmin() {
  const [platforms, setPlatforms] = useState([]);
  const [config, setConfig] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ preset: 'canvas', name: '', issuer: '', clientId: '', deploymentId: '1', authorizationEndpoint: '', tokenEndpoint: '', jwksEndpoint: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [advanced, setAdvanced] = useState(false);

  useEffect(() => {
    fetch('/api/lti/platforms', { headers: authHeaders() }).then(r => r.json()).then(d => d.success && setPlatforms(d.platforms));
    fetch('/api/lti/config').then(r => r.json()).then(d => d.success && setConfig(d.config));
  }, []);

  const handleAdd = async () => {
    setError('');
    if (!form.name || !form.issuer || !form.clientId) { setError('All fields are required.'); return; }
    if (!/^https?:\/\//i.test(form.issuer.trim())) { setError('Issuer URL must start with http:// or https://'); return; }
    setSaving(true);
    const preset = PRESETS[form.preset] || PRESETS.custom;
    const issuer = form.issuer.trim().replace(/\/$/, '');
    const customAuth = form.authorizationEndpoint?.trim();
    const customToken = form.tokenEndpoint?.trim();
    const customJwks = form.jwksEndpoint?.trim();
    const body = {
      name: form.name,
      issuer,
      clientId: form.clientId,
      deploymentId: form.deploymentId || '1',
      authorizationEndpoint: customAuth || (issuer + preset.authSuffix),
      tokenEndpoint: customToken || (issuer + preset.tokenSuffix),
      jwksEndpoint: customJwks || (issuer + preset.jwksSuffix),
    };
    try {
      const res = await fetch('/api/lti/platforms', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        setPlatforms(prev => [...prev, data.platform]);
        setShowAdd(false);
        setForm({ preset: 'canvas', name: '', issuer: '', clientId: '', deploymentId: '1', authorizationEndpoint: '', tokenEndpoint: '', jwksEndpoint: '' });
      } else setError(data.error);
    } catch (e) { setError(e.message); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this platform registration?')) return;
    await fetch(`/api/lti/platforms/${id}`, { method: 'DELETE', headers: authHeaders() });
    setPlatforms(prev => prev.filter(p => p.id !== id));
  };

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const S = {
    page: { maxWidth: 960, margin: '0 auto', padding: 32, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', color: '#1e293b' },
    h1: { fontSize: 28, fontWeight: 800, marginBottom: 4 },
    sub: { color: '#64748b', marginBottom: 32, fontSize: 14 },
    card: { background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0', marginBottom: 16 },
    badge: (c) => ({ display: 'inline-block', padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: c === 'green' ? '#dcfce7' : '#fef3c7', color: c === 'green' ? '#166534' : '#92400e' }),
    btn: (bg) => ({ padding: '10px 20px', borderRadius: 8, border: 'none', background: bg || '#2563eb', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }),
    btnSm: { padding: '6px 14px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
    input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, marginBottom: 12 },
    label: { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#374151' },
    code: { background: '#f1f5f9', padding: '8px 14px', borderRadius: 8, fontSize: 13, fontFamily: 'monospace', wordBreak: 'break-all', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 },
  };

  return (
    <div style={S.page}>
      <h1 style={S.h1}>LTI 1.3 Integration</h1>
      <p style={S.sub}>Connect Quantegy AI to Canvas, Moodle, Blackboard, or any LTI 1.3 compatible LMS.</p>

      {/* Tool Configuration */}
      {config && (
        <div style={S.card}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Your Tool Configuration</h2>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>Enter these values in your LMS when registering Quantegy AI as an external tool.</p>
          {[
            ['Tool Name', config.toolName],
            ['OIDC Login URL', config.oidcInitiationUrl],
            ['Launch / Redirect URL', config.targetLinkUri],
            ['JWKS URL', config.jwksUrl],
            ['Domain', config.domain],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 2 }}>{label}</div>
              <div style={S.code}>
                <span>{value}</span>
                <button style={S.btnSm} onClick={() => copy(value, label)}>{copied === label ? 'Copied!' : 'Copy'}</button>
              </div>
            </div>
          ))}
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginTop: 8, marginBottom: 4 }}>Supported Placements</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {config.placements.map(p => <span key={p.type} style={S.badge('green')}>{p.label}</span>)}
          </div>
        </div>
      )}

      {/* Registered Platforms */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Registered Platforms ({platforms.length})</h2>
        <button style={S.btn()} onClick={() => setShowAdd(!showAdd)}>{showAdd ? 'Cancel' : '+ Add Platform'}</button>
      </div>

      {showAdd && (
        <div style={{ ...S.card, borderColor: '#3b82f6' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Register New Platform</h3>
          {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: '#fef2f2', borderRadius: 8 }}>{error}</div>}

          <label style={S.label}>LMS Type</label>
          <select aria-label="LMS Type" style={S.input} value={form.preset} onChange={e => setForm(f => ({ ...f, preset: e.target.value, name: PRESETS[e.target.value]?.name || f.name }))}>
            {Object.entries(PRESETS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
          </select>

          <label style={S.label}>Display Name</label>
          <input aria-label="Display Name" style={S.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Allen ISD Canvas" />

          <label style={S.label}>Issuer URL (Platform Base URL)</label>
          <input aria-label="Issuer URL (Platform Base URL)" style={S.input} value={form.issuer} onChange={e => setForm(f => ({ ...f, issuer: e.target.value }))} placeholder="e.g. https://canvas.allenisd.org" />

          <label style={S.label}>Client ID (from LMS Developer Key)</label>
          <input aria-label="Client ID (from LMS Developer Key)" style={S.input} value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))} placeholder="e.g. 10000000000001" />

          <label style={S.label}>Deployment ID (usually "1")</label>
          <input aria-label={'Deployment ID (usually "1")'} style={S.input} value={form.deploymentId} onChange={e => setForm(f => ({ ...f, deploymentId: e.target.value }))} placeholder="1" />

          <div style={{ marginBottom: 10 }}>
            <button type="button" style={S.btnSm} onClick={() => setAdvanced(v => !v)}>
              {advanced ? 'Hide Advanced Endpoint Overrides' : 'Show Advanced Endpoint Overrides'}
            </button>
          </div>

          {advanced && (
            <>
              <label style={S.label}>Authorization Endpoint Override (optional)</label>
              <input aria-label="Authorization Endpoint Override (optional)" style={S.input} value={form.authorizationEndpoint || ''} onChange={e => setForm(f => ({ ...f, authorizationEndpoint: e.target.value }))} placeholder="https://.../authorize" />

              <label style={S.label}>Token Endpoint Override (optional)</label>
              <input aria-label="Token Endpoint Override (optional)" style={S.input} value={form.tokenEndpoint || ''} onChange={e => setForm(f => ({ ...f, tokenEndpoint: e.target.value }))} placeholder="https://.../token" />

              <label style={S.label}>JWKS Endpoint Override (optional)</label>
              <input aria-label="JWKS Endpoint Override (optional)" style={S.input} value={form.jwksEndpoint || ''} onChange={e => setForm(f => ({ ...f, jwksEndpoint: e.target.value }))} placeholder="https://.../jwks" />
            </>
          )}

          <button style={S.btn()} onClick={handleAdd} disabled={saving}>{saving ? 'Saving...' : 'Register Platform'}</button>
        </div>
      )}

      {platforms.length === 0 && !showAdd && (
        <div style={{ ...S.card, textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔗</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No Platforms Connected</h3>
          <p style={{ color: '#64748b', fontSize: 13 }}>Click "Add Platform" to connect your first LMS.</p>
        </div>
      )}

      {platforms.map(p => (
        <div key={p.id} style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{p.name}</h3>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{p.issuer}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Client ID: {p.clientId} &middot; Deployment: {p.deploymentId}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={S.badge(p.active ? 'green' : 'yellow')}>{p.active ? 'Active' : 'Inactive'}</span>
              <button style={{ ...S.btnSm, color: '#dc2626', borderColor: '#fecaca' }} onClick={() => handleDelete(p.id)}>Remove</button>
            </div>
          </div>
        </div>
      ))}

      {/* Setup Guide */}
      <div style={{ ...S.card, marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Setup Guide</h2>
        <div style={{ fontSize: 14, lineHeight: 1.8, color: '#374151' }}>
          <p><strong>Canvas LMS:</strong></p>
          <ol style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li>Go to Admin &gt; Developer Keys &gt; + Developer Key &gt; LTI Key</li>
            <li>Enter the OIDC Login URL, Launch URL, and JWKS URL from above</li>
            <li>Enable the key, copy the Client ID</li>
            <li>Go to your course &gt; Settings &gt; Apps &gt; + App &gt; By Client ID</li>
            <li>Register the platform here with the Client ID and your Canvas URL</li>
          </ol>
          <p><strong>Moodle:</strong></p>
          <ol style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li>Go to Site Administration &gt; Plugins &gt; External Tool &gt; Manage Tools</li>
            <li>Click "Configure a tool manually" and enter the Launch URL, Login URL, and JWKS URL</li>
            <li>Set LTI version to 1.3, save, and copy the generated Client ID</li>
            <li>Register the platform here with that Client ID and your Moodle URL</li>
          </ol>
          <p><strong>Blackboard Learn:</strong></p>
          <ol style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li>Go to Admin Panel &gt; LTI Tool Providers &gt; Register LTI 1.3 Tool</li>
            <li>Enter the Client ID after registration, configure placements</li>
            <li>Register the platform here with Blackboard's Application ID and institution URL</li>
          </ol>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>
            Need help? Quantegy AI supports LTI 1.3 Advantage with Assignment & Grade Services (AGS) for automatic grade passback
            and Names & Role Provisioning Services (NRPS) for roster sync.
          </p>
        </div>
      </div>
    </div>
  );
}
