/**
 * Deep Gamification Engine — XP, achievements, streaks, leaderboards,
 * skill tree progression, and peer competitions.
 */

const GAMIFICATION_KEY = 'allen-ace-gamification';

// ─── XP Sources & Multipliers ────────────────────────────────────
export const XP_REWARDS = {
  questionCorrect: 3,
  questionAttempted: 1,
  conceptMastered: 50,
  conceptProficient: 25,
  gameCompleted: 10,
  gamePerfectScore: 30,
  discussionReply: 5,
  exitTicketSubmit: 5,
  dailyLogin: 10,
  streakBonus3: 15,
  streakBonus7: 50,
  streakBonus14: 100,
  streakBonus30: 250,
  challengeCompleted: 20,
  challengePerfect: 50,
  firstOfDay: 5,
  helpedPeer: 10,
};

export const XP_LEVELS = [
  0, 30, 80, 160, 280, 450, 680, 980, 1350, 1800,
  2350, 3000, 3800, 4700, 5800, 7100, 8600, 10400, 12500, 15000,
];

export const LEVEL_TITLES = [
  'Novice', 'Learner', 'Explorer', 'Apprentice', 'Scholar',
  'Thinker', 'Strategist', 'Expert', 'Champion', 'Legend',
  'Grandmaster', 'Sage', 'Virtuoso', 'Luminary', 'Titan',
  'Prodigy', 'Paragon', 'Mythic', 'Immortal', 'Transcendent',
];

export const LEVEL_COLORS = [
  '#94a3b8', '#64748b', '#22c55e', '#16a34a', '#0ea5e9',
  '#2563eb', '#7c3aed', '#a855f7', '#ec4899', '#ef4444',
  '#f59e0b', '#d97706', '#dc2626', '#be185d', '#9333ea',
  '#4f46e5', '#0891b2', '#059669', '#b91c1c', '#d4af37',
];

// ─── Achievement Definitions (40+ achievements) ──────────────────
export const ACHIEVEMENTS = [
  // Progress milestones
  { id: 'first-steps', icon: '\uD83D\uDC63', label: 'First Steps', desc: 'Answer your first question', xp: 5, tier: 'bronze', check: (s) => s.totalAttempts >= 1 },
  { id: 'getting-started', icon: '\uD83C\uDF31', label: 'Getting Started', desc: 'Answer 10 questions', xp: 10, tier: 'bronze', check: (s) => s.totalAttempts >= 10 },
  { id: 'practice-pro', icon: '\uD83D\uDCAA', label: 'Practice Pro', desc: 'Answer 50 questions', xp: 25, tier: 'silver', check: (s) => s.totalAttempts >= 50 },
  { id: 'math-machine', icon: '\uD83E\uDD16', label: 'Math Machine', desc: 'Answer 100 questions', xp: 50, tier: 'gold', check: (s) => s.totalAttempts >= 100 },
  { id: 'legend-500', icon: '\uD83C\uDFC6', label: 'Legend', desc: 'Answer 500 questions', xp: 150, tier: 'platinum', check: (s) => s.totalAttempts >= 500 },

  // Accuracy
  { id: 'sharp-shooter', icon: '\uD83C\uDFAF', label: 'Sharp Shooter', desc: '80%+ accuracy on any concept', xp: 20, tier: 'silver', check: (s) => s.hasHighAccuracy },
  { id: 'sniper', icon: '\uD83D\uDD2B', label: 'Sniper', desc: '90%+ overall accuracy (50+ Qs)', xp: 75, tier: 'gold', check: (s) => s.totalAttempts >= 50 && s.overallAccuracy >= 90 },

  // Mastery
  { id: 'perfectionist', icon: '\uD83D\uDC8E', label: 'Perfectionist', desc: 'Master a concept', xp: 30, tier: 'silver', check: (s) => s.masteredCount >= 1 },
  { id: 'triple-crown', icon: '\uD83D\uDC51', label: 'Triple Crown', desc: 'Master 3 concepts', xp: 50, tier: 'gold', check: (s) => s.masteredCount >= 3 },
  { id: 'master-five', icon: '\u2B50', label: 'Star Student', desc: 'Master 5 concepts', xp: 80, tier: 'gold', check: (s) => s.masteredCount >= 5 },
  { id: 'master-ten', icon: '\uD83C\uDF1F', label: 'Domain Expert', desc: 'Master 10 concepts', xp: 200, tier: 'platinum', check: (s) => s.masteredCount >= 10 },

  // Exploration
  { id: 'explorer', icon: '\uD83D\uDDFA\uFE0F', label: 'Explorer', desc: 'Try 5 different concepts', xp: 15, tier: 'bronze', check: (s) => s.conceptsTried >= 5 },
  { id: 'adventurer', icon: '\u26F0\uFE0F', label: 'Adventurer', desc: 'Try 10 different concepts', xp: 30, tier: 'silver', check: (s) => s.conceptsTried >= 10 },
  { id: 'well-rounded', icon: '\uD83C\uDF1F', label: 'Well Rounded', desc: 'Try 3 different domains', xp: 25, tier: 'silver', check: (s) => s.domainsTried >= 3 },

  // Streaks
  { id: 'streak-3', icon: '\uD83D\uDD25', label: 'On Fire', desc: '3-day activity streak', xp: 15, tier: 'bronze', check: (s) => s.currentStreak >= 3 },
  { id: 'streak-7', icon: '\uD83D\uDD25', label: 'Week Warrior', desc: '7-day activity streak', xp: 50, tier: 'silver', check: (s) => s.currentStreak >= 7 },
  { id: 'streak-14', icon: '\u2604\uFE0F', label: 'Fortnight Force', desc: '14-day activity streak', xp: 100, tier: 'gold', check: (s) => s.currentStreak >= 14 },
  { id: 'streak-30', icon: '\uD83D\uDCA5', label: 'Monthly Monster', desc: '30-day activity streak', xp: 250, tier: 'platinum', check: (s) => s.currentStreak >= 30 },

  // Best streaks (in-game consecutive correct)
  { id: 'hot-hand-5', icon: '\u270B', label: 'Hot Hand', desc: '5 correct in a row', xp: 15, tier: 'bronze', check: (s) => s.bestStreak >= 5 },
  { id: 'unstoppable', icon: '\u26A1', label: 'Unstoppable', desc: '10 correct in a row', xp: 40, tier: 'silver', check: (s) => s.bestStreak >= 10 },
  { id: 'perfect-chain', icon: '\u26D3\uFE0F', label: 'Perfect Chain', desc: '20 correct in a row', xp: 100, tier: 'gold', check: (s) => s.bestStreak >= 20 },

  // Correct answers
  { id: 'centurion', icon: '\uD83C\uDFDB\uFE0F', label: 'Centurion', desc: '100 correct answers', xp: 60, tier: 'silver', check: (s) => s.totalCorrect >= 100 },
  { id: 'half-thousand', icon: '\uD83D\uDE80', label: 'Rocket Scholar', desc: '500 correct answers', xp: 200, tier: 'platinum', check: (s) => s.totalCorrect >= 500 },

  // Games
  { id: 'gamer', icon: '\uD83C\uDFAE', label: 'Gamer', desc: 'Complete 5 games', xp: 15, tier: 'bronze', check: (s) => s.gamesCompleted >= 5 },
  { id: 'game-master', icon: '\uD83D\uDC7E', label: 'Game Master', desc: 'Complete 25 games', xp: 50, tier: 'silver', check: (s) => s.gamesCompleted >= 25 },
  { id: 'arcade-king', icon: '\uD83C\uDFC5', label: 'Arcade Royalty', desc: 'Complete 100 games', xp: 150, tier: 'gold', check: (s) => s.gamesCompleted >= 100 },

  // Social
  { id: 'class-joiner', icon: '\uD83C\uDFEB', label: 'Class Joiner', desc: 'Join a class', xp: 5, tier: 'bronze', check: (s) => s.hasClass },
  { id: 'voice-heard', icon: '\uD83D\uDDE3\uFE0F', label: 'Voice Heard', desc: 'Reply to a discussion', xp: 10, tier: 'bronze', check: (s) => s.discussionReplies >= 1 },
  { id: 'debater', icon: '\uD83D\uDCAC', label: 'Debater', desc: '10 discussion replies', xp: 30, tier: 'silver', check: (s) => s.discussionReplies >= 10 },

  // Challenges
  { id: 'challenger', icon: '\uD83C\uDFF4', label: 'Challenger', desc: 'Complete an AI challenge', xp: 20, tier: 'silver', check: (s) => s.challengesCompleted >= 1 },
  { id: 'challenge-master', icon: '\uD83E\uDDB8', label: 'Challenge Master', desc: 'Complete 10 AI challenges', xp: 100, tier: 'gold', check: (s) => s.challengesCompleted >= 10 },
];

export const TIER_COLORS = {
  bronze: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  silver: { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' },
  gold: { bg: '#fffbeb', text: '#d97706', border: '#fcd34d' },
  platinum: { bg: '#f5f3ff', text: '#7c3aed', border: '#c4b5fd' },
};

// ─── Storage ─────────────────────────────────────────────────────
function loadGamification() {
  try { return JSON.parse(localStorage.getItem(GAMIFICATION_KEY) || '{}'); } catch { return {}; }
}
function saveGamification(data) {
  localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(data));
}

function getPlayerData(studentId) {
  const all = loadGamification();
  if (!all[studentId]) {
    all[studentId] = {
      xp: 0,
      earnedAchievements: [],
      dailyStreak: 0,
      lastActiveDate: null,
      streakFreezeAvailable: false,
      challengesCompleted: 0,
      challengeHistory: [],
      weeklyXP: {},
      xpLog: [],
    };
    saveGamification(all);
  }
  return all[studentId];
}

function savePlayerData(studentId, data) {
  const all = loadGamification();
  all[studentId] = data;
  saveGamification(all);
}

// ─── XP Engine ───────────────────────────────────────────────────
export function awardXP(studentId, source, amount) {
  const player = getPlayerData(studentId);
  const reward = amount || XP_REWARDS[source] || 0;
  player.xp += reward;

  const weekKey = getWeekKey();
  player.weeklyXP[weekKey] = (player.weeklyXP[weekKey] || 0) + reward;

  player.xpLog.push({ source, amount: reward, date: new Date().toISOString() });
  if (player.xpLog.length > 200) player.xpLog = player.xpLog.slice(-200);

  savePlayerData(studentId, player);
  return { xp: player.xp, reward };
}

export function getPlayerXP(studentId) {
  return getPlayerData(studentId).xp;
}

export function getLevel(xp) {
  let level = 0;
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i]) { level = i; break; }
  }
  const current = XP_LEVELS[level] || 0;
  const next = XP_LEVELS[level + 1] || XP_LEVELS[level] + 2000;
  const progress = next > current ? ((xp - current) / (next - current)) * 100 : 100;
  return {
    level, title: LEVEL_TITLES[level] || 'Transcendent',
    xp, nextXp: next, progress: Math.min(progress, 100),
    color: LEVEL_COLORS[level] || '#d4af37',
  };
}

// ─── Streak Engine ───────────────────────────────────────────────
export function recordDailyLogin(studentId) {
  const player = getPlayerData(studentId);
  const today = new Date().toISOString().split('T')[0];

  if (player.lastActiveDate === today) return player.dailyStreak;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (player.lastActiveDate === yesterday) {
    player.dailyStreak += 1;
  } else if (player.lastActiveDate !== today) {
    player.dailyStreak = 1;
  }

  player.lastActiveDate = today;

  // Streak bonuses
  if (player.dailyStreak === 3) awardXP(studentId, 'streakBonus3');
  if (player.dailyStreak === 7) awardXP(studentId, 'streakBonus7');
  if (player.dailyStreak === 14) awardXP(studentId, 'streakBonus14');
  if (player.dailyStreak === 30) awardXP(studentId, 'streakBonus30');

  awardXP(studentId, 'dailyLogin');
  savePlayerData(studentId, player);
  return player.dailyStreak;
}

export function getDailyStreak(studentId) {
  const player = getPlayerData(studentId);
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (player.lastActiveDate !== today && player.lastActiveDate !== yesterday) return 0;
  return player.dailyStreak;
}

// ─── Achievement Engine ──────────────────────────────────────────
export function checkAndUnlockAchievements(studentId, stats) {
  const player = getPlayerData(studentId);
  const earned = new Set(player.earnedAchievements || []);
  const newlyUnlocked = [];

  for (const ach of ACHIEVEMENTS) {
    if (earned.has(ach.id)) continue;
    if (ach.check(stats)) {
      earned.add(ach.id);
      newlyUnlocked.push(ach);
      player.xp += ach.xp || 0;
    }
  }

  player.earnedAchievements = [...earned];
  savePlayerData(studentId, player);
  return newlyUnlocked;
}

export function getEarnedAchievements(studentId) {
  return new Set(getPlayerData(studentId).earnedAchievements || []);
}

// ─── Leaderboard ─────────────────────────────────────────────────
export function getClassLeaderboard(classId) {
  const allData = loadGamification();
  const classes = JSON.parse(localStorage.getItem('allen-ace-classes') || '[]');
  const cls = classes.find((c) => c.id === classId);
  if (!cls) return [];

  return (cls.students || []).map((s) => {
    const player = allData[s.id] || { xp: 0, dailyStreak: 0, earnedAchievements: [] };
    const levelInfo = getLevel(player.xp);
    return {
      ...s,
      xp: player.xp,
      level: levelInfo.level,
      title: levelInfo.title,
      color: levelInfo.color,
      streak: player.dailyStreak || 0,
      achievements: (player.earnedAchievements || []).length,
    };
  }).sort((a, b) => b.xp - a.xp);
}

export function getWeeklyLeaderboard(classId) {
  const allData = loadGamification();
  const classes = JSON.parse(localStorage.getItem('allen-ace-classes') || '[]');
  const cls = classes.find((c) => c.id === classId);
  if (!cls) return [];
  const weekKey = getWeekKey();

  return (cls.students || []).map((s) => {
    const player = allData[s.id] || { weeklyXP: {} };
    return { ...s, weeklyXP: (player.weeklyXP || {})[weekKey] || 0 };
  }).sort((a, b) => b.weeklyXP - a.weeklyXP);
}

// ─── AI Challenge Tracking ───────────────────────────────────────
export function recordChallenge(studentId, challenge) {
  const player = getPlayerData(studentId);
  player.challengesCompleted = (player.challengesCompleted || 0) + 1;
  player.challengeHistory = player.challengeHistory || [];
  player.challengeHistory.push({ ...challenge, date: new Date().toISOString() });
  if (player.challengeHistory.length > 50) player.challengeHistory = player.challengeHistory.slice(-50);
  savePlayerData(studentId, player);
}

export function getChallengeCount(studentId) {
  return getPlayerData(studentId).challengesCompleted || 0;
}

// ─── Skill Tree XP Gates ────────────────────────────────────────
export function getSkillTreeProgress(studentId) {
  const player = getPlayerData(studentId);
  const levelInfo = getLevel(player.xp);
  return {
    xp: player.xp,
    level: levelInfo.level,
    unlockedTiers: Math.min(Math.floor(levelInfo.level / 2) + 1, 5),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────
function getWeekKey() {
  const now = new Date();
  const onejan = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - onejan) / 86400000 + onejan.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
}
