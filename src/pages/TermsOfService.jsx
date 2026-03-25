import React from 'react';
import { Link } from 'react-router-dom';

const COMPANY = 'QuantegyAI';
const CONTACT_EMAIL = 'legal@allenace.com';
const EFFECTIVE_DATE = 'March 2, 2026';

export default function TermsOfService() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 20px 80px' }}>
        <Link to="/" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>&larr; Back to Home</Link>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '20px 0 6px' }}>Terms of Service</h1>
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 28 }}>Effective Date: {EFFECTIVE_DATE}</p>

        <Section title="1. Acceptance of Terms">
          <p>By accessing or using {COMPANY} ("the Platform"), you agree to be bound by these Terms of Service. If you are entering into these terms on behalf of a school, district, or organization, you represent that you have the authority to bind that entity.</p>
        </Section>

        <Section title="2. Description of Service">
          <p>{COMPANY} is an AI-powered learning management system designed for K-12 education. The Platform provides tools for class management, assessments, grading, content delivery, communication, AI tutoring, and educational games.</p>
        </Section>

        <Section title="3. User Accounts">
          <ul>
            <li><strong>Teachers/Administrators:</strong> Must provide accurate registration information and maintain the security of their credentials.</li>
            <li><strong>Students:</strong> Accounts are created by or on behalf of schools. Student accounts for children under 13 require school authorization under COPPA.</li>
            <li>You are responsible for all activity that occurs under your account.</li>
            <li>You must notify us immediately of any unauthorized use.</li>
          </ul>
        </Section>

        <Section title="4. Acceptable Use">
          <p>You agree not to:</p>
          <ul>
            <li>Use the Platform for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to other accounts or systems</li>
            <li>Upload malicious content, viruses, or harmful code</li>
            <li>Harass, bully, or threaten other users</li>
            <li>Scrape, crawl, or use automated tools to extract data</li>
            <li>Circumvent security measures, rate limits, or access controls</li>
            <li>Use AI features to generate harmful, inappropriate, or deceptive content</li>
            <li>Re-sell or redistribute Platform access without authorization</li>
          </ul>
        </Section>

        <Section title="5. Content Ownership">
          <ul>
            <li><strong>Your Content:</strong> Teachers retain ownership of content they create (lesson plans, assessments, course materials). You grant us a limited license to host and display this content to authorized users.</li>
            <li><strong>Student Data:</strong> Student education records remain the property of the school/district. We process this data as a service provider under FERPA.</li>
            <li><strong>Platform Content:</strong> The Platform, its design, code, AI models, and documentation are owned by {COMPANY} and protected by intellectual property laws.</li>
          </ul>
        </Section>

        <Section title="6. Subscriptions and Payment">
          <ul>
            <li>Free tier features are available without payment</li>
            <li>Pro features require an active subscription</li>
            <li>Subscription fees are billed according to the plan selected</li>
            <li>You may cancel at any time; access continues through the paid period</li>
            <li>We reserve the right to change pricing with 30 days' notice</li>
            <li>School/district licenses are governed by the applicable purchase agreement</li>
          </ul>
        </Section>

        <Section title="7. AI Features Disclaimer">
          <p>AI-generated content (tutoring responses, auto-grading, feedback, lesson plans) is provided as an educational aid. Teachers should review AI outputs before using them in instruction or grading decisions. We do not guarantee the accuracy, completeness, or appropriateness of AI-generated content.</p>
        </Section>

        <Section title="8. Privacy">
          <p>Your use of the Platform is also governed by our <Link to="/privacy" style={{ color: '#2563eb', fontWeight: 600 }}>Privacy Policy</Link>, which describes how we collect, use, and protect personal information, including student education records.</p>
        </Section>

        <Section title="9. Data Processing Agreement">
          <p>Schools and districts may request execution of our <Link to="/dpa" style={{ color: '#2563eb', fontWeight: 600 }}>Data Processing Agreement</Link>, which provides additional contractual safeguards for student data processing in compliance with FERPA, COPPA, and applicable state laws.</p>
        </Section>

        <Section title="10. Service Availability">
          <p>We target 99.9% uptime but do not guarantee uninterrupted service. We will provide reasonable notice of planned maintenance. Our current platform status is available at <Link to="/status" style={{ color: '#2563eb', fontWeight: 600 }}>/status</Link>.</p>
        </Section>

        <Section title="11. Limitation of Liability">
          <p>To the maximum extent permitted by law, {COMPANY} shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the Platform. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
        </Section>

        <Section title="12. Termination">
          <ul>
            <li>You may terminate your account at any time</li>
            <li>We may suspend or terminate accounts that violate these Terms</li>
            <li>Upon termination, we will handle data retention and deletion as described in our Privacy Policy and any applicable DPA</li>
          </ul>
        </Section>

        <Section title="13. Changes to Terms">
          <p>We may update these Terms periodically. Material changes will be communicated with at least 30 days' notice. Continued use after changes take effect constitutes acceptance.</p>
        </Section>

        <Section title="14. Contact">
          <p><strong>Email:</strong> {CONTACT_EMAIL}</p>
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
