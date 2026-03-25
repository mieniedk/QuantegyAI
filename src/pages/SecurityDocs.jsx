import React from 'react';
import { Link } from 'react-router-dom';

const COMPANY = 'QuantegyAI';
const CONTACT_EMAIL = 'security@allenace.com';

export default function SecurityDocs() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 20px 80px' }}>
        <Link to="/" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>&larr; Back to Home</Link>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '20px 0 6px' }}>Security Documentation</h1>
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 28 }}>How {COMPANY} protects your data</p>

        <Section title="Architecture Overview">
          <ul>
            <li><strong>Frontend:</strong> React 19 single-page application served over HTTPS</li>
            <li><strong>Backend:</strong> Node.js / Express API server with SQLite (WAL mode)</li>
            <li><strong>Real-time:</strong> Socket.IO with JWT authentication</li>
            <li><strong>AI:</strong> Anthropic Claude API (de-identified data only)</li>
            <li><strong>File storage:</strong> Server-local with authenticated access</li>
          </ul>
        </Section>

        <Section title="Authentication">
          <table style={tbl}>
            <tbody>
              {[
                ['Password storage', 'bcrypt with 12 salt rounds'],
                ['Session tokens', 'JWT (HS256) with 24-hour expiration'],
                ['SSO', 'Google, Microsoft, Clever OAuth 2.0'],
                ['LTI', 'LTI 1.3 with RS256 JWT validation and JWKS'],
                ['Session invalidation', 'Token expiry; immediate on logout'],
                ['Brute force protection', 'API rate limiting (180 req/min general, 40 req/min AI)'],
              ].map(([k, v], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600, width: '35%' }}>{k}</td>
                  <td style={{ padding: '8px 12px', color: '#475569' }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Authorization">
          <table style={tbl}>
            <tbody>
              {[
                ['Role-Based Access Control', 'teacher, student, admin roles with middleware enforcement'],
                ['Tenant isolation', 'Self-or-admin guards on user resources; class membership checks'],
                ['API boundaries', 'Students cannot access teacher endpoints; teachers cannot access other teachers\' data'],
                ['LTI role mapping', 'Instructor/student role from LTI claims mapped to RBAC'],
              ].map(([k, v], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600, width: '35%' }}>{k}</td>
                  <td style={{ padding: '8px 12px', color: '#475569' }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="HTTP Security Headers">
          <table style={tbl}>
            <tbody>
              {[
                ['Content-Security-Policy', "Strict policy: default-src 'self', no inline scripts except trusted CDNs"],
                ['X-Content-Type-Options', 'nosniff'],
                ['X-Frame-Options', 'SAMEORIGIN (relaxed for LTI iframes)'],
                ['Referrer-Policy', 'strict-origin-when-cross-origin'],
                ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()'],
                ['Cross-Origin-Opener-Policy', 'same-origin'],
                ['Cross-Origin-Resource-Policy', 'same-origin'],
                ['X-DNS-Prefetch-Control', 'off'],
              ].map(([k, v], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600, fontSize: 12, width: '40%', fontFamily: 'monospace' }}>{k}</td>
                  <td style={{ padding: '8px 12px', color: '#475569', fontSize: 13 }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Data Protection">
          <ul>
            <li><strong>In transit:</strong> TLS/HTTPS for all connections</li>
            <li><strong>At rest:</strong> SQLite with WAL mode; database file protected by OS-level permissions</li>
            <li><strong>Backups:</strong> Automated backup scripts with verified restore procedures</li>
            <li><strong>AI data:</strong> Only de-identified student response text sent to Anthropic; no names, IDs, or metadata</li>
            <li><strong>File uploads:</strong> Stored server-side with authenticated access; directory traversal prevented</li>
          </ul>
        </Section>

        <Section title="Monitoring and Incident Response">
          <ul>
            <li><strong>Audit logging:</strong> All POST/PUT/PATCH/DELETE operations logged with actor, path, status, duration, IP</li>
            <li><strong>SRE metrics:</strong> Real-time p50/p95/p99 latency, 5xx error rate, availability tracking</li>
            <li><strong>SLO targets:</strong> 99.9% availability, p95 latency &lt; 500ms, 5xx rate &lt; 0.1%</li>
            <li><strong>Alerting:</strong> Automated SLO breach alerts via webhook and email</li>
            <li><strong>Incident response:</strong> Defined severity levels (SEV-1/2/3) with response time targets</li>
            <li><strong>Status page:</strong> Public platform status at <Link to="/status" style={{ color: '#2563eb', fontWeight: 600 }}>/status</Link></li>
          </ul>
        </Section>

        <Section title="Development Practices">
          <ul>
            <li><strong>CI/CD:</strong> GitHub Actions pipeline with lint, build, and automated tests</li>
            <li><strong>Testing:</strong> Unit tests (store/data layer) + API integration tests (auth, RBAC, health)</li>
            <li><strong>Code review:</strong> All changes reviewed before merge</li>
            <li><strong>Dependency management:</strong> Regular updates; vulnerability scanning</li>
            <li><strong>Docker:</strong> Multi-stage production builds with health checks</li>
          </ul>
        </Section>

        <Section title="Responsible Disclosure">
          <p>If you discover a security vulnerability, please report it responsibly:</p>
          <p><strong>Email:</strong> {CONTACT_EMAIL}<br /><strong>Subject:</strong> "Security Vulnerability Report"</p>
          <p>We will acknowledge receipt within 48 hours and provide an initial assessment within 5 business days. We do not pursue legal action against good-faith security researchers.</p>
        </Section>
      </div>
    </div>
  );
}

const tbl = { width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 8, marginBottom: 8 };

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 10px', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>{title}</h2>
      <div style={{ fontSize: 14, lineHeight: 1.7, color: '#334155' }}>{children}</div>
    </section>
  );
}
