/**
 * Mastery Engine — TExES competency mastery scoring (0–100)
 *
 * Update rules (MVP):
 *   Diagnostic quiz correct: +10 each
 *   Post-quiz correct: +15 each
 *   Game accuracy ≥85%: +15
 *   Game accuracy 70–84%: +8
 *   Repeated same misconception: −10
 *   Fast accurate response bonus: +5
 *
 * Thresholds:
 *   0–39 = beginner
 *   40–69 = developing
 *   70–84 = near mastery
 *   85+ = mastered
 *
 * Move forward when:
 *   mastery ≥ 85
 *   AND at least one post-quiz medium-difficulty item correct
 *   AND game accuracy stable across two rounds
 */

const STORAGE_KEY = 'quantegyai-mastery';
const LEGACY_STORAGE_KEY = 'allen-ace-mastery';
const MAX_GAME_HISTORY = 4;

function getStoredRaw() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw != null) return raw;
  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacy != null) {
    try { localStorage.setItem(STORAGE_KEY, legacy); } catch {}
  }
  return legacy;
}

function load(examId) {
  try {
    const raw = getStoredRaw();
    const all = raw ? JSON.parse(raw) : {};
    return all[examId] || {};
  } catch {
    return {};
  }
}

/**
 * @returns {{ ok: true } | { ok: false, code: 'QUOTA_EXCEEDED' | 'UNKNOWN', message: string }}
 */
function save(examId, data) {
  try {
    const raw = getStoredRaw();
    const all = raw ? JSON.parse(raw) : {};
    all[examId] = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    import('./studentLearningSync.js').then((m) => m.scheduleLearningSyncPush()).catch(() => {});
    return { ok: true };
  } catch (e) {
    const code = e && e.name === 'QuotaExceededError' ? 'QUOTA_EXCEEDED' : 'UNKNOWN';
    return { ok: false, code, message: (e && e.message) || String(e) };
  }
}

/** Get competency key: compId or teks for EC-6-style exams */
function getCompKey(compId, teks) {
  return compId || teks || '';
}

/**
 * Storage key for mastery row.
 * When standardId is set with compId, progress is tracked per TExES competency (e.g. c006) inside a domain.
 */
export function getMasteryStorageKey(compId, teks, standardId) {
  if (compId && standardId) return `${compId}::${standardId}`;
  return getCompKey(compId, teks);
}

const MIG_PREFIX = '__mig__';

function cloneMasteryEntry(src) {
  if (!src || typeof src !== 'object') {
    return { score: 0, gameHistory: [], lastSeen: null, mistakes: [], postQuizMediumCorrect: false };
  }
  return {
    score: Math.min(100, Math.max(0, src.score ?? 0)),
    gameHistory: [...(src.gameHistory || [])].slice(-MAX_GAME_HISTORY),
    lastSeen: src.lastSeen ?? null,
    mistakes: [...(src.mistakes || [])].slice(-20),
    postQuizMediumCorrect: !!src.postQuizMediumCorrect,
  };
}

/**
 * One-time copy from domain-only key (e.g. comp001) to per-standard key (comp001::c006)
 * so users who practiced before per-standard tracking keep a starting point.
 */
export function maybeMigrateDomainToStandard(examId, compId, teks, standardId) {
  if (!examId || !compId || !standardId) return { migrated: false, persist: { ok: true } };
  const data = load(examId);
  const sKey = getMasteryStorageKey(compId, teks, standardId);
  const migFlag = `${MIG_PREFIX}${sKey}`;
  if (data[sKey]) return { migrated: false, persist: { ok: true } };
  if (data[migFlag]) return { migrated: false, persist: { ok: true } };
  const domainKey = compId;
  if (!domainKey || String(domainKey).includes('::')) return { migrated: false, persist: { ok: true } };
  const src = data[domainKey];
  if (!src || (src.score ?? 0) <= 0) return { migrated: false, persist: { ok: true } };
  data[sKey] = cloneMasteryEntry(src);
  data[migFlag] = true;
  const persist = save(examId, data);
  if (!persist.ok) {
    delete data[sKey];
    delete data[migFlag];
  }
  return { migrated: persist.ok, persist };
}

/** Re-attempt persist after QUOTA or transient failure (same entry blob). */
export function retryMasteryPersist(examId, key, entry) {
  const data = load(examId);
  data[key] = cloneMasteryEntry(entry);
  return save(examId, data);
}

/** Get mastery score (0–100) for a competency (optionally per standard when standardId is set) */
export function getMasteryScore(examId, compId, teks, standardId) {
  if (standardId && compId) {
    maybeMigrateDomainToStandard(examId, compId, teks, standardId);
  }
  const data = load(examId);
  const key = getMasteryStorageKey(compId, teks, standardId);
  const entry = data[key];
  if (!entry) return 0;
  return Math.min(100, Math.max(0, entry.score ?? 0));
}

/** Get mastery status: 'beginner' | 'developing' | 'near-mastery' | 'mastered' */
export function getMasteryStatus(examId, compId, teks, standardId) {
  const score = getMasteryScore(examId, compId, teks, standardId);
  if (score < 40) return 'beginner';
  if (score < 70) return 'developing';
  if (score < 85) return 'near-mastery';
  return 'mastered';
}

/** Get full competency entry for display */
export function getCompetencyEntry(examId, compId, teks, standardId) {
  if (standardId && compId) {
    maybeMigrateDomainToStandard(examId, compId, teks, standardId);
  }
  const data = load(examId);
  const key = getMasteryStorageKey(compId, teks, standardId);
  const entry = data[key] || { score: 0, gameHistory: [], lastSeen: null, mistakes: [] };
  return {
    score: Math.min(100, Math.max(0, entry.score ?? 0)),
    gameHistory: entry.gameHistory || [],
    lastSeen: entry.lastSeen,
    mistakes: entry.mistakes || [],
    postQuizMediumCorrect: entry.postQuizMediumCorrect ?? false,
  };
}

/**
 * Update mastery from an event.
 * @param {string} examId
 * @param {string} compId - competency id (e.g. comp001)
 * @param {string} teks - TEKS code for EC-6-style (used as key when compId not available)
 * @param {object} event - { type, ... }
 * @param {string} [standardId] - TExES standard id (e.g. c006); when set with compId, key is compId::standardId
 *   type: 'diagnostic' | 'post-quiz' | 'game' | 'misconception' | 'fast-correct'
 *   diagnostic: { correct, total }
 *   post-quiz: { correct, total, hasMediumCorrect }
 *   game: { accuracy, total, correct }
 *   misconception: { misconceptionId }
 *   fast-correct: {}
 */
/**
 * @returns {{ score: number, persist: object, recovery?: { examId: string, key: string, entry: object } }}
 */
export function updateMastery(examId, compId, teks, event, standardId) {
  if (standardId && compId) {
    maybeMigrateDomainToStandard(examId, compId, teks, standardId);
  }
  const data = load(examId);
  const key = getMasteryStorageKey(compId, teks, standardId);
  const entry = data[key] || { score: 0, gameHistory: [], lastSeen: null, mistakes: [], postQuizMediumCorrect: false };

  let delta = 0;

  switch (event.type) {
    case 'diagnostic':
      delta = (event.correct || 0) * 10;
      break;
    case 'post-quiz':
      delta = (event.correct || 0) * 15;
      if (event.hasMediumCorrect) entry.postQuizMediumCorrect = true;
      break;
    case 'game': {
      const acc = event.total > 0 ? (event.correct / event.total) * 100 : 0;
      delta = acc >= 85 ? 15 : acc >= 70 ? 8 : 0;
      entry.gameHistory = [...(entry.gameHistory || []), { accuracy: acc, correct: event.correct, total: event.total }].slice(-MAX_GAME_HISTORY);
      break;
    }
    case 'misconception':
      delta = -10;
      entry.mistakes = [...(entry.mistakes || []), event.misconceptionId || 'unknown'].slice(-20);
      break;
    case 'fast-correct':
      delta = 5;
      break;
    default:
      break;
  }

  entry.score = Math.min(100, Math.max(0, (entry.score ?? 0) + delta));
  entry.lastSeen = new Date().toISOString();
  data[key] = entry;
  const persist = save(examId, data);
  if (!persist.ok) {
    return {
      score: entry.score,
      persist,
      recovery: { examId, key, entry: cloneMasteryEntry(entry) },
    };
  }
  return { score: entry.score, persist };
}

/**
 * Can move forward (competency mastered)?
 * Requires: score ≥85, post-quiz medium correct at least once.
 * If game history has 2+ entries: also require stability (within 15% or both ≥70%).
 * MVP: if no game history yet, allow mastery with just score + post-quiz.
 */
export function canMoveForward(examId, compId, teks, standardId) {
  const entry = getCompetencyEntry(examId, compId, teks, standardId);
  if (entry.score < 85) return false;
  if (!entry.postQuizMediumCorrect) return false;

  const history = entry.gameHistory || [];
  if (history.length >= 2) {
    const [a, b] = history.slice(-2).map((h) => h.accuracy);
    const stable = Math.abs(a - b) <= 15 || (a >= 70 && b >= 70);
    if (!stable) return false;
  }
  return true;
}

/** Get exam-level progress: X of Y domains mastered (domain-level keys only, no ::standard) */
export function getExamProgress(examId, domainIds) {
  const data = load(examId);
  let mastered = 0;
  for (const compId of domainIds || []) {
    const entry = data[compId];
    if (entry && (entry.score ?? 0) >= 85) mastered++;
  }
  return { mastered, total: (domainIds || []).length };
}

/**
 * Progress across every listed standard (TExES competency c001…) under domains.
 * Domains shape: { id, standards?: [{ id }] }[]
 */
export function getStandardPathProgress(examId, domains) {
  const list = domains || [];
  let mastered = 0;
  let total = 0;
  for (const d of list) {
    const stds = d.standards || [];
    if (stds.length === 0) {
      total += 1;
      if (getMasteryScore(examId, d.id, '', '') >= 85) mastered += 1;
      continue;
    }
    for (const s of stds) {
      total += 1;
      if (getMasteryScore(examId, d.id, '', s.id) >= 85) mastered += 1;
    }
  }
  return { mastered, total, mode: 'standards' };
}

export const MASTERY_LABELS = {
  beginner: 'Beginner',
  developing: 'Developing',
  'near-mastery': 'Near Mastery',
  mastered: 'Mastered',
};

export const MASTERY_COLORS = {
  beginner: '#94a3b8',
  developing: '#f59e0b',
  'near-mastery': '#3b82f6',
  mastered: '#22c55e',
};
