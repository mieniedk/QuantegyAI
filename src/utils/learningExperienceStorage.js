/**
 * Goals, pacing, milestones, reflection, session meta for a richer learning loop UX.
 */

const STORAGE_KEY = 'quantegyai-learning-experience';
const LEGACY_STORAGE_KEY = 'allen-ace-learning-experience';

function safeParse(raw) {
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function loadAll() {
  if (typeof window === 'undefined') return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw != null) return safeParse(raw);
  const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacy != null) {
    try { window.localStorage.setItem(STORAGE_KEY, legacy); } catch {}
  }
  return safeParse(legacy);
}

/**
 * @returns {{ ok: true } | { ok: false, code: 'QUOTA_EXCEEDED' | 'UNKNOWN', message: string }}
 */
export function saveAll(data) {
  if (typeof window === 'undefined') return { ok: false, code: 'UNKNOWN', message: 'No window' };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return { ok: true };
  } catch (e) {
    const name = e && e.name;
    const code = name === 'QuotaExceededError' || (e && e.code === 22) ? 'QUOTA_EXCEEDED' : 'UNKNOWN';
    return { ok: false, code, message: (e && e.message) || String(e) };
  }
}

export function getLearningGoals() {
  const all = loadAll();
  const g = all.goals || {};
  return {
    examDate: g.examDate || '',
    focusCompId: g.focusCompId || '',
  };
}

export function saveLearningGoals(goals) {
  const all = loadAll();
  all.goals = {
    examDate: goals.examDate || '',
    focusCompId: goals.focusCompId || '',
  };
  return saveAll(all);
}

/** 'support' | 'balanced' | 'faster' */
export function getPacingPreference() {
  const all = loadAll();
  const p = all.pacing;
  if (p === 'support' || p === 'faster' || p === 'balanced') return p;
  return 'balanced';
}

export function savePacingPreference(pacing) {
  const all = loadAll();
  all.pacing = pacing === 'support' || pacing === 'faster' ? pacing : 'balanced';
  return saveAll(all);
}

const MAX_LOOP_SESSIONS = 50;

/** Per browser session tab + loop seed — break timing is isolated per run */
export function touchLoopSessionStart(loopSessionSeed) {
  if (!loopSessionSeed || typeof window === 'undefined') return { ok: true };
  const all = loadAll();
  const sessions = typeof all.loopSessions === 'object' && all.loopSessions && !Array.isArray(all.loopSessions) ? all.loopSessions : {};
  if (!sessions[loopSessionSeed]) {
    sessions[loopSessionSeed] = { startedAt: Date.now() };
    const keys = Object.keys(sessions);
    if (keys.length > MAX_LOOP_SESSIONS) {
      const sorted = keys.sort((a, b) => (sessions[a]?.startedAt || 0) - (sessions[b]?.startedAt || 0));
      const excess = sorted.slice(0, keys.length - MAX_LOOP_SESSIONS);
      for (const k of excess) delete sessions[k];
    }
    all.loopSessions = sessions;
    return saveAll(all);
  }
  return { ok: true };
}

export function getLoopSessionStartedAt(loopSessionSeed) {
  if (!loopSessionSeed) return null;
  const sessions = loadAll().loopSessions;
  if (!sessions || typeof sessions !== 'object') return null;
  const t = sessions[loopSessionSeed]?.startedAt;
  return typeof t === 'number' ? t : null;
}

/** @deprecated use touchLoopSessionStart(loopSessionSeed) */
export function touchSessionStart() {
  touchLoopSessionStart('legacy-global');
}

export function getSessionStartedAt() {
  return getLoopSessionStartedAt('legacy-global') || loadAll().sessionStartedAt || null;
}

export function milestoneStorageKey(examId, comp, std) {
  return `${examId || ''}|${comp || ''}|${std || ''}`;
}

/** Returns true if this was the first time setting the milestone */
export function trySetMilestone(loopKey, name) {
  if (!loopKey || !name) return { applied: false, persist: { ok: true } };
  const all = loadAll();
  const m = all.milestones || {};
  const bucket = { ...(m[loopKey] || {}) };
  if (bucket[name]) return { applied: false, persist: { ok: true } };
  bucket[name] = true;
  m[loopKey] = bucket;
  all.milestones = m;
  const persist = saveAll(all);
  return { applied: true, persist };
}

export function saveSessionDiagnosticPct(loopKey, pct) {
  if (loopKey == null) return { ok: true };
  const all = loadAll();
  all.sessionDiagnostic = { ...(all.sessionDiagnostic || {}), [loopKey]: pct };
  return saveAll(all);
}

export function getSessionDiagnosticPct(loopKey) {
  if (!loopKey) return null;
  const v = loadAll().sessionDiagnostic?.[loopKey];
  return typeof v === 'number' ? v : null;
}

export function saveReflection(loopKey, payload) {
  if (!loopKey) return { ok: false, code: 'UNKNOWN', message: 'No loop key' };
  const all = loadAll();
  const list = Array.isArray(all.reflections) ? all.reflections : [];
  list.push({
    loopKey,
    at: Date.now(),
    chips: payload.chips || [],
    text: payload.text || '',
  });
  all.reflections = list.slice(-50);
  return saveAll(all);
}

function breakShownKey(sessionSeed) {
  return `quantegyai-loop-break-${sessionSeed || 'default'}`;
}

export function shouldOfferBreak(sessionSeed, tilesCompleted, minTiles = 8, minMinutes = 22) {
  if (typeof window === 'undefined') return false;
  if (!sessionSeed || tilesCompleted < minTiles) return false;
  const started = getLoopSessionStartedAt(sessionSeed);
  if (!started) return false;
  const elapsedMin = (Date.now() - started) / 60000;
  if (elapsedMin < minMinutes) return false;
  try {
    if (sessionStorage.getItem(breakShownKey(sessionSeed))) return false;
    if (sessionStorage.getItem(`allen-ace-loop-break-${sessionSeed || 'default'}`)) return false;
  } catch {
    return false;
  }
  return true;
}

export function markBreakOffered(sessionSeed) {
  try {
    sessionStorage.setItem(breakShownKey(sessionSeed), '1');
  } catch { /* ignore */ }
}

export function getRecoveryHintForDifficulty(difficulty) {
  const d = difficulty === 3 || difficulty === 'hard' ? 'hard' : difficulty === 1 || difficulty === 'easy' ? 'easy' : 'medium';
  if (d === 'hard') {
    return 'Rework the problem on paper: write the governing equation/rule first, show each algebra step, and verify by substitution before moving on.';
  }
  if (d === 'medium') {
    return 'Do one targeted redo: identify the operation that changed the expression (distribute, combine like terms, isolate variable), then check arithmetic signs.';
  }
  return 'Use the key idea to set up the math structure (equation/table/diagram), solve cleanly, and check units or reasonableness.';
}

export function getTeachingMove(compId) {
  const map = {
    comp001: 'Tomorrow: one exit ticket item on number types or operations, and one brief “explain why” prompt.',
    comp002: 'Tomorrow: one exit ticket matching equation ↔ graph, and one error-analysis prompt on a common algebra slip.',
    comp003: 'Tomorrow: one measurement or diagram item and one “justify the formula” sentence.',
    comp004: 'Tomorrow: one short data display interpretation and one probability reasoning prompt.',
    comp005: 'Tomorrow: one problem-solving strategy reflection (which approach and why).',
    comp006: 'Tomorrow: note one formative assessment move you’d use after this topic and what you’d look for in student work.',
  };
  return map[compId] || 'Tomorrow: one aligned exit question plus one prompt that asks students to explain their reasoning in a sentence.';
}

export function getExamCountdownLabel(examDateStr) {
  if (!examDateStr) return null;
  const t = Date.parse(examDateStr);
  if (Number.isNaN(t)) return null;
  const days = Math.ceil((t - Date.now()) / 86400000);
  if (days < 0) return 'Exam date has passed — use this loop for refresh and weak-area review.';
  if (days === 0) return 'Exam is today — short focused reps beat long cram sessions.';
  if (days === 1) return '1 day until your target — prioritize weakest competencies and sleep.';
  if (days <= 7) return `${days} days until your target — we’ll keep mixing retrieval and confidence checks.`;
  if (days <= 30) return `${days} days until your target — steady loops beat last-minute spikes.`;
  return `${days} days until your target — you have room to deepen each domain.`;
}
