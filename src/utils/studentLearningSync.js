/**
 * Sync mastery, loop review (weak/flagged), and learning-experience milestones
 * to the student account via existing /api/auth/student/progress (SQLite student_progress).
 */

import { isStudentLoggedIn, isLocalToken, pushProgress, pullProgress } from './studentAuth.js';

export const LEARNING_BLOB_KEYS = {
  mastery: 'quantegyai-mastery',
  experience: 'quantegyai-learning-experience',
  review: 'quantegyai-loop-review',
};

const LEGACY_BLOB_KEYS = {
  'allen-ace-mastery': LEARNING_BLOB_KEYS.mastery,
  'allen-ace-learning-experience': LEARNING_BLOB_KEYS.experience,
  'allen-ace-loop-review': LEARNING_BLOB_KEYS.review,
};

const SYNC_EVENT = 'quantegy-learning-sync';

let pushDebounceTimer = null;
const PUSH_DEBOUNCE_MS = 1800;
let pullOnceSession = false;

function readRawLocalStorageKey(canonicalKey) {
  if (typeof window === 'undefined') return null;
  let raw = window.localStorage.getItem(canonicalKey);
  if (raw != null) return raw;
  const legacyEntry = Object.entries(LEGACY_BLOB_KEYS).find(([, v]) => v === canonicalKey);
  if (legacyEntry) {
    raw = window.localStorage.getItem(legacyEntry[0]);
  }
  return raw;
}

function parseJson(raw) {
  if (raw == null || raw === '') return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function canSyncToServer() {
  return typeof window !== 'undefined' && isStudentLoggedIn() && !isLocalToken();
}

/** Bump PracticeLoop / dashboards that read mastery from localStorage. */
export function emitLearningSyncEvent() {
  try {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  } catch { /* ignore */ }
}

function pickNewerMasteryEntry(a, b) {
  if (!a || typeof a !== 'object') return b && typeof b === 'object' ? { ...b } : a;
  if (!b || typeof b !== 'object') return { ...a };
  const ta = String(a.lastSeen || '');
  const tb = String(b.lastSeen || '');
  if (tb > ta) return { ...b };
  if (ta > tb) return { ...a };
  const sa = Number(a.score) || 0;
  const sb = Number(b.score) || 0;
  return sb >= sa ? { ...b } : { ...a };
}

/** Merge per-exam mastery objects by competency key (newer lastSeen wins; tie → higher score). */
export function mergeMasteryBlobs(localAll, remoteAll) {
  const out = localAll && typeof localAll === 'object' ? { ...localAll } : {};
  if (!remoteAll || typeof remoteAll !== 'object') return out;
  for (const [examId, remoteExam] of Object.entries(remoteAll)) {
    if (!remoteExam || typeof remoteExam !== 'object') continue;
    const localExam = out[examId] && typeof out[examId] === 'object' ? out[examId] : {};
    const merged = { ...localExam };
    for (const [compKey, remoteEntry] of Object.entries(remoteExam)) {
      if (compKey.startsWith('__')) {
        merged[compKey] = remoteEntry;
        continue;
      }
      merged[compKey] = pickNewerMasteryEntry(localExam[compKey], remoteEntry);
    }
    out[examId] = merged;
  }
  return out;
}

function mergeLoopReviewRows(localRow, remoteRow) {
  const a = localRow && typeof localRow === 'object' ? localRow : { weak: {}, flagged: [] };
  const b = remoteRow && typeof remoteRow === 'object' ? remoteRow : { weak: {}, flagged: [] };
  const weak = { ...(a.weak || {}), ...(b.weak || {}) };
  const ids = new Set([...Object.keys(a.weak || {}), ...Object.keys(b.weak || {})]);
  ids.forEach((id) => {
    const la = Number((a.weak || {})[id]) || 0;
    const ra = Number((b.weak || {})[id]) || 0;
    weak[id] = Math.max(la, ra);
  });
  const flagged = [...new Set([...(a.flagged || []), ...(b.flagged || [])])];
  return { weak, flagged };
}

export function mergeLoopReviewBlobs(localAll, remoteAll) {
  const out = localAll && typeof localAll === 'object' ? { ...localAll } : {};
  if (!remoteAll || typeof remoteAll !== 'object') return out;
  for (const [k, remoteRow] of Object.entries(remoteAll)) {
    out[k] = mergeLoopReviewRows(out[k], remoteRow);
  }
  return out;
}

function mergeMilestoneBuckets(localB, remoteB) {
  const out = { ...(localB && typeof localB === 'object' ? localB : {}) };
  const r = remoteB && typeof remoteB === 'object' ? remoteB : {};
  for (const [loopKey, remoteMap] of Object.entries(r)) {
    if (!remoteMap || typeof remoteMap !== 'object') continue;
    const loc = out[loopKey] && typeof out[loopKey] === 'object' ? out[loopKey] : {};
    out[loopKey] = { ...loc, ...remoteMap };
  }
  return out;
}

function mergeSessionDiagnostic(localD, remoteD) {
  const out = { ...(localD && typeof localD === 'object' ? localD : {}) };
  const r = remoteD && typeof remoteD === 'object' ? remoteD : {};
  for (const [k, rv] of Object.entries(r)) {
    const lv = out[k];
    const numR = typeof rv === 'number' ? rv : Number(rv);
    const numL = typeof lv === 'number' ? lv : Number(lv);
    if (Number.isFinite(numR) && (!Number.isFinite(numL) || numR > numL)) out[k] = numR;
    else if (lv === undefined) out[k] = rv;
  }
  return out;
}

/** Merge learning-experience blob: union milestones & session diagnostics; keep local goals/pacing unless empty. */
export function mergeLearningExperienceBlobs(local, remote) {
  if (!remote || typeof remote !== 'object') return local && typeof local === 'object' ? { ...local } : {};
  const out = local && typeof local === 'object' ? { ...local } : {};
  if (!out.goals && remote.goals) out.goals = { ...remote.goals };
  else if (out.goals && remote.goals) {
    out.goals = {
      examDate: out.goals.examDate || remote.goals.examDate || '',
      focusCompId: out.goals.focusCompId || remote.goals.focusCompId || '',
    };
  }
  if (out.pacing == null && remote.pacing != null) out.pacing = remote.pacing;
  out.milestones = mergeMilestoneBuckets(out.milestones, remote.milestones);
  out.sessionDiagnostic = mergeSessionDiagnostic(out.sessionDiagnostic, remote.sessionDiagnostic);
  const locRef = Array.isArray(out.reflections) ? out.reflections : [];
  const remRef = Array.isArray(remote.reflections) ? remote.reflections : [];
  if (remRef.length) {
    const merged = [...locRef, ...remRef].sort((a, b) => (a.at || 0) - (b.at || 0));
    out.reflections = merged.slice(-50);
  }
  return out;
}

async function pushBlob(canonicalKey) {
  if (!canSyncToServer()) return;
  const raw = readRawLocalStorageKey(canonicalKey);
  if (!raw) return;
  const data = parseJson(raw);
  if (data == null) return;
  await pushProgress(canonicalKey, data);
}

/**
 * Push all three blobs (used after signup and on debounced saves).
 */
export async function pushAllLearningBlobsToServer() {
  if (!canSyncToServer()) return;
  await Promise.all([
    pushBlob(LEARNING_BLOB_KEYS.mastery),
    pushBlob(LEARNING_BLOB_KEYS.experience),
    pushBlob(LEARNING_BLOB_KEYS.review),
  ]);
}

/**
 * Debounced upload after local writes. No-op for offline / local demo tokens.
 */
export function scheduleLearningSyncPush() {
  if (!canSyncToServer()) return;
  if (pushDebounceTimer) clearTimeout(pushDebounceTimer);
  pushDebounceTimer = setTimeout(() => {
    pushDebounceTimer = null;
    pushAllLearningBlobsToServer().catch(() => {});
  }, PUSH_DEBOUNCE_MS);
}

/**
 * Pull server progress and merge into localStorage. Call once per session on app load (real student token).
 */
export async function pullAndMergeLearningBlobsFromServer() {
  if (!canSyncToServer()) return { merged: false };
  const res = await pullProgress();
  if (res == null || typeof res !== 'object') return { merged: false };

  let mergedAny = false;

  const m = res[LEARNING_BLOB_KEYS.mastery];
  if (m?.data) {
    const local = parseJson(readRawLocalStorageKey(LEARNING_BLOB_KEYS.mastery)) || {};
    const next = mergeMasteryBlobs(local, m.data);
    try {
      window.localStorage.setItem(LEARNING_BLOB_KEYS.mastery, JSON.stringify(next));
      mergedAny = true;
    } catch { /* ignore */ }
  }

  const r = res[LEARNING_BLOB_KEYS.review];
  if (r?.data) {
    const local = parseJson(readRawLocalStorageKey(LEARNING_BLOB_KEYS.review)) || {};
    const next = mergeLoopReviewBlobs(local, r.data);
    try {
      window.localStorage.setItem(LEARNING_BLOB_KEYS.review, JSON.stringify(next));
      mergedAny = true;
    } catch { /* ignore */ }
  }

  const e = res[LEARNING_BLOB_KEYS.experience];
  if (e?.data) {
    const local = parseJson(readRawLocalStorageKey(LEARNING_BLOB_KEYS.experience)) || {};
    const next = mergeLearningExperienceBlobs(local, e.data);
    try {
      window.localStorage.setItem(LEARNING_BLOB_KEYS.experience, JSON.stringify(next));
      mergedAny = true;
    } catch { /* ignore */ }
  }

  if (mergedAny) {
    emitLearningSyncEvent();
    scheduleLearningSyncPush();
  }
  return { merged: mergedAny };
}

/**
 * One pull per browser session (tab) after real login, so returning users get server state without hammering API.
 */
export function pullLearningOncePerSession() {
  if (pullOnceSession || !canSyncToServer()) return;
  pullOnceSession = true;
  pullAndMergeLearningBlobsFromServer().catch(() => {});
}

export function resetLearningPullSessionFlag() {
  pullOnceSession = false;
}
