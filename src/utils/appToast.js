export function showAppToast(message, options = {}) {
  if (!message) return;
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('app-toast', {
      detail: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        message: String(message),
        type: options.type || 'info',
        durationMs: options.durationMs || 3200,
      },
    }),
  );
}
