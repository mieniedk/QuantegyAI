/**
 * Persist flagged + weak (wrong) question IDs for Learning Loop spaced review.
 * Keyed by exam + domain comp + optional standard.
 */

const STORAGE_KEY = 'quantegyai-loop-review';
const LEGACY_STORAGE_KEY = 'allen-ace-loop-review';
const MAX_WEAK_ENTRIES = 200;
const MAX_FLAGGED_ENTRIES = 100;

function safeParse(raw) {
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function buildLoopReviewKey(examId, comp, currentStd) {
  return `${examId || ''}|${comp || ''}|${currentStd || ''}`;
}

export function loadLoopReview(key) {
  if (typeof window === 'undefined' || !key) {
    return { weak: {}, flagged: [] };
  }
  let raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw == null) {
    raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw != null) {
      try { window.localStorage.setItem(STORAGE_KEY, raw); } catch {}
    }
  }
  const all = safeParse(raw);
  const entry = all[key];
  if (!entry) return { weak: {}, flagged: [] };
  return {
    weak: typeof entry.weak === 'object' && entry.weak ? entry.weak : {},
    flagged: Array.isArray(entry.flagged) ? entry.flagged : [],
  };
}

function capWeak(weak) {
  if (!weak || typeof weak !== 'object') return {};
  const entries = Object.entries(weak);
  if (entries.length <= MAX_WEAK_ENTRIES) return weak;
  entries.sort((a, b) => (b[1] || 0) - (a[1] || 0));
  return Object.fromEntries(entries.slice(0, MAX_WEAK_ENTRIES));
}

function saveLoopReview(key, data) {
  if (typeof window === 'undefined' || !key) {
    return { ok: false, code: 'UNKNOWN', message: 'No storage' };
  }
  try {
    let raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw == null) raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    const all = safeParse(raw);
    const flagged = Array.isArray(data.flagged) ? [...new Set(data.flagged)] : [];
    all[key] = {
      weak: capWeak(data.weak || {}),
      flagged: flagged.slice(-MAX_FLAGGED_ENTRIES),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    import('./studentLearningSync.js').then((m) => m.scheduleLearningSyncPush()).catch(() => {});
    return { ok: true };
  } catch (e) {
    const code = e && e.name === 'QuotaExceededError' ? 'QUOTA_EXCEEDED' : 'UNKNOWN';
    return { ok: false, code, message: (e && e.message) || String(e) };
  }
}

/** Record wrong answers (timestamp for spaced ordering). */
export function addWeakQuestionIds(key, questionIds) {
  if (!key || !questionIds?.length) return { ok: true };
  const data = loadLoopReview(key);
  const now = Date.now();
  const weak = { ...data.weak };
  questionIds.forEach((id) => {
    if (id) weak[id] = now;
  });
  const snapshot = { ...data, weak };
  const persist = saveLoopReview(key, snapshot);
  if (!persist.ok) return { ...persist, recovery: { key, snapshot } };
  return persist;
}

export function toggleFlaggedQuestion(key, questionId) {
  if (!key || !questionId) return { data: loadLoopReview(key), persist: { ok: true } };
  const data = loadLoopReview(key);
  const set = new Set(data.flagged);
  if (set.has(questionId)) set.delete(questionId);
  else set.add(questionId);
  const flagged = [...set];
  const snapshot = { ...data, flagged };
  const persist = saveLoopReview(key, snapshot);
  return { data: loadLoopReview(key), persist, recovery: !persist.ok ? { key, snapshot } : undefined };
}

/** Merge-retry: merges snapshot with current state so newer changes aren't lost. */
export function persistLoopReviewSnapshot(key, snapshot) {
  if (!key || !snapshot) return { ok: false, code: 'UNKNOWN', message: 'Bad args' };
  const current = loadLoopReview(key);
  const mergedWeak = { ...current.weak };
  if (snapshot.weak && typeof snapshot.weak === 'object') {
    for (const [id, ts] of Object.entries(snapshot.weak)) {
      if (!mergedWeak[id] || ts > mergedWeak[id]) mergedWeak[id] = ts;
    }
  }
  const flaggedSet = new Set([...(current.flagged || []), ...(snapshot.flagged || [])]);
  return saveLoopReview(key, { weak: mergedWeak, flagged: [...flaggedSet] });
}

export function isQuestionFlagged(key, questionId) {
  const data = loadLoopReview(key);
  return data.flagged.includes(questionId);
}

/**
 * Ordered candidate IDs for spaced review: oldest weak first, then flagged not in weak.
 * Only ids that exist in allowedIdSet (same competency pool).
 */
export function getSpacedReviewCandidates(key, allowedIdSet, max = 5) {
  if (!key || !allowedIdSet || allowedIdSet.size === 0) return [];
  const data = loadLoopReview(key);
  const weakEntries = Object.entries(data.weak || {})
    .filter(([id]) => allowedIdSet.has(id))
    .sort((a, b) => (a[1] || 0) - (b[1] || 0));
  const out = [];
  const seen = new Set();
  weakEntries.forEach(([id]) => {
    if (out.length >= max) return;
    if (!seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  });
  (data.flagged || []).forEach((id) => {
    if (out.length >= max) return;
    if (allowedIdSet.has(id) && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  });
  return out;
}

/**
 * Ordered question IDs for mistake-weighted quiz picks: most recently wrong first, then flagged.
 * Restricted to ids in allowedIdSet (same competency/standard pool).
 */
export function getMistakePriorityIds(key, allowedIdSet, maxCandidates = 48) {
  if (!key || !allowedIdSet || allowedIdSet.size === 0) return [];
  const data = loadLoopReview(key);
  const weakEntries = Object.entries(data.weak || {})
    .filter(([id]) => allowedIdSet.has(id))
    .sort((a, b) => (b[1] || 0) - (a[1] || 0));
  const out = [];
  const seen = new Set();
  weakEntries.forEach(([id]) => {
    if (out.length >= maxCandidates) return;
    if (!seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  });
  (data.flagged || []).forEach((id) => {
    if (out.length >= maxCandidates) return;
    if (allowedIdSet.has(id) && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  });
  return out;
}
