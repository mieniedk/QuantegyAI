// Unit tests for src/utils/api.js fetchWithRetry
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithRetry } from '../../src/utils/api.js';

describe('fetchWithRetry', () => {
  const testUrl = 'https://example.com/api';

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns response on first success', async () => {
    const mockRes = { ok: true, status: 200 };
    const mockFetch = vi.fn().mockResolvedValue(mockRes);
    vi.stubGlobal('fetch', mockFetch);

    const p = fetchWithRetry(testUrl);
    await vi.runAllTimersAsync();
    const res = await p;

    expect(res).toBe(mockRes);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('retries on network error', async () => {
    const mockRes = { ok: true, status: 200 };
    const mockFetch = vi.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockRes);

    vi.stubGlobal('fetch', mockFetch);

    const p = fetchWithRetry(testUrl, {}, { retries: 2 });
    await vi.runAllTimersAsync();
    const res = await p;

    expect(res).toBe(mockRes);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('retries on 5xx status', async () => {
    const mockRes = { ok: false, status: 500 };
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ...mockRes })
      .mockResolvedValueOnce({ ...mockRes, status: 200 });

    vi.stubGlobal('fetch', mockFetch);

    const p = fetchWithRetry(testUrl, {}, { retries: 2 });
    await vi.runAllTimersAsync();
    const res = await p;

    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('does not retry on 4xx (except 429)', async () => {
    const mockRes = { ok: false, status: 404 };
    const mockFetch = vi.fn().mockResolvedValue(mockRes);
    vi.stubGlobal('fetch', mockFetch);

    const p = fetchWithRetry(testUrl, {}, { retries: 2 });
    await vi.runAllTimersAsync();
    const res = await p;

    expect(res.status).toBe(404);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('retries on 429', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ status: 429 })
      .mockResolvedValueOnce({ status: 200 });
    vi.stubGlobal('fetch', mockFetch);

    const p = fetchWithRetry(testUrl, {}, { retries: 2 });
    await vi.runAllTimersAsync();
    const res = await p;

    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('throws after exhausting retries', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('fetch', mockFetch);

    const p = fetchWithRetry(testUrl, {}, { retries: 2 });
    const expectRejection = expect(p).rejects.toThrow('Network error');
    await vi.runAllTimersAsync();
    await expectRejection;
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });
});
