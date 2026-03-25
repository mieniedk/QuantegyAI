const OLD_PREFIX = 'allen-ace-';
const NEW_PREFIX = 'quantegyai-';
const MIGRATION_FLAG = 'quantegyai-storage-migrated-v1';

/**
 * One-time best-effort migration of localStorage keys:
 * allen-ace-* -> quantegyai-*
 *
 * Keeps legacy keys in place for backward compatibility.
 */
export function migrateBrandStorageKeys() {
  if (typeof window === 'undefined') return;
  try {
    if (window.localStorage.getItem(MIGRATION_FLAG) === '1') return;
    const toCopy = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(OLD_PREFIX)) continue;
      const nextKey = `${NEW_PREFIX}${key.slice(OLD_PREFIX.length)}`;
      if (window.localStorage.getItem(nextKey) == null) {
        toCopy.push([key, nextKey]);
      }
    }
    for (const [oldKey, newKey] of toCopy) {
      const raw = window.localStorage.getItem(oldKey);
      if (raw != null) window.localStorage.setItem(newKey, raw);
    }
    window.localStorage.setItem(MIGRATION_FLAG, '1');
  } catch {
    // ignore storage errors; app continues with legacy keys
  }
}
