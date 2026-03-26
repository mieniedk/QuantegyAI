/**
 * Per-concept performance tracker
 *
 * Stores and retrieves per-concept performance data in localStorage.
 * Data shape per concept:
 *   {
 *     conceptId: string,
 *     attempts: number,
 *     correct: number,
 *     totalTime: number,         // sum of seconds across all attempts
 *     streak: number,            // current consecutive correct
 *     bestStreak: number,
 *     lastSeen: ISO string,
 *     lastScore: number,         // last accuracy (0-1)
 *     errorTypes: { [subskill]: count },
 *     history: [ { date, correct, time, gameId } ]  // last 20 entries
 *   }
 */

const STORAGE_KEY = 'allen-ace-concept-tracker';
const MAX_HISTORY = 20;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Get tracker data for a single concept */
export function getConceptStats(conceptId) {
  const data = load();
  return data[conceptId] || createEmpty(conceptId);
}

/** Get tracker data for all concepts that have any data */
export function getAllConceptStats() {
  return load();
}

/** Record a game result for a concept */
export function recordResult(conceptId, { correct, time, gameId, errorSubskill }) {
  const data = load();
  if (!data[conceptId]) data[conceptId] = createEmpty(conceptId);
  const entry = data[conceptId];

  entry.attempts += 1;
  if (correct) {
    entry.correct += 1;
    entry.streak += 1;
    if (entry.streak > entry.bestStreak) entry.bestStreak = entry.streak;
  } else {
    entry.streak = 0;
    if (errorSubskill) {
      entry.errorTypes[errorSubskill] = (entry.errorTypes[errorSubskill] || 0) + 1;
    }
  }
  entry.totalTime += (time || 0);
  entry.lastSeen = new Date().toISOString();
  entry.lastScore = entry.attempts > 0 ? entry.correct / entry.attempts : 0;

  // Keep rolling history (last N entries)
  entry.history.push({
    date: new Date().toISOString(),
    correct,
    time: time || 0,
    gameId: gameId || 'unknown',
  });
  if (entry.history.length > MAX_HISTORY) {
    entry.history = entry.history.slice(-MAX_HISTORY);
  }

  save(data);
  return entry;
}

/** Record a batch of results (e.g., from a 3-question sprint) */
export function recordBatch(results) {
  for (const r of results) {
    recordResult(r.conceptId, r);
  }
}

/** Get accuracy (0–100) for a concept */
export function getAccuracy(conceptId) {
  const stats = getConceptStats(conceptId);
  if (stats.attempts === 0) return null;
  return Math.round((stats.correct / stats.attempts) * 100);
}

/** Get average time for a concept */
export function getAvgTime(conceptId) {
  const stats = getConceptStats(conceptId);
  if (stats.attempts === 0) return null;
  return +(stats.totalTime / stats.attempts).toFixed(1);
}

/** Get mastery level: 'not-started' | 'struggling' | 'developing' | 'proficient' | 'mastered' */
export function getMasteryLevel(conceptId) {
  const stats = getConceptStats(conceptId);
  if (stats.attempts === 0) return 'not-started';
  const acc = (stats.correct / stats.attempts) * 100;
  if (acc < 40) return 'struggling';
  if (acc < 65) return 'developing';
  if (acc < 85) return 'proficient';
  return 'mastered';
}

export const MASTERY_COLORS = {
  'not-started': '#e2e8f0',
  struggling: '#ef4444',
  developing: '#f59e0b',
  proficient: '#3b82f6',
  mastered: '#22c55e',
};

export const MASTERY_LABELS = {
  'not-started': 'Not Started',
  struggling: 'Struggling',
  developing: 'Developing',
  proficient: 'Proficient',
  mastered: 'Mastered',
};

/** Get recommended concepts to practice (weak or stale, sorted by priority) */
export function getRecommendations(conceptIds, limit = 5) {
  const data = load();
  const scored = conceptIds.map((id) => {
    const stats = data[id] || createEmpty(id);
    const acc = stats.attempts > 0 ? stats.correct / stats.attempts : 0;
    const daysSinceSeen = stats.lastSeen
      ? (Date.now() - new Date(stats.lastSeen).getTime()) / 86400000
      : 999;
    // Priority score: lower accuracy + longer since seen = higher priority
    // Not-started concepts also get high priority
    const priority = stats.attempts === 0
      ? 100
      : (1 - acc) * 60 + Math.min(daysSinceSeen, 30) * 1.3;
    return { conceptId: id, priority, accuracy: Math.round(acc * 100), attempts: stats.attempts, daysSinceSeen: Math.round(daysSinceSeen) };
  });
  scored.sort((a, b) => b.priority - a.priority);
  return scored.slice(0, limit);
}

/** Get top N weakest concepts from a list */
export function getWeakestConcepts(conceptIds, limit = 5) {
  const data = load();
  const withData = conceptIds
    .map((id) => {
      const stats = data[id] || createEmpty(id);
      if (stats.attempts === 0) return null;
      return { conceptId: id, accuracy: Math.round((stats.correct / stats.attempts) * 100), attempts: stats.attempts };
    })
    .filter(Boolean);
  withData.sort((a, b) => a.accuracy - b.accuracy);
  return withData.slice(0, limit);
}

/** Clear all tracking data */
export function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Prerequisite-aware unlock check ──────────────────────────
import { getPrerequisites } from '../data/taxonomy';

/**
 * A concept is unlocked when ALL prerequisites are at least 'proficient' (65%+).
 * Concepts with no prerequisites are always unlocked.
 */
export function isConceptUnlocked(conceptId) {
  const prereqs = getPrerequisites(conceptId);
  if (prereqs.length === 0) return true;
  return prereqs.every((pid) => {
    const level = getMasteryLevel(pid);
    return level === 'mastered' || level === 'proficient';
  });
}

/** Get prerequisite status detail for a concept */
export function getPrerequisiteStatus(conceptId) {
  const prereqs = getPrerequisites(conceptId);
  if (prereqs.length === 0) return { unlocked: true, prereqs: [], met: 0, total: 0 };
  const detail = prereqs.map((pid) => {
    const level = getMasteryLevel(pid);
    const met = level === 'mastered' || level === 'proficient';
    return { conceptId: pid, level, met };
  });
  const met = detail.filter((d) => d.met).length;
  return { unlocked: met === prereqs.length, prereqs: detail, met, total: prereqs.length };
}

// ─── Cross-class student portfolio ────────────────────────────
const PORTFOLIO_KEY = 'allen-ace-student-portfolio';

export function getStudentPortfolio() {
  try {
    const raw = localStorage.getItem(PORTFOLIO_KEY);
    return raw ? JSON.parse(raw) : { classes: [], totalXP: 0, globalMastery: {}, lastUpdated: null };
  } catch { return { classes: [], totalXP: 0, globalMastery: {}, lastUpdated: null }; }
}

export function updateStudentPortfolio(classId, className, gradeId, stats) {
  const portfolio = getStudentPortfolio();
  const existing = portfolio.classes.find((c) => c.classId === classId);
  const entry = {
    classId, className, gradeId,
    masteredCount: stats.masteredCount || 0,
    totalConcepts: stats.totalConcepts || 0,
    accuracy: stats.overallAccuracy || 0,
    totalAttempts: stats.totalAttempts || 0,
    lastActive: new Date().toISOString(),
  };
  if (existing) Object.assign(existing, entry);
  else portfolio.classes.push(entry);
  portfolio.totalXP = portfolio.classes.reduce((s, c) => s + c.totalAttempts + c.masteredCount * 15, 0);
  portfolio.lastUpdated = new Date().toISOString();
  const allData = load();
  for (const [cid, cStats] of Object.entries(allData)) {
    const level = getMasteryLevel(cid);
    portfolio.globalMastery[cid] = { level, accuracy: cStats.attempts > 0 ? Math.round((cStats.correct / cStats.attempts) * 100) : 0 };
  }
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio));
  return portfolio;
}

// ─── Velocity tracking (concepts mastered per week) ───────────
export function getLearningVelocity(allConcepts) {
  const data = load();
  const now = Date.now();
  const weekMs = 7 * 86400000;
  const weeks = [0, 0, 0, 0]; // last 4 weeks
  for (const concept of allConcepts) {
    const stats = data[concept.conceptId];
    if (!stats || stats.attempts === 0) continue;
    const acc = (stats.correct / stats.attempts) * 100;
    if (acc < 85) continue; // only count mastered
    const lastSeen = stats.lastSeen ? new Date(stats.lastSeen).getTime() : 0;
    const weeksAgo = Math.floor((now - lastSeen) / weekMs);
    if (weeksAgo < 4) weeks[weeksAgo]++;
  }
  const currentWeek = weeks[0];
  const prevWeek = weeks[1];
  const avgPrev = (weeks[1] + weeks[2] + weeks[3]) / 3;
  let trend = 'steady';
  if (currentWeek > avgPrev * 1.3) trend = 'accelerating';
  else if (currentWeek < avgPrev * 0.7 && avgPrev > 0) trend = 'slowing';
  return { weeks, currentWeek, prevWeek, avgPrev: Math.round(avgPrev * 10) / 10, trend };
}

// ─── Spaced repetition recommendations ────────────────────────
export function getSpacedRepetitionQueue(conceptIds, limit = 5) {
  const data = load();
  const now = Date.now();
  const scored = conceptIds.map((id) => {
    const stats = data[id] || createEmpty(id);
    if (stats.attempts === 0) return null;
    const acc = stats.correct / stats.attempts;
    const daysSince = stats.lastSeen ? (now - new Date(stats.lastSeen).getTime()) / 86400000 : 999;
    // Spaced repetition: mastered concepts need review after longer intervals
    const level = getMasteryLevel(id);
    const idealInterval = level === 'mastered' ? 7 : level === 'proficient' ? 3 : level === 'developing' ? 1 : 0.5;
    const overdue = daysSince / idealInterval;
    if (overdue < 0.8) return null; // not due yet
    return { conceptId: id, overdue, daysSince: Math.round(daysSince), level, accuracy: Math.round(acc * 100) };
  }).filter(Boolean);
  scored.sort((a, b) => b.overdue - a.overdue);
  return scored.slice(0, limit);
}

/**
 * Enhanced adaptive pacing engine
 * Factors: velocity trend, accuracy trajectory, spaced repetition needs,
 * mastery rate, session frequency, and streak.
 */
export function getPacingSuggestion(stats) {
  const { totalAttempts, overallAccuracy, masteredCount, totalConcepts, activeDays } = stats || {};
  const daysActive = activeDays?.size || 0;
  const masteryRate = totalConcepts > 0 ? (masteredCount || 0) / totalConcepts : 0;

  if (totalAttempts < 5) return {
    pace: 'start', label: 'Get started', color: '#64748b',
    tip: 'Try your first practice to begin your path.',
    weeklyGoal: 3, suggestedMinutes: 10,
  };

  // Compute accuracy trajectory from recent history
  const allData = load();
  let recentCorrect = 0, recentTotal = 0;
  for (const stats of Object.values(allData)) {
    const recent = (stats.history || []).slice(-5);
    for (const h of recent) { recentTotal++; if (h.correct) recentCorrect++; }
  }
  const recentAcc = recentTotal > 0 ? (recentCorrect / recentTotal) * 100 : overallAccuracy;
  const accTrend = recentAcc - overallAccuracy;

  if (daysActive < 2 && totalAttempts < 20) return {
    pace: 'slow', label: 'Build momentum', color: '#f59e0b',
    tip: 'A few more sessions will help build your foundation.',
    weeklyGoal: 3, suggestedMinutes: 15, accTrend,
  };
  if (overallAccuracy < 50 && totalAttempts > 10) return {
    pace: 'slow', label: 'Take your time', color: '#f59e0b',
    tip: 'Focus on fewer concepts until you feel confident.',
    weeklyGoal: 4, suggestedMinutes: 20, accTrend,
  };
  if (masteryRate > 0.6 && daysActive >= 5) return {
    pace: 'fast', label: 'Crushing it', color: '#22c55e',
    tip: accTrend > 5 ? 'Your accuracy is climbing — keep this energy!' : 'You\'re progressing well! Keep going.',
    weeklyGoal: 5, suggestedMinutes: 15, accTrend,
  };
  if (overallAccuracy >= 80) return {
    pace: 'fast', label: 'Ready for more', color: '#22c55e',
    tip: 'You\'re ready to tackle new, harder concepts.',
    weeklyGoal: 5, suggestedMinutes: 20, accTrend,
  };
  if (accTrend > 10) return {
    pace: 'accelerating', label: 'Picking up speed', color: '#06b6d4',
    tip: 'Your recent accuracy is improving fast. Ride the wave!',
    weeklyGoal: 4, suggestedMinutes: 20, accTrend,
  };
  if (accTrend < -10 && totalAttempts > 20) return {
    pace: 'slow', label: 'Slow & steady', color: '#f59e0b',
    tip: 'Recent accuracy dipped. Review earlier concepts before pushing forward.',
    weeklyGoal: 3, suggestedMinutes: 15, accTrend,
  };

  return {
    pace: 'steady', label: 'Steady progress', color: '#3b82f6',
    tip: 'Keep practicing with one target skill at a time, then verify each answer step-by-step.',
    weeklyGoal: 4, suggestedMinutes: 15, accTrend,
  };
}

function createEmpty(conceptId) {
  return {
    conceptId,
    attempts: 0,
    correct: 0,
    totalTime: 0,
    streak: 0,
    bestStreak: 0,
    lastSeen: null,
    lastScore: 0,
    errorTypes: {},
    history: [],
  };
}
