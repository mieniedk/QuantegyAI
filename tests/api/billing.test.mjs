import { describe, it, expect, beforeAll } from 'vitest';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3001';

async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  return { status: res.status, data: await res.json() };
}

const unique = () => `billing_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

describe('Billing APIs', () => {
  let token;

  beforeAll(async () => {
    const username = unique();
    const signup = await api('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, password: 'Pass1234!' }),
    });
    token = signup.data.token;
  });

  it('returns billing plans catalog', async () => {
    const res = await api('/api/billing/plans');
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(Array.isArray(res.data.plans)).toBe(true);
    expect(res.data.plans.some((p) => p.id === 'pro_monthly')).toBe(true);
  });

  it('returns entitlements for current teacher', async () => {
    const res = await api('/api/billing/entitlements/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.entitlements).toBeTruthy();
    expect(typeof res.data.entitlements.active).toBe('boolean');
  });

  it('create checkout session fails gracefully when Stripe is not configured', async () => {
    const res = await api('/api/billing/create-checkout-session', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ planId: 'pro_monthly' }),
    });
    expect([200, 503, 400]).toContain(res.status);
    if (res.status !== 200) {
      expect(res.data.success).toBe(false);
    }
  });
});
