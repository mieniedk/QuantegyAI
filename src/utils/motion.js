export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export function motionTransition(value, fallback = 'none') {
  return prefersReducedMotion() ? fallback : value;
}
