/**
 * API client with auth headers and retry logic.
 * Use this for API calls that need authentication.
 *
 * @example
 * import { apiRequest } from '../utils/apiClient';
 * const res = await apiRequest('/api/notifications/prefs', { method: 'PUT', body: JSON.stringify(prefs) });
 * const data = await res.json();
 */

import { fetchWithRetry } from './api.js';
import { getAuthToken } from './storage.js';

/**
 * Build headers with auth token.
 * @param {Record<string, string>} [extra] - Additional headers
 * @returns {Record<string, string>}
 */
function authHeaders(extra = {}) {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json', ...extra };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/**
 * Fetch with auth headers and retry. Same signature as fetch.
 * @param {string} url
 * @param {RequestInit} [options]
 * @param {{ retries?: number }} [retryConfig]
 * @returns {Promise<Response>}
 */
export function apiRequest(url, options = {}, retryConfig = {}) {
  const isFormData = options.body instanceof FormData;
  const baseHeaders = authHeaders(isFormData ? {} : { 'Content-Type': 'application/json' });
  const merged = {
    ...options,
    headers: { ...baseHeaders, ...(options.headers || {}) },
  };
  return fetchWithRetry(url, merged, retryConfig);
}
