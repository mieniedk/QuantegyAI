import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PLANS, syncSubscriptionFromServer, activatePlan } from '../utils/subscription';

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan') || 'pro_monthly';
  const username = searchParams.get('user') || localStorage.getItem('quantegy-teacher-user') || '';
  const success = searchParams.get('success') === '1';
  const cancelled = searchParams.get('cancelled') === '1';
  const plan = PLANS[planId];
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (success && username) {
      syncSubscriptionFromServer(username).then((sub) => {
        if (sub) activatePlan(username, sub.plan || planId, sub.stripeCustomerId);
      }).catch(() => {
        activatePlan(username, planId, null);
      });
    }
  }, [success, username, planId]);

  const summaryText = useMemo(() => {
    if (!plan) return '';
    return planId.includes('yearly') ? 'Billed yearly. Cancel anytime.' : 'Billed monthly. Cancel anytime.';
  }, [plan, planId]);

  const launchCheckout = async () => {
    if (!username) {
      navigate('/teacher');
      return;
    }
    try {
      setProcessing(true);
      setError('');
      const token = localStorage.getItem('quantegy-auth-token');
      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ planId, origin: window.location.origin }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Unable to create checkout session.');
      if (data.demo) {
        activatePlan(username, planId, null);
        navigate(`/checkout?success=1&plan=${planId}&user=${encodeURIComponent(username)}`);
        return;
      }
      if (!data.url) throw new Error('Stripe checkout URL missing.');
      window.location.href = data.url;
    } catch (e) {
      setError(e.message);
      setProcessing(false);
    }
  };

  const openBillingPortal = async () => {
    try {
      const token = localStorage.getItem('quantegy-auth-token');
      const res = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ origin: window.location.origin }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Unable to open billing portal.');
      if (data.demo) {
        navigate(`/pricing?user=${encodeURIComponent(username)}`);
        return;
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e.message);
    }
  };

  if (!plan) {
    return <div style={wrap}><h2>Invalid plan</h2><Link to="/pricing">Back to Pricing</Link></div>;
  }

  if (success) {
    return (
      <div style={wrap}>
        <div style={card}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>&#10003;</div>
            <h2 style={{ marginTop: 0, color: '#065f46' }}>You&apos;re subscribed!</h2>
            <p style={{ color: '#475569', margin: '8px 0 0' }}>
              Your <strong>{plan.name}</strong> plan is now active. All Pro features are unlocked.
            </p>
          </div>
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, color: '#065f46' }}>{plan.name}</div>
                <div style={{ fontSize: 13, color: '#047857' }}>${plan.price}{plan.period ? `/${plan.period}` : ''}</div>
              </div>
              <div style={{ background: '#059669', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Active</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/teacher" style={linkBtn}>Go to Teacher Portal</Link>
            <button type="button" onClick={openBillingPortal} style={btnGhost}>Manage Billing</button>
            <Link to="/pricing" style={{ textAlign: 'center', color: '#64748b', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>View Plans</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <Link to="/pricing" style={{ color: '#2563eb', textDecoration: 'none', fontSize: 14 }}>&larr; Back to Pricing</Link>
        <h2 style={{ marginBottom: 6 }}>Complete Your Subscription</h2>
        <p style={{ color: '#64748b', marginTop: 0, fontSize: 14 }}>
          Secure checkout powered by Stripe. Your card details never touch our servers.
        </p>
        {cancelled ? <div style={warn}>Checkout cancelled. No charge was made.</div> : null}
        {error ? <div style={err}>{error}</div> : null}

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, marginBottom: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{plan.name}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#2563eb', margin: '4px 0' }}>
            ${plan.price}<span style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>{plan.period ? `/${plan.period}` : ''}</span>
          </div>
          <div style={{ fontSize: 13, color: '#64748b' }}>{summaryText}</div>
          <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none' }}>
            {(plan.features || []).slice(0, 5).map((f) => (
              <li key={f} style={{ fontSize: 13, color: '#334155', padding: '3px 0' }}>
                <span style={{ color: '#2563eb', marginRight: 8, fontWeight: 700 }}>&#10003;</span>{f}
              </li>
            ))}
          </ul>
        </div>

        <button type="button" onClick={launchCheckout} disabled={processing} style={{
          ...btn,
          opacity: processing ? 0.7 : 1,
          cursor: processing ? 'wait' : 'pointer',
        }}>
          {processing ? 'Processing...' : `Subscribe — $${plan.price}/${plan.period || 'month'}`}
        </button>

        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>256-bit SSL encrypted &middot; Cancel anytime</span>
        </div>
      </div>
    </div>
  );
};

const wrap = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" };
const card = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' };
const btn = { width: '100%', border: 0, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', borderRadius: 10, padding: '14px 14px', fontWeight: 800, fontSize: 15 };
const btnGhost = { width: '100%', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', borderRadius: 10, padding: '12px 12px', fontWeight: 700, fontSize: 14, cursor: 'pointer' };
const linkBtn = { textDecoration: 'none', textAlign: 'center', border: 0, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', borderRadius: 10, padding: '12px 12px', fontWeight: 700, fontSize: 14, display: 'block' };
const err = { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 13 };
const warn = { background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 13 };

export default Checkout;
