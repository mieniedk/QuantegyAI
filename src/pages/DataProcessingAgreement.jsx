import React from 'react';
import { Link } from 'react-router-dom';

const COMPANY = 'QuantegyAI';
const CONTACT_EMAIL = 'privacy@allenace.com';
const EFFECTIVE_DATE = 'March 2, 2026';

export default function DataProcessingAgreement() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 20px 80px' }}>
        <Link to="/" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>&larr; Back to Home</Link>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '20px 0 6px' }}>Data Processing Agreement</h1>
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>Effective Date: {EFFECTIVE_DATE}</p>
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 28 }}>This DPA is incorporated into the service agreement between {COMPANY} ("Processor") and the subscribing school or district ("Controller").</p>

        <Section title="1. Definitions">
          <ul>
            <li><strong>"Education Records"</strong> — records directly related to a student maintained by the school, as defined under FERPA (34 CFR § 99.3)</li>
            <li><strong>"Student Data"</strong> — personally identifiable information from education records, plus any data collected by the Processor on behalf of the Controller</li>
            <li><strong>"Processing"</strong> — any operation performed on Student Data, including collection, storage, use, transmission, and deletion</li>
            <li><strong>"Sub-processor"</strong> — a third party engaged by the Processor to process Student Data</li>
          </ul>
        </Section>

        <Section title="2. Scope and Purpose">
          <p>The Processor shall process Student Data solely for the purpose of providing the {COMPANY} learning management system services as described in the service agreement. Processing is limited to:</p>
          <ul>
            <li>Hosting and delivering educational content</li>
            <li>Managing class rosters, grades, and assessments</li>
            <li>Providing AI-powered educational features (tutoring, feedback, grading assistance)</li>
            <li>Generating learning analytics for educators</li>
            <li>Facilitating in-platform communication</li>
          </ul>
        </Section>

        <Section title="3. FERPA Compliance">
          <p>The Processor agrees to:</p>
          <ul>
            <li>Act as a "school official" with a "legitimate educational interest" under FERPA (34 CFR § 99.31(a)(1))</li>
            <li>Use Education Records only for the purposes specified in Section 2</li>
            <li>Not re-disclose Education Records except as permitted under FERPA or authorized by the Controller</li>
            <li>Comply with the Controller's obligations under FERPA regarding access, amendment, and complaint rights</li>
            <li>Return or destroy all Education Records upon termination per Section 8</li>
          </ul>
        </Section>

        <Section title="4. COPPA Compliance">
          <p>For students under 13, the Processor:</p>
          <ul>
            <li>Relies on the Controller (school) to provide consent on behalf of parents as permitted under COPPA</li>
            <li>Collects only the minimum personal information necessary for the educational service</li>
            <li>Does not use Student Data for commercial purposes unrelated to the educational service</li>
            <li>Does not disclose Student Data to third parties except as described in this DPA</li>
            <li>Provides mechanisms for the Controller to review, delete, or restrict processing of a child's data</li>
          </ul>
        </Section>

        <Section title="5. Security Measures">
          <p>The Processor implements and maintains the following technical and organizational measures:</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 8 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 700, color: '#0f172a' }}>Control</th>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 700, color: '#0f172a' }}>Implementation</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Authentication', 'JWT with 24h expiry, bcrypt password hashing (12 rounds)'],
                ['Authorization', 'Role-based access control (RBAC) with tenant isolation'],
                ['Encryption in transit', 'TLS/HTTPS required for all connections'],
                ['Encryption at rest', 'Database-level encryption available'],
                ['Access controls', 'Self-or-admin guards on user data, class membership checks'],
                ['Audit logging', 'All mutating API operations logged with actor, timestamp, IP'],
                ['Rate limiting', 'Per-IP rate limits on API and AI endpoints'],
                ['Security headers', 'CSP, HSTS, X-Content-Type-Options, X-Frame-Options, COOP, CORP'],
                ['Vulnerability management', 'Dependency scanning, CI pipeline with automated checks'],
                ['Backup & recovery', 'Automated backups with verified restore procedures'],
                ['Incident response', 'Defined SLOs and incident response runbook'],
              ].map(([control, impl], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px', fontWeight: 600 }}>{control}</td>
                  <td style={{ padding: '8px', color: '#475569' }}>{impl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="6. Sub-processors">
          <p>The Processor currently uses the following sub-processors:</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 8 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 700 }}>Sub-processor</th>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 700 }}>Purpose</th>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 700 }}>Data Processed</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Anthropic (Claude API)', 'AI tutoring, feedback, grading', 'De-identified student response text only'],
                ['Hosting Provider', 'Infrastructure', 'All platform data (encrypted)'],
                ['Stripe', 'Payment processing', 'Teacher billing data only (no student data)'],
                ['SMTP Provider', 'Email notifications', 'Email addresses and notification content'],
              ].map(([name, purpose, data], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px', fontWeight: 600 }}>{name}</td>
                  <td style={{ padding: '8px', color: '#475569' }}>{purpose}</td>
                  <td style={{ padding: '8px', color: '#475569' }}>{data}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: 8 }}>The Processor will notify the Controller at least 30 days before adding new sub-processors. The Controller may object to a new sub-processor within 14 days.</p>
        </Section>

        <Section title="7. Data Subject Rights">
          <p>The Processor will assist the Controller in responding to requests from parents, guardians, or eligible students to:</p>
          <ul>
            <li>Access and review their education records</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of personal information</li>
            <li>Export data in a portable format (CSV/JSON)</li>
          </ul>
          <p>The Processor provides self-service data export via <code>/api/course/:classId/export</code> and deletion via <code>/api/data-request/delete</code>.</p>
        </Section>

        <Section title="8. Data Return and Deletion">
          <p>Upon termination of the service agreement:</p>
          <ul>
            <li>The Controller may export all data within 60 days</li>
            <li>After the 60-day period, the Processor will delete all Student Data and Education Records</li>
            <li>The Processor will provide written certification of deletion upon request</li>
            <li>Backup copies will be purged within 90 days of termination</li>
            <li>Audit logs may be retained for up to 1 year after termination for compliance purposes</li>
          </ul>
        </Section>

        <Section title="9. Breach Notification">
          <p>In the event of a data breach involving Student Data:</p>
          <ul>
            <li>The Processor will notify the Controller within <strong>72 hours</strong> of becoming aware of the breach</li>
            <li>Notification will include: nature of the breach, data affected, remediation steps taken, and contact information</li>
            <li>The Processor will cooperate with the Controller's breach response and regulatory notification obligations</li>
          </ul>
        </Section>

        <Section title="10. Term and Governing Law">
          <p>This DPA remains in effect for the duration of the service agreement plus the data retention period described in Section 8. This DPA is governed by the laws of the state specified in the service agreement.</p>
        </Section>

        <Section title="11. Contact">
          <p>For DPA inquiries or to request execution of this agreement:</p>
          <p><strong>Email:</strong> {CONTACT_EMAIL}<br /><strong>Subject:</strong> "DPA Request — [School/District Name]"</p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 10px', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>{title}</h2>
      <div style={{ fontSize: 14, lineHeight: 1.7, color: '#334155' }}>{children}</div>
    </section>
  );
}
