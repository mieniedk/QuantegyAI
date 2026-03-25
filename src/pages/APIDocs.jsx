import React, { useEffect, useRef, useState } from 'react';

function extractTokenFromUrl() {
  const url = new URL(window.location.href);
  const queryCandidates = ['token', 'jwt', 'access_token', 'bearer'];
  for (const key of queryCandidates) {
    const value = url.searchParams.get(key);
    if (value && value.trim()) return value.trim();
  }

  const hash = (window.location.hash || '').replace(/^#/, '');
  if (!hash) return '';
  const hashParams = new URLSearchParams(hash);
  for (const key of queryCandidates) {
    const value = hashParams.get(key);
    if (value && value.trim()) return value.trim();
  }
  return '';
}

export default function APIDocs() {
  const [scriptReady, setScriptReady] = useState(false);
  const [tokenInput, setTokenInput] = useState(() => localStorage.getItem('apiDocs.jwt') || '');
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('apiDocs.jwt') || '');
  const [notice, setNotice] = useState('');
  const uiRef = useRef(null);

  useEffect(() => {
    const cssId = 'swagger-ui-css';
    const scriptId = 'swagger-ui-js';
    const presetId = 'swagger-ui-standalone-preset-js';

    if (!document.getElementById(cssId)) {
      const css = document.createElement('link');
      css.id = cssId;
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css';
      document.head.appendChild(css);
    }

    const loadScripts = async () => {
      const ensureScript = (id, src) => new Promise((resolve, reject) => {
        const existing = document.getElementById(id);
        if (existing) return resolve();
        const s = document.createElement('script');
        s.id = id;
        s.src = src;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = reject;
        document.body.appendChild(s);
      });

      try {
        await ensureScript(scriptId, 'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js');
        await ensureScript(presetId, 'https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js');
        setScriptReady(true);
      } catch (err) {
        console.warn('Swagger UI script load failed:', err);
        const node = document.getElementById('swagger-ui');
        if (node) {
          node.innerHTML = '<div style="padding:16px;color:#991b1b;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;">Could not load Swagger UI assets. Check internet access or CSP settings.</div>';
        }
      }
    };

    loadScripts();
  }, []);

  useEffect(() => {
    const tokenFromUrl = extractTokenFromUrl();
    if (!tokenFromUrl) return;
    setTokenInput(tokenFromUrl);
    setAuthToken(tokenFromUrl);
    localStorage.setItem('apiDocs.jwt', tokenFromUrl);
    setNotice('Applied JWT token from URL.');

    const clean = new URL(window.location.href);
    ['token', 'jwt', 'access_token', 'bearer'].forEach((k) => clean.searchParams.delete(k));
    clean.hash = '';
    window.history.replaceState({}, '', clean.toString());
  }, []);

  useEffect(() => {
    if (!scriptReady || !window.SwaggerUIBundle) return;

    if (uiRef.current?.destroy) {
      uiRef.current.destroy();
    }

    const token = authToken.trim();
    uiRef.current = window.SwaggerUIBundle({
      url: '/api/v1/openapi.json',
      dom_id: '#swagger-ui',
      deepLinking: true,
      persistAuthorization: true,
      requestInterceptor: (req) => {
        if (token) {
          req.headers = req.headers || {};
          req.headers.Authorization = `Bearer ${token}`;
        }
        return req;
      },
      presets: [window.SwaggerUIBundle.presets.apis, window.SwaggerUIStandalonePreset],
      layout: 'BaseLayout',
    });
  }, [scriptReady, authToken]);

  const applyToken = () => {
    const token = tokenInput.trim();
    setAuthToken(token);
    if (token) {
      localStorage.setItem('apiDocs.jwt', token);
      setNotice('Applied JWT to Swagger requests.');
    } else {
      localStorage.removeItem('apiDocs.jwt');
      setNotice('JWT input is empty.');
    }
  };

  const clearToken = () => {
    setTokenInput('');
    setAuthToken('');
    localStorage.removeItem('apiDocs.jwt');
    setNotice('Cleared Swagger JWT.');
  };

  const useCurrentSessionToken = () => {
    const current = localStorage.getItem('quantegy-auth-token') || '';
    if (!current.trim()) {
      setNotice('No current app session token found. Log in first.');
      return;
    }
    setTokenInput(current);
    setAuthToken(current);
    localStorage.setItem('apiDocs.jwt', current);
    setNotice('Loaded JWT from current app session.');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '18px 16px' }}>
        <h1 style={{ margin: '0 0 10px', fontSize: 24, fontWeight: 900, color: '#0f172a' }}>API Docs</h1>
        <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: 13 }}>
          Live Swagger UI for `v1` endpoints from `/api/v1/openapi.json`.
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Paste JWT token for Try it out"
            style={{
              flex: '1 1 360px',
              minWidth: 280,
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              padding: '9px 10px',
              fontSize: 13,
            }}
          />
          <button
            type="button"
            onClick={applyToken}
            style={{
              border: 0,
              borderRadius: 8,
              background: '#2563eb',
              color: '#fff',
              padding: '9px 12px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Apply JWT
          </button>
          <button
            type="button"
            onClick={useCurrentSessionToken}
            style={{
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              background: '#fff',
              color: '#334155',
              padding: '9px 12px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Use Current Session
          </button>
          <button
            type="button"
            onClick={clearToken}
            style={{
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              background: '#fff',
              color: '#334155',
              padding: '9px 12px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
          <a
            href="/teacher"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#2563eb', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
          >
            Open Teacher Login
          </a>
          <a
            href="/student"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#2563eb', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
          >
            Open Student Login
          </a>
        </div>
        <p style={{ margin: '0 0 6px', color: '#94a3b8', fontSize: 12 }}>
          Token is stored in browser local storage and added as `Authorization: Bearer ...` for API requests from this page.
        </p>
        {notice ? (
          <p style={{ margin: '0 0 6px', color: '#334155', fontSize: 12, fontWeight: 600 }}>
            {notice}
          </p>
        ) : null}
      </div>
      <div id="swagger-ui" />
    </div>
  );
}

