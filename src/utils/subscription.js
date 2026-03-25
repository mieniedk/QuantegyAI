/**
 * Subscription & Trial management for Quantegy AI.
 *
 * Free tier:  Games library, student portal (always free)
 * Trial:     7-day free trial of Pro features on teacher signup
 * Pro:       AI Copilot, Test Bank, Gradebook, Dashboard analytics,
 *            export PDF/Word, shareable quiz links
 *
 * Data stored per teacher in localStorage.
 */

const STORAGE_KEY = 'allen-ace-subscriptions';

const TRIAL_DAYS = 7;

export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['Games Library', 'Student Portal', 'Class Setup (1 class)', 'Basic TEKS Alignment'],
  },
  trial: {
    id: 'trial',
    name: 'Free Trial',
    price: 0,
    days: TRIAL_DAYS,
    features: ['Everything in Free', 'AI Copilot (all tabs)', 'Test Bank', 'Gradebook', 'Dashboard Analytics', 'Export PDF & Word', 'Shareable Quiz Links', 'Unlimited Classes'],
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    price: 20,
    period: 'month',
    features: ['Everything in Free Trial', 'Unlimited AI generations', 'Priority support', 'School-wide analytics'],
  },
  pro_yearly: {
    id: 'pro_yearly',
    name: 'Pro Yearly',
    price: 200,
    period: 'year',
    savings: '17% off',
    features: ['Everything in Pro Monthly', 'Best value — save $40/year'],
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    price: 39,
    period: 'month',
    features: [
      'Everything in Pro Monthly',
      'Marketplace course publishing',
      'Revenue analytics dashboard',
      'Affiliate link system',
      'Certificate issuance',
      'Native payment processing (85% payout)',
      'Subscription & one-time pricing',
    ],
  },
  creator_yearly: {
    id: 'creator_yearly',
    name: 'Creator Yearly',
    price: 390,
    period: 'year',
    savings: '17% off',
    features: ['Everything in Creator Monthly', 'Best value — save $78/year'],
  },
};

/* ── Storage helpers ── */

const loadAll = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const saveAll = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

/* ── Per-teacher subscription record ── */

/**
 * Get the subscription record for a teacher.
 * Returns: { plan, trialStart, trialEnd, paidUntil, stripeCustomerId }
 */
export const getSubscription = (username) => {
  const all = loadAll();
  return all[username] || null;
};

/**
 * Start a free trial for a teacher (called on signup).
 */
export const startTrial = (username) => {
  const all = loadAll();
  if (all[username]) return all[username]; // already has a record
  const now = new Date();
  const end = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  const record = {
    plan: 'trial',
    trialStart: now.toISOString(),
    trialEnd: end.toISOString(),
    paidUntil: null,
    stripeCustomerId: null,
  };
  all[username] = record;
  saveAll(all);
  syncSubscriptionToServer(username, record);
  return record;
};

/**
 * Activate a paid plan (called after successful Stripe checkout).
 */
export const activatePlan = (username, planId, stripeCustomerId) => {
  const all = loadAll();
  const now = new Date();
  const period = planId === 'pro_yearly' ? 365 : 30;
  const paidUntil = new Date(now.getTime() + period * 24 * 60 * 60 * 1000);
  all[username] = {
    ...(all[username] || {}),
    plan: planId,
    paidUntil: paidUntil.toISOString(),
    stripeCustomerId: stripeCustomerId || null,
  };
  saveAll(all);
  syncSubscriptionToServer(username, all[username]);
  return all[username];
};

/* ── Status checks ── */

/**
 * Check if a teacher has active Pro access (trial or paid).
 */
export const hasProAccess = (username) => {
  const sub = getSubscription(username);
  if (!sub) return false;

  // Paid plan active?
  if (sub.paidUntil && new Date(sub.paidUntil) > new Date()) return true;

  // Trial active?
  if (sub.plan === 'trial' && sub.trialEnd && new Date(sub.trialEnd) > new Date()) return true;

  return false;
};

/**
 * Check if a teacher has an active paid subscription (no trial).
 * Use for features that are paywalled even during trial (e.g. TExES full practice exam).
 */
export const hasPaidProAccess = (username) => {
  const sub = getSubscription(username);
  if (!sub) return false;
  return !!(sub.paidUntil && new Date(sub.paidUntil) > new Date());
};

/**
 * Get trial days remaining (0 if expired or not on trial).
 */
export const getTrialDaysLeft = (username) => {
  const sub = getSubscription(username);
  if (!sub || !sub.trialEnd) return 0;
  const diff = new Date(sub.trialEnd) - new Date();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
};

/**
 * Check if the trial has expired (and no paid plan).
 */
export const isTrialExpired = (username) => {
  const sub = getSubscription(username);
  if (!sub) return false;
  if (sub.paidUntil && new Date(sub.paidUntil) > new Date()) return false;
  if (sub.trialEnd && new Date(sub.trialEnd) <= new Date()) return true;
  return false;
};

/**
 * Get a human-readable status string.
 */
export const getStatusLabel = (username) => {
  const sub = getSubscription(username);
  if (!sub) return 'No account';
  if (sub.paidUntil && new Date(sub.paidUntil) > new Date()) {
    return sub.plan === 'pro_yearly' ? 'Pro (Yearly)' : 'Pro (Monthly)';
  }
  const daysLeft = getTrialDaysLeft(username);
  if (daysLeft > 0) return `Free Trial (${daysLeft} day${daysLeft !== 1 ? 's' : ''} left)`;
  return 'Trial Expired';
};

/**
 * Features that require Pro access.
 */
export const PRO_FEATURES = [
  'ai-copilot',
  'test-bank',
  'gradebook',
  'dashboard',
  'export',
  'share-link',
  'unlimited-classes',
];

export const syncSubscriptionFromServer = async (username) => {
  if (!username) return null;
  try {
    const token = localStorage.getItem('quantegy-auth-token');
    if (!token) return null;
    const res = await fetch('/api/billing/subscription/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!data.success || !data.subscription) return null;
    const all = loadAll();
    all[username] = data.subscription;
    saveAll(all);
    return data.subscription;
  } catch (err) {
    console.warn('Subscription sync from server failed:', err);
    return null;
  }
};

function syncSubscriptionToServer(username, record) {
  try {
    const token = localStorage.getItem('quantegy-auth-token');
    if (!token) return;
    fetch('/api/auth/subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ subscription: record }),
    }).catch((err) => { console.warn('Subscription sync to server failed:', err); });
  } catch (err) {
    console.warn('Subscription sync to server failed:', err);
  }
}
