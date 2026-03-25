/**
 * URL helpers for practice loop deep links (testable without React).
 */

/** @param {string} search - window.location.search or '' */
export function phaseNeedsUrlUpdate(search, phase) {
  if (!phase) return false;
  const p = new URLSearchParams(search || '');
  return p.get('phase') !== phase;
}

/** @param {string} search */
export function withPhaseInSearch(search, phase) {
  const next = new URLSearchParams(search || '');
  if (phase) next.set('phase', phase);
  return next;
}
