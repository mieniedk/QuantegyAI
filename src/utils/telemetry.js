const KEY = 'quantegy-telemetry-buffer';

function readBuffer() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeBuffer(items) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items.slice(-200)));
  } catch {}
}

export function trackEvent(name, payload = {}) {
  const event = {
    name,
    payload,
    ts: Date.now(),
    path: typeof window !== 'undefined' ? window.location.pathname + window.location.search : '',
  };

  const buffer = readBuffer();
  buffer.push(event);
  writeBuffer(buffer);

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    try {
      const blob = new Blob([JSON.stringify(event)], { type: 'application/json' });
      navigator.sendBeacon('/api/telemetry', blob);
    } catch {}
  }
}

export function flushTelemetryOnExit() {
  if (typeof window === 'undefined') return () => {};
  const onUnload = () => {
    trackEvent('page_unload');
  };
  window.addEventListener('beforeunload', onUnload);
  return () => window.removeEventListener('beforeunload', onUnload);
}
