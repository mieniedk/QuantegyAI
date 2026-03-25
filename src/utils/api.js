/**
 * Central API fetch with retry logic for transient failures.
 * Retries on network errors, 5xx, and 429 (rate limit).
 * Does not retry on 4xx (except 429).
 */

const DEFAULT_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;
const MAX_DELAY_MS = 10000;

/**
 * Sleep for a given number of milliseconds.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if a response status is retryable.
 * @param {number} status
 * @returns {boolean}
 */
function isRetryableStatus(status) {
  if (!status) return true; // Network error, no response
  if (status === 429) return true; // Rate limit
  if (status >= 500 && status < 600) return true; // Server errors
  return false;
}

/**
 * Fetch with retries and exponential backoff.
 * @param {string} url - Request URL
 * @param {RequestInit} [options] - Fetch options (same as native fetch)
 * @param {{ retries?: number, onRetry?: (attempt: number, err: Error) => void }} [config] - Retry config
 * @returns {Promise<Response>}
 */
export async function fetchWithRetry(url, options = {}, config = {}) {
  const { retries = DEFAULT_RETRIES, onRetry } = config;
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);

      if (attempt < retries && isRetryableStatus(res.status)) {
        const delay = Math.min(
          INITIAL_DELAY_MS * Math.pow(2, attempt),
          MAX_DELAY_MS
        );
        if (onRetry) onRetry(attempt + 1, new Error(`HTTP ${res.status}`));
        await sleep(delay);
        continue;
      }

      return res;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        const delay = Math.min(
          INITIAL_DELAY_MS * Math.pow(2, attempt),
          MAX_DELAY_MS
        );
        if (onRetry) onRetry(attempt + 1, err);
        await sleep(delay);
      } else {
        throw err;
      }
    }
  }

  throw lastError;
}
