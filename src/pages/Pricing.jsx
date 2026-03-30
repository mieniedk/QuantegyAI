import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  PLANS, getSubscription, hasProAccess, getTrialDaysLeft,
  isTrialExpired, getStatusLabel,
} from '../utils/subscription';
import { getTeachers } from '../utils/storage';
import { createStudentCheckout, getStudentInfo, isStudentLoggedIn } from '../utils/studentAuth';
import { showAppToast } from '../utils/appToast';

/* ── Pricing & Subscription page ── */

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState('');
  const [sub, setSub] = useState(null);
  const [pricingAudience, setPricingAudience] = useState('teacher');
  const [studentExamId, setStudentExamId] = useState('math712');
  const [studentBusyPlanId, setStudentBusyPlanId] = useState('');
  const studentInfo = getStudentInfo();
  const hasStudentSession = isStudentLoggedIn() && !!studentInfo;
  const studentTexesPortalUrl = `/student?focus=texes-signup&examId=${encodeURIComponent(studentExamId)}`;

  const STUDENT_PLANS = [
    {
      id: 'student_exam_onetime',
      name: 'Student - This Exam',
      price: 29,
      period: 'one-time',
      features: [
        'Unlock full loop for selected exam',
        'All 21 tiles and mastery checks',
        'Continue where you left off',
      ],
    },
    {
      id: 'student_monthly',
      name: 'Student - All Exams',
      price: 9.99,
      period: 'month',
      features: [
        'Access all student exams',
        'Unlimited loop practice',
        'New exams included while active',
      ],
    },
  ];

  /* Detect logged-in teacher from localStorage (same key as Teacher.jsx) */
  useEffect(() => {
    const teachers = getTeachers();
    // If the URL has ?user=xxx from redirect, use that
    const urlUser = searchParams.get('user');
    if (urlUser) {
      setUsername(urlUser);
      const s = getSubscription(urlUser);
      setSub(s);
    }
    // Try latest logged-in teacher from localStorage fallback
    const sessionUser = localStorage.getItem('quantegy-teacher-user');
    if (sessionUser) {
      setUsername(sessionUser);
      setSub(getSubscription(sessionUser));
    }
    const hasTeacherSession = !!sessionUser || !!urlUser;
    if (hasStudentSession && !hasTeacherSession) setPricingAudience('student');
    else setPricingAudience('teacher');
  }, [searchParams]);

  const handleCheckout = (planId) => {
    if (!username) {
      if (hasStudentSession) {
        showAppToast('You are signed in as a student. Teacher subscriptions are in the Teacher Portal.', { type: 'info' });
        navigate(studentTexesPortalUrl);
        return;
      }
      showAppToast('Choose your portal: Student or Teacher.', { type: 'warning' });
      return;
    }
    // Navigate to the checkout page with plan and user info
    navigate(`/checkout?plan=${planId}&user=${encodeURIComponent(username)}`);
  };

  const handleStudentCheckout = async (planId) => {
    if (!hasStudentSession) {
      showAppToast('Please sign in to the Student Portal to continue.', { type: 'warning' });
      navigate(studentTexesPortalUrl);
      return;
    }
    setStudentBusyPlanId(planId);
    try {
      const result = await createStudentCheckout(studentExamId, planId);
      if (!result?.success && !result?.url) {
        showAppToast(result?.error || 'Could not start student checkout.', { type: 'error' });
      }
    } catch (err) {
      showAppToast(err?.message || 'Could not start student checkout.', { type: 'error' });
    } finally {
      setStudentBusyPlanId('');
    }
  };

  const daysLeft = username ? getTrialDaysLeft(username) : 0;
  const hasPro = username ? hasProAccess(username) : false;
  const expired = username ? isTrialExpired(username) : false;
  const statusLabel = username ? getStatusLabel(username) : '';

  return (
    <div style={{ padding: '30px 20px', maxWidth: 900, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      {/* Nav */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#2563eb', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>← Home</Link>
        <Link to="/student" style={{ color: '#2563eb', textDecoration: 'none', fontSize: 14 }}>Student Portal</Link>
        <Link to="/teacher" style={{ color: '#2563eb', textDecoration: 'none', fontSize: 14 }}>Teacher Portal</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
        <div style={{ display: 'inline-flex', border: '1px solid #cbd5e1', borderRadius: 10, overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => setPricingAudience('student')}
            style={{
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: pricingAudience === 'student' ? '#dbeafe' : '#fff',
              color: pricingAudience === 'student' ? '#1d4ed8' : '#475569',
            }}
          >
            Student Plans
          </button>
          <button
            type="button"
            onClick={() => setPricingAudience('teacher')}
            style={{
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: pricingAudience === 'teacher' ? '#dbeafe' : '#fff',
              color: pricingAudience === 'teacher' ? '#1d4ed8' : '#475569',
            }}
          >
            Teacher Plans
          </button>
        </div>
      </div>

      <h1 style={{ textAlign: 'center', marginBottom: 4, fontSize: 32 }}>Quantegy AI Pricing</h1>
      <p style={{ textAlign: 'center', color: '#64748b', fontSize: 15, marginBottom: 8 }}>
        Start with a <strong>free 7-day trial</strong> of all Pro features. No credit card required.
      </p>

      {/* Portal choice helper */}
      <div style={{
        textAlign: 'center', margin: '12px auto 0', padding: '10px 14px',
        background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, maxWidth: 620,
      }}>
        <div style={{ fontSize: 13, color: '#334155', marginBottom: 8 }}>
          {hasStudentSession
            ? `Signed in as student ${studentInfo?.displayName || studentInfo?.username}.`
            : 'Need a different portal? Choose where to continue:'}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate(studentTexesPortalUrl)}
            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #16a34a', background: '#ecfdf5', color: '#166534', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
          >
            Go to Student Portal
          </button>
          <button
            type="button"
            onClick={() => navigate('/teacher')}
            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #2563eb', background: '#eff6ff', color: '#1d4ed8', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
          >
            Go to Teacher Portal
          </button>
        </div>
      </div>

      {/* Status banner */}
      {username && (
        <div style={{
          textAlign: 'center', margin: '16px auto', padding: '10px 20px',
          background: hasPro ? '#ecfdf5' : expired ? '#fef2f2' : '#f0f9ff',
          border: `1px solid ${hasPro ? '#a7f3d0' : expired ? '#fca5a5' : '#bfdbfe'}`,
          borderRadius: 10, maxWidth: 500, fontSize: 14,
          color: hasPro ? '#065f46' : expired ? '#991b1b' : '#1e40af',
        }}>
          <strong>{username}</strong> — {statusLabel}
          {daysLeft > 0 && daysLeft <= 3 && (
            <span style={{ marginLeft: 8, color: '#dc2626', fontWeight: 700 }}>
              Hurry! Only {daysLeft} day{daysLeft !== 1 ? 's' : ''} left.
            </span>
          )}
        </div>
      )}

      {pricingAudience === 'teacher' ? (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 24, marginTop: 32,
        }}>
          <PlanCard
            plan={PLANS.free}
            current={sub && expired && !hasPro}
            onSelect={null}
            accent="#94a3b8"
          />
          <PlanCard
            plan={PLANS.pro_monthly}
            current={sub?.plan === 'pro_monthly' && hasPro}
            popular
            onSelect={() => handleCheckout('pro_monthly')}
            accent="#2563eb"
          />
          <PlanCard
            plan={PLANS.pro_yearly}
            current={sub?.plan === 'pro_yearly' && hasPro}
            onSelect={() => handleCheckout('pro_yearly')}
            accent="#7c3aed"
            badge={PLANS.pro_yearly.savings}
          />
        </div>
      ) : (
        <>
          <div style={{ marginTop: 16, marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
            <label style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>
              Exam:
              <select
                value={studentExamId}
                onChange={(e) => setStudentExamId(e.target.value)}
                style={{ marginLeft: 8, padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
              >
                <option value="math712">TExES Math 7-12</option>
                <option value="math48">TExES Math 4-8</option>
              </select>
            </label>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24, marginTop: 16,
          }}>
            {STUDENT_PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                current={false}
                popular={plan.id === 'student_exam_onetime'}
                onSelect={() => handleStudentCheckout(plan.id)}
                loading={studentBusyPlanId === plan.id}
                accent={plan.id === 'student_exam_onetime' ? '#059669' : '#2563eb'}
              />
            ))}
          </div>
          {!hasStudentSession && (
            <p style={{ textAlign: 'center', marginTop: 10, fontSize: 13, color: '#64748b' }}>
              Sign in to the Student Portal before checkout.
            </p>
          )}
        </>
      )}

      {/* Feature comparison */}
      <div style={{ marginTop: 48 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Feature Comparison</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse', fontSize: 14,
            background: '#fff', borderRadius: 10, overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={thStyle}>Feature</th>
                <th style={thStyle}>Free</th>
                <th style={{ ...thStyle, color: '#2563eb' }}>Pro</th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_ROWS.map(([feature, free, pro]) => (
                <tr key={feature}>
                  <td style={tdStyle}>{feature}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{free ? '✓' : '—'}</td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#2563eb', fontWeight: 600 }}>{pro ? '✓' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ marginTop: 48, maxWidth: 650, margin: '48px auto 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>FAQ</h2>
        {FAQ_ITEMS.map(([q, a]) => (
          <div key={q} style={{ marginBottom: 16 }}>
            <p style={{ fontWeight: 700, margin: '0 0 4px', fontSize: 14 }}>{q}</p>
            <p style={{ margin: 0, color: '#475569', fontSize: 13, lineHeight: 1.6 }}>{a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Plan Card ── */
const PlanCard = ({ plan, current, popular, loading, onSelect, accent, badge }) => (
  <div style={{
    border: popular ? `2px solid ${accent}` : '1px solid #e2e8f0',
    borderRadius: 14, padding: 24, position: 'relative',
    background: current ? '#f0fdf4' : '#fff',
    boxShadow: popular ? '0 4px 20px rgba(37,99,235,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column',
  }}>
    {popular && (
      <span style={{
        position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
        background: accent, color: '#fff', fontSize: 11, fontWeight: 700,
        padding: '3px 14px', borderRadius: 20, letterSpacing: 0.5,
      }}>MOST POPULAR</span>
    )}
    {badge && (
      <span style={{
        position: 'absolute', top: -12, right: 16,
        background: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 700,
        padding: '3px 14px', borderRadius: 20,
      }}>{badge}</span>
    )}
    <h3 style={{ margin: '0 0 4px', color: accent, fontSize: 20 }}>{plan.name}</h3>
    <div style={{ fontSize: 32, fontWeight: 800, margin: '8px 0' }}>
      {plan.price === 0 ? 'Free' : `$${plan.price}`}
      {plan.period && <span style={{ fontSize: 14, fontWeight: 400, color: '#64748b' }}>/{plan.period}</span>}
    </div>
    <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 20px', flex: 1 }}>
      {plan.features.map((f) => (
        <li key={f} style={{ fontSize: 13, color: '#334155', padding: '4px 0', lineHeight: 1.5 }}>
          <span style={{ color: accent, marginRight: 8, fontWeight: 700 }}>✓</span>{f}
        </li>
      ))}
    </ul>
    {current ? (
      <div style={{
        textAlign: 'center', padding: '10px 0', fontWeight: 700,
        color: '#059669', fontSize: 14,
      }}>Current Plan</div>
    ) : onSelect ? (
      <button
        type="button"
        onClick={onSelect}
        disabled={loading}
        style={{
          padding: '12px 0', width: '100%', borderRadius: 10,
          background: loading ? '#94a3b8' : accent, color: '#fff',
          fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'wait' : 'pointer',
          transition: 'opacity 0.2s',
        }}
      >
        {loading ? 'Redirecting...' : plan.price === 0 ? 'Current Plan' : 'Subscribe Now'}
      </button>
    ) : (
      <div style={{
        textAlign: 'center', padding: '10px 0', fontWeight: 600,
        color: '#94a3b8', fontSize: 14,
      }}>Free Plan</div>
    )}
  </div>
);

/* ── Feature rows for comparison table ── */
const FEATURE_ROWS = [
  ['Games Library (Math Match, Sprints)', true, true],
  ['Student Portal', true, true],
  ['TEKS-Aligned Content', true, true],
  ['Class Setup', '1 class', 'Unlimited'],
  ['AI Copilot (Lesson Plans, Questions)', false, true],
  ['Test Bank (save & reuse questions)', false, true],
  ['Gradebook', false, true],
  ['Dashboard Analytics', false, true],
  ['Export PDF / Word', false, true],
  ['Shareable Quiz Links', false, true],
  ['Priority Support', false, true],
];

/* ── FAQ ── */
const FAQ_ITEMS = [
  ['How does the free trial work?', 'When you create a teacher account, you automatically get 7 days of full Pro access — no credit card required. After the trial ends, you can continue using the free tier or upgrade to Pro.'],
  ['Can I cancel anytime?', 'Yes. You can cancel your subscription at any time. You keep Pro access until the end of your current billing period.'],
  ['What happens when my trial expires?', 'You can still use the Games Library, Student Portal, and basic class setup. Pro features like the AI Copilot, Test Bank, Gradebook, and analytics require an upgrade.'],
  ['Is there a discount for schools?', 'Yes! Contact us for school-wide and district pricing. We offer volume discounts for 10+ teachers.'],
  ['What payment methods do you accept?', 'We accept all major credit and debit cards through Stripe. Payment processing is secure and PCI-compliant.'],
];

/* ── Table styles ── */
const thStyle = { padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 700, borderBottom: '1px solid #e2e8f0' };
const tdStyle = { padding: '10px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 13 };

export default Pricing;
