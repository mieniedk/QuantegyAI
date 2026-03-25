/**
 * User-friendly error messages for common failure scenarios.
 * Use these instead of raw API errors to improve UX.
 */

export const ERROR_MESSAGES = {
  network: 'Unable to connect. Please check your internet connection and try again.',
  server: 'The server is not responding. Please try again in a moment.',
  auth: 'Your session may have expired. Please log in again.',
  notFound: 'The requested item could not be found.',
  forbidden: "You don't have permission to perform this action.",
  rateLimit: 'Too many requests. Please wait a moment and try again.',
  generic: 'Something went wrong. Please try again.',
};

/**
 * Maps common error patterns to user-friendly messages.
 * @param {Error|string} err - Error object or message
 * @param {string} context - Optional context (e.g. 'load', 'save', 'submit')
 * @returns {string} User-friendly message
 */
export function getUserFriendlyError(err, context = '') {
  const msg = typeof err === 'string' ? err : (err?.message || '');
  const lower = msg.toLowerCase();

  if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to fetch')) {
    return ERROR_MESSAGES.network;
  }
  if (lower.includes('401') || lower.includes('unauthorized') || lower.includes('expired')) {
    return ERROR_MESSAGES.auth;
  }
  if (lower.includes('403') || lower.includes('forbidden')) {
    return ERROR_MESSAGES.forbidden;
  }
  if (lower.includes('404') || lower.includes('not found')) {
    return ERROR_MESSAGES.notFound;
  }
  if (lower.includes('429') || lower.includes('rate limit')) {
    return ERROR_MESSAGES.rateLimit;
  }
  if (lower.includes('500') || lower.includes('server')) {
    return ERROR_MESSAGES.server;
  }

  return msg || (context ? `Failed to ${context}. Please try again.` : ERROR_MESSAGES.generic);
}
