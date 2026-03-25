import React from 'react';
import { Link } from 'react-router-dom';

const COMPANY = 'QuantegyAI';
const CONTACT_EMAIL = 'privacy@allenace.com';
const EFFECTIVE_DATE = 'March 2, 2026';

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 20px 80px' }}>
        <Link to="/" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>&larr; Back to Home</Link>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '20px 0 6px' }}>Privacy Policy</h1>
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 28 }}>Effective Date: {EFFECTIVE_DATE}</p>

        <Section title="1. Introduction">
          <p>{COMPANY} ("we," "us," "our") provides an AI-powered learning management system for K-12 educators, students, and parents. We are committed to protecting the privacy of all users, especially children under 13. This Privacy Policy describes how we collect, use, disclose, and safeguard personal information in compliance with:</p>
          <ul>
            <li><strong>FERPA</strong> — Family Educational Rights and Privacy Act (20 U.S.C. § 1232g)</li>
            <li><strong>COPPA</strong> — Children's Online Privacy Protection Act (15 U.S.C. §§ 6501–6506)</li>
            <li><strong>SOPIPA</strong> — Student Online Personal Protection and Innovation Act</li>
            <li><strong>State Student Privacy Laws</strong> — including applicable state-level requirements</li>
          </ul>
        </Section>

        <Section title="2. Information We Collect">
          <h4 style={h4}>2.1 Student Education Records</h4>
          <p>When used by a school or district, we act as a "school official" under FERPA. Student data we process on behalf of schools includes:</p>
          <ul>
            <li>Student name, username, and display name</li>
            <li>Class enrollment and roster data</li>
            <li>Grades, assessment scores, and submissions</li>
            <li>Assignment and quiz responses</li>
            <li>Chat messages within class contexts</li>
            <li>Learning analytics and progress data</li>
          </ul>
          <h4 style={h4}>2.2 Teacher / Administrator Data</h4>
          <ul>
            <li>Username and hashed password</li>
            <li>Profile information (name, school, subjects)</li>
            <li>Class and course content created</li>
            <li>Subscription and billing information</li>
          </ul>
          <h4 style={h4}>2.3 Automatically Collected Data</h4>
          <ul>
            <li>IP address (for rate limiting and security only)</li>
            <li>Browser type and device information</li>
            <li>Page access timestamps (audit logs)</li>
          </ul>
          <h4 style={h4}>2.4 Data We Do NOT Collect</h4>
          <ul>
            <li>Social Security numbers</li>
            <li>Biometric data</li>
            <li>Precise geolocation</li>
            <li>Data from third-party social media accounts</li>
            <li>Advertising profiles or behavioral tracking for ads</li>
          </ul>
        </Section>

        <Section title="3. How We Use Information">
          <p>We use personal information solely for educational purposes:</p>
          <ul>
            <li>Providing and improving the LMS platform</li>
            <li>Enabling AI-powered tutoring, grading, and feedback</li>
            <li>Generating analytics for teachers and administrators</li>
            <li>Communicating platform updates and security notices</li>
            <li>Ensuring platform security and preventing abuse</li>
          </ul>
          <p><strong>We never use student data for advertising, marketing, or building non-educational profiles.</strong></p>
        </Section>

        <Section title="4. AI Processing and Third-Party Services">
          <p>Our AI features (tutoring, auto-grading, feedback generation) use Anthropic's Claude API. When AI features are invoked:</p>
          <ul>
            <li>Only the minimum necessary data is sent (e.g., the student's response text)</li>
            <li>No student names or identifiers are included in AI API calls</li>
            <li>Anthropic does not retain input/output data for model training per our Data Processing Agreement</li>
            <li>AI processing is optional and can be disabled by the school administrator</li>
          </ul>
        </Section>

        <Section title="5. FERPA Compliance">
          <p>When contracted by a school or district, {COMPANY} operates under the "school official" exception to FERPA (34 CFR § 99.31(a)(1)). We:</p>
          <ul>
            <li>Use education records only for the purposes for which the disclosure was made</li>
            <li>Do not re-disclose education records without consent unless permitted by FERPA</li>
            <li>Are subject to FERPA's requirements governing the use and re-disclosure of personally identifiable information</li>
            <li>Return or destroy education records upon contract termination</li>
            <li>Support parent/guardian right to inspect and review education records</li>
            <li>Support data amendment requests as required</li>
          </ul>
        </Section>

        <Section title="6. COPPA Compliance">
          <p>For students under 13:</p>
          <ul>
            <li>We rely on school consent in lieu of parental consent, as permitted under the FTC's COPPA Rule when the school contracts with us for an educational purpose</li>
            <li>We collect only the minimum personal information necessary for platform functionality</li>
            <li>We do not require students to disclose more information than is reasonably necessary</li>
            <li>Parents/guardians may request to review, delete, or refuse further collection of their child's data by contacting us at <strong>{CONTACT_EMAIL}</strong></li>
            <li>We do not engage in behavioral advertising directed at children</li>
          </ul>
        </Section>

        <Section title="7. Data Security">
          <p>We implement industry-standard security measures including:</p>
          <ul>
            <li>Passwords hashed with bcrypt (12 salt rounds)</li>
            <li>JWT authentication with 24-hour token expiration</li>
            <li>HTTPS/TLS encryption in transit</li>
            <li>Content Security Policy (CSP) and security headers</li>
            <li>Role-based access control (RBAC) with tenant isolation</li>
            <li>API rate limiting to prevent abuse</li>
            <li>Audit logging of all data-modifying operations</li>
            <li>Automated backup and disaster recovery procedures</li>
          </ul>
          <p>See our <Link to="/security" style={{ color: '#2563eb', fontWeight: 600 }}>Security Documentation</Link> for full details.</p>
        </Section>

        <Section title="8. Data Retention and Deletion">
          <ul>
            <li><strong>Active accounts:</strong> Data retained while the account is active and the school contract is in effect</li>
            <li><strong>Contract termination:</strong> Education records returned or destroyed within 60 days of contract end</li>
            <li><strong>Individual deletion:</strong> Teachers and administrators may delete student data through the platform. Schools may request bulk deletion by contacting {CONTACT_EMAIL}</li>
            <li><strong>Audit logs:</strong> Retained for 1 year for security and compliance, then purged</li>
          </ul>
          <p>Data export is available in standard formats (CSV, JSON) via the platform and API.</p>
        </Section>

        <Section title="9. Data Sharing and Disclosure">
          <p>We do not sell, rent, or trade personal information. We may share data only:</p>
          <ul>
            <li>With the contracting school or district</li>
            <li>With service providers bound by data processing agreements (e.g., hosting, AI processing)</li>
            <li>When required by law, regulation, or valid legal process</li>
            <li>To protect the safety of users or the public in an emergency</li>
          </ul>
        </Section>

        <Section title="10. Parent and Student Rights">
          <p>Parents, guardians, and eligible students (18+) have the right to:</p>
          <ul>
            <li>Inspect and review education records</li>
            <li>Request correction of inaccurate records</li>
            <li>Request deletion of personal information</li>
            <li>Export their data in a portable format</li>
            <li>Opt out of non-essential data collection</li>
          </ul>
          <p>To exercise these rights, contact your school administrator or email <strong>{CONTACT_EMAIL}</strong>.</p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>We may update this Privacy Policy periodically. We will notify schools of material changes at least 30 days in advance. The "Effective Date" at the top indicates the latest revision.</p>
        </Section>

        <Section title="12. Contact">
          <p>For privacy-related questions, data requests, or concerns:</p>
          <p><strong>Email:</strong> {CONTACT_EMAIL}<br />
          <strong>Subject line:</strong> "Privacy Request — [Your School Name]"</p>
        </Section>
      </div>
    </div>
  );
}

const h4 = { fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '14px 0 6px' };

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 10px', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>{title}</h2>
      <div style={{ fontSize: 14, lineHeight: 1.7, color: '#334155' }}>{children}</div>
    </section>
  );
}
