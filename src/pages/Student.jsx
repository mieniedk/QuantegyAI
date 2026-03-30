import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getClasses, getAssignments, getClassByCode, addStudentToClass, saveAssignments, getStudentResults, findMatchingAssignment, getClassDiscussions, checkAndIssueCertificate, getCertificates } from '../utils/storage';
import { getAllConcepts, getGamesForConcept, getTeksForConcept, DOMAINS } from '../data/taxonomy';
import { getRecommendations, getMasteryLevel, MASTERY_COLORS, MASTERY_LABELS, getAllConceptStats, getAccuracy, getPacingSuggestion, isConceptUnlocked, getPrerequisiteStatus, getSpacedRepetitionQueue, getLearningVelocity, updateStudentPortfolio, getStudentPortfolio } from '../utils/conceptTracker';
import ConceptPicker from '../components/ConceptPicker';
import { GAMES_CATALOG } from '../data/games';
import { getBankedTeks, queryBank } from '../data/testBank';
import MiniLesson from '../components/MiniLesson';
import { getLecture } from '../data/lectures';
import ClassFeed from '../components/ClassFeed';
import VideoStudio from './VideoStudio';
import ContentModules from '../components/ContentModules';
import LiveGamePlayer from '../components/LiveGamePlayer';
import ClassChat from '../components/ClassChat';
import VideoMeet from '../components/VideoMeet';
import ConceptMap from './ConceptMap';
import CollaborativeSpaces from '../components/CollaborativeSpaces';
import SkillGraph from '../components/SkillGraph';
import GamificationHub from '../components/GamificationHub';
import AITutor from '../components/AITutor';
import StudentAgent from '../components/StudentAgent';
import { awardXP as gamificationAwardXP } from '../utils/gamification';
import LearningPath from '../components/LearningPath';
import CrossCompetencyDashboard from '../components/CrossCompetencyDashboard';
import { trackPageView } from '../utils/activityTracker';
import { getExamLabel } from '../data/texesExams';

const SESSION_KEY = 'quantegy-student-session';

/** Default practice-loop query for self-study (no teacher class). */
function getSelfStudyPracticePaths(examId) {
  const id = examId === 'math48' ? 'math48' : 'math712';
  if (id === 'math48') {
    const q = 'examId=math48&comp=comp48_1&currentStd=m48_c001&grade=grade4-8&subject=math';
    return { preview: `/practice-loop?${q}`, paywall: `/practice-loop?${q}&phase=paywall` };
  }
  const q = 'examId=math712&comp=comp002&currentStd=c004&grade=grade7-12&subject=math';
  return { preview: `/practice-loop?${q}`, paywall: `/practice-loop?${q}&phase=paywall` };
}

// ─── Ensure assignment records exist for games on a class ─────
function ensureAssignmentRecords(cls) {
  if (!cls?.games?.length) return;
  let allAssignments = getAssignments();
  let dirty = false;

  // Patch any existing assignments that are missing gamePath or name
  allAssignments = allAssignments.map((a) => {
    if (a.classId !== cls.id) return a;
    if (a.gamePath && a.name) return a;
    const game = GAMES_CATALOG.find((g) => g.id === a.gameId);
    if (!game) return a;
    dirty = true;
    return { ...a, gamePath: a.gamePath || game.path, name: a.name || game.name };
  });

  const classAssignments = allAssignments.filter((a) => a.classId === cls.id);
  const missingGameIds = cls.games.filter(
    (gid) => !classAssignments.some((a) => a.gameId === gid)
  );
  const newAssignments = missingGameIds.map((gameId, idx) => {
    const game = GAMES_CATALOG.find((g) => g.id === gameId);
    if (!game) return null;
    return {
      id: `a-backfill-${Date.now()}-${idx}`,
      name: game.name,
      classId: cls.id,
      gameId: game.id,
      gamePath: game.path,
      teks: game.teksByGrade?.[cls.gradeId] || [],
      focusTeks: null,
    };
  }).filter(Boolean);
  if (newAssignments.length > 0 || dirty) {
    saveAssignments([...allAssignments, ...newAssignments]);
  }
}

// ─── XP & Level System ───────────────────────────────────────
const XP_LEVELS = [0, 15, 40, 80, 140, 220, 320, 440, 580, 750, 950];
const LEVEL_TITLES = [
  'Beginner', 'Learner', 'Explorer', 'Apprentice', 'Scholar',
  'Thinker', 'Strategist', 'Expert', 'Champion', 'Legend', 'Grandmaster',
];

function computeXP(stats) {
  return stats.totalAttempts + stats.totalCorrect * 2 + stats.masteredCount * 15;
}

function getLevel(xp) {
  let level = 0;
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i]) { level = i; break; }
  }
  const current = XP_LEVELS[level] || 0;
  const next = XP_LEVELS[level + 1] || XP_LEVELS[level] + 200;
  const progress = next > current ? ((xp - current) / (next - current)) * 100 : 100;
  return { level, title: LEVEL_TITLES[level] || 'Grandmaster', xp, nextXp: next, progress: Math.min(progress, 100) };
}

// ─── Achievement Definitions ──────────────────────────────────
const ACHIEVEMENTS = [
  { id: 'first-steps', icon: '👣', label: 'First Steps', desc: 'Answer your first question', check: (s) => s.totalAttempts >= 1 },
  { id: 'getting-started', icon: '🌱', label: 'Getting Started', desc: 'Answer 10 questions', check: (s) => s.totalAttempts >= 10 },
  { id: 'practice-pro', icon: '💪', label: 'Practice Pro', desc: 'Answer 50 questions', check: (s) => s.totalAttempts >= 50 },
  { id: 'math-machine', icon: '🤖', label: 'Math Machine', desc: 'Answer 100 questions', check: (s) => s.totalAttempts >= 100 },
  { id: 'sharp-shooter', icon: '🎯', label: 'Sharp Shooter', desc: '80%+ accuracy on a concept', check: (s) => s.hasHighAccuracy },
  { id: 'perfectionist', icon: '💎', label: 'Perfectionist', desc: 'Master a concept (85%+)', check: (s) => s.masteredCount >= 1 },
  { id: 'triple-crown', icon: '👑', label: 'Triple Crown', desc: 'Master 3 concepts', check: (s) => s.masteredCount >= 3 },
  { id: 'explorer', icon: '🗺️', label: 'Explorer', desc: 'Try 5 different concepts', check: (s) => s.conceptsTried >= 5 },
  { id: 'streak-fire', icon: '🔥', label: 'On Fire', desc: 'Best streak of 5+', check: (s) => s.bestStreak >= 5 },
  { id: 'unstoppable', icon: '⚡', label: 'Unstoppable', desc: 'Best streak of 10+', check: (s) => s.bestStreak >= 10 },
  { id: 'well-rounded', icon: '🌟', label: 'Well Rounded', desc: 'Try 3 different domains', check: (s) => s.domainsTried >= 3 },
  { id: 'centurion', icon: '🏛️', label: 'Centurion', desc: '100+ correct answers', check: (s) => s.totalCorrect >= 100 },
];

// ─── Compute dashboard stats from concept tracker ─────────────
function computeStats(allConcepts, gradeId) {
  const allStats = getAllConceptStats();
  let totalAttempts = 0;
  let totalCorrect = 0;
  let bestStreak = 0;
  let conceptsTried = 0;
  let masteredCount = 0;
  let proficientCount = 0;
  let developingCount = 0;
  let strugglingCount = 0;
  let hasHighAccuracy = false;
  const activeDays = new Set();
  const domainsTried = new Set();

  for (const concept of allConcepts) {
    const stats = allStats[concept.conceptId];
    if (!stats || stats.attempts === 0) continue;

    conceptsTried++;
    totalAttempts += stats.attempts;
    totalCorrect += stats.correct;
    if (stats.bestStreak > bestStreak) bestStreak = stats.bestStreak;

    const acc = (stats.correct / stats.attempts) * 100;
    if (acc >= 80) hasHighAccuracy = true;

    const level = getMasteryLevel(concept.conceptId);
    if (level === 'mastered') masteredCount++;
    else if (level === 'proficient') proficientCount++;
    else if (level === 'developing') developingCount++;
    else if (level === 'struggling') strugglingCount++;

    if (concept.domainId) domainsTried.add(concept.domainId);

    for (const h of stats.history || []) {
      if (h.date) activeDays.add(new Date(h.date).toDateString());
    }
  }

  return {
    totalAttempts, totalCorrect,
    overallAccuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
    bestStreak, conceptsTried, masteredCount, proficientCount,
    developingCount, strugglingCount, hasHighAccuracy,
    activeDays, domainsTried: domainsTried.size,
    totalConcepts: allConcepts.length,
  };
}

// ─── Activity heatmap for last 14 days ────────────────────────
function getActivityDays(activeDaysSet) {
  const days = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({
      date: d,
      label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      dayNum: d.getDate(),
      active: activeDaysSet.has(d.toDateString()),
      isToday: i === 0,
    });
  }
  return days;
}

function getCurrentStreak(activeDaysSet) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (activeDaysSet.has(d.toDateString())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

// ─── Mastery grid by domain ───────────────────────────────────
function getMasteryByDomain(allConcepts) {
  const grouped = {};
  for (const c of allConcepts) {
    const domain = c.domainId || 'other';
    if (!grouped[domain]) grouped[domain] = [];
    grouped[domain].push({
      ...c,
      mastery: getMasteryLevel(c.conceptId),
      accuracy: getAccuracy(c.conceptId),
    });
  }
  return grouped;
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

/** Stat card with icon, value, and label */
const StatCard = ({ icon, value, label, color, subtext }) => (
  <div style={{
    flex: '1 1 130px', minWidth: 120, padding: '18px 14px', background: '#fff',
    borderRadius: 16, textAlign: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9',
    transition: 'transform 0.15s, box-shadow 0.15s',
  }}>
    <div style={{ fontSize: 26, marginBottom: 4 }}>{icon}</div>
    <div style={{ fontSize: 28, fontWeight: 800, color: color || '#0f172a', lineHeight: 1.1 }}>{value}</div>
    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 2 }}>{label}</div>
    {subtext && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{subtext}</div>}
  </div>
);

/** XP level progress bar */
const LevelBar = ({ levelInfo }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 16px', background: 'rgba(255,255,255,0.15)',
    borderRadius: 12, marginTop: 12,
  }}>
    <div style={{
      width: 38, height: 38, borderRadius: '50%',
      background: 'linear-gradient(135deg, #f59e0b, #f97316)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: 16, color: '#fff',
      boxShadow: '0 2px 8px rgba(245,158,11,0.4)',
    }}>
      {levelInfo.level}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{levelInfo.title}</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{levelInfo.xp} / {levelInfo.nextXp} XP</span>
      </div>
      <div style={{
        height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${levelInfo.progress}%`,
          background: 'linear-gradient(90deg, #fbbf24, #f97316)',
          borderRadius: 3, transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  </div>
);

/** Activity heatmap strip */
const ActivityStreak = ({ activeDays, currentStreak }) => {
  const days = getActivityDays(activeDays);
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '18px 20px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Activity</h3>
        {currentStreak > 0 && (
          <span style={{
            padding: '3px 10px', background: '#fef3c7', borderRadius: 20,
            fontSize: 12, fontWeight: 700, color: '#d97706',
          }}>
            {currentStreak} day streak
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
        {days.map((day, i) => (
          <div key={i} style={{ textAlign: 'center', flex: '1 1 0' }}>
            <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 3, fontWeight: 600 }}>{day.label}</div>
            <div style={{
              width: '100%', maxWidth: 32, aspectRatio: '1', borderRadius: 6, margin: '0 auto',
              background: day.active
                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                : day.isToday ? '#e2e8f0' : '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: day.active ? 14 : 10, color: day.active ? '#fff' : '#cbd5e1',
              fontWeight: 700,
              border: day.isToday ? '2px solid #2563eb' : 'none',
              boxShadow: day.active ? '0 2px 6px rgba(34,197,94,0.3)' : 'none',
            }}>
              {day.active ? '✓' : day.dayNum}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Mastery grid showing all concepts by domain – with warm-up/practice popup */
const MasteryMap = ({ allConcepts, gradeId, onConceptClick, onWarmUp, onLearn }) => {
  const byDomain = getMasteryByDomain(allConcepts);
  const domains = DOMAINS[gradeId] || [];
  const [popup, setPopup] = useState(null); // concept clicked for popup

  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '18px 20px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9',
      position: 'relative',
    }}>
      <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
        Mastery Map
      </h3>
      {domains.map((domain) => {
        const concepts = byDomain[domain.id] || [];
        if (concepts.length === 0) return null;
        return (
          <div key={domain.id} style={{ marginBottom: 16 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
            }}>
              <span style={{ fontSize: 16 }}>{domain.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>{domain.label}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {concepts.map((c) => {
                const color = MASTERY_COLORS[c.mastery];
                const isActive = c.mastery !== 'not-started';
                const isPopup = popup?.conceptId === c.conceptId;
                return (
                  <div
                    key={c.conceptId}
                    onClick={() => setPopup(isPopup ? null : c)}
                    title={`${c.standardCode}: ${c.label}${c.accuracy !== null ? ` (${c.accuracy}%)` : ''}`}
                    style={{
                      padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                      background: isPopup ? '#eff6ff' : isActive ? color + '18' : '#f8fafc',
                      border: `1.5px solid ${isPopup ? '#2563eb' : isActive ? color : '#e2e8f0'}`,
                      transition: 'all 0.15s', minWidth: 56, textAlign: 'center',
                      position: 'relative',
                      boxShadow: isPopup ? '0 2px 8px rgba(37,99,235,0.2)' : 'none',
                    }}
                  >
                    <div style={{ fontSize: 10, fontWeight: 700, color: isActive ? color : '#94a3b8' }}>
                      {c.standardCode}
                    </div>
                    {isActive && (
                      <div style={{ fontSize: 12, fontWeight: 800, color, marginTop: 1 }}>
                        {c.accuracy}%
                      </div>
                    )}
                    {!isActive && (
                      <div style={{ fontSize: 9, color: '#cbd5e1', marginTop: 1 }}>new</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ── Concept action popup ── */}
      {popup && (
        <div style={{
          margin: '14px 0 0', padding: '16px 18px', borderRadius: 14,
          background: 'linear-gradient(135deg, #f8fafc, #eff6ff)',
          border: '2px solid #2563eb', animation: 'fadeInSlide 0.2s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <span style={{
                padding: '2px 8px', background: '#e8f0fe', color: '#1a5cba',
                borderRadius: 4, fontSize: 11, fontWeight: 700,
              }}>{popup.standardCode}</span>
              <h4 style={{ margin: '6px 0 2px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                {popup.label}
              </h4>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {popup.mastery !== 'not-started'
                  ? <span>Mastery: <strong style={{ color: MASTERY_COLORS[popup.mastery] }}>{MASTERY_LABELS[popup.mastery]}</strong> ({popup.accuracy}%)</span>
                  : <span>Not started yet</span>}
              </div>
            </div>
            <button type="button" onClick={(e) => { e.stopPropagation(); setPopup(null); }} aria-label="Close" style={{
              width: 28, height: 28, borderRadius: '50%', border: 'none',
              background: '#e2e8f0', cursor: 'pointer', fontWeight: 800, fontSize: 14,
              color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>×</button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {onLearn && getLecture(popup.standardCode) && (
              <button type="button" onClick={() => { setPopup(null); onLearn?.(popup); }}
                style={{
                  flex: '1 1 100%', padding: '10px 14px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(124,58,237,0.3)', marginBottom: 4,
                }}>
                📚 Learn This First
              </button>
            )}
            <button type="button" onClick={() => { setPopup(null); onWarmUp?.(popup); }}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
              }}>
              🔥 Warm-Up Quiz
            </button>
            <button type="button" onClick={() => { setPopup(null); onConceptClick?.(popup); }}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
              }}>
              🎮 Practice Game
            </button>
          </div>
        </div>
      )}

      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12,
        padding: '10px 0 0', borderTop: '1px solid #f1f5f9',
      }}>
        {Object.entries(MASTERY_LABELS).map(([key, label]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 10, height: 10, borderRadius: 3,
              background: MASTERY_COLORS[key],
              opacity: key === 'not-started' ? 0.5 : 1,
            }} />
            <span style={{ fontSize: 10, color: '#64748b' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Next best challenge CTA card */
const NextChallenge = ({ recommendation, allConcepts, onLaunch }) => {
  if (!recommendation) return null;
  const concept = allConcepts.find((c) => c.conceptId === recommendation.conceptId);
  if (!concept) return null;
  const level = getMasteryLevel(recommendation.conceptId);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
      borderRadius: 16, padding: '20px 22px', color: '#fff',
      boxShadow: '0 4px 16px rgba(37,99,235,0.25)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      flexWrap: 'wrap', gap: 14,
    }}>
      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
          opacity: 0.8, marginBottom: 4,
        }}>
          Next Best Challenge
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 3 }}>
          {concept.label}
        </div>
        <div style={{ fontSize: 13, opacity: 0.85 }}>
          {recommendation.attempts > 0
            ? `${recommendation.accuracy}% accuracy \u00B7 ${MASTERY_LABELS[level]} \u00B7 Keep going!`
            : "You haven't tried this one yet \u2014 let's go!"}
        </div>
        <span style={{
          display: 'inline-block', marginTop: 4,
          padding: '2px 8px', background: 'rgba(255,255,255,0.2)',
          borderRadius: 4, fontSize: 11, fontWeight: 600,
        }}>
          {concept.standardCode}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onLaunch(concept)}
        style={{
          padding: '14px 28px', background: '#fff', color: '#2563eb',
          border: 'none', borderRadius: 12, cursor: 'pointer',
          fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transition: 'transform 0.15s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        Start Practice
      </button>
    </div>
  );
};

/** Mastery donut summary */
const MasteryDonut = ({ stats }) => {
  const total = stats.totalConcepts;
  if (total === 0) return null;
  const segments = [
    { count: stats.masteredCount, color: MASTERY_COLORS.mastered, label: 'Mastered' },
    { count: stats.proficientCount, color: MASTERY_COLORS.proficient, label: 'Proficient' },
    { count: stats.developingCount, color: MASTERY_COLORS.developing, label: 'Developing' },
    { count: stats.strugglingCount, color: MASTERY_COLORS.struggling, label: 'Struggling' },
  ];
  const tried = stats.conceptsTried;
  const notStarted = total - tried;

  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '18px 20px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9',
    }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
        Overall Progress
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        {/* Stacked bar */}
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{
            display: 'flex', height: 18, borderRadius: 9, overflow: 'hidden',
            background: '#f1f5f9',
          }}>
            {segments.map((s) => s.count > 0 && (
              <div
                key={s.label}
                style={{
                  width: `${(s.count / total) * 100}%`,
                  background: s.color,
                  transition: 'width 0.5s ease',
                }}
                title={`${s.label}: ${s.count}`}
              />
            ))}
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginTop: 6,
            fontSize: 11, color: '#64748b',
          }}>
            <span>{tried} of {total} concepts started</span>
            <span>{stats.masteredCount} mastered</span>
          </div>
        </div>
        {/* Mastery percentage */}
        <div style={{ textAlign: 'center', minWidth: 70 }}>
          <div style={{
            fontSize: 32, fontWeight: 800,
            color: stats.masteredCount > 0 ? '#22c55e' : '#94a3b8',
            lineHeight: 1,
          }}>
            {total > 0 ? Math.round((stats.masteredCount / total) * 100) : 0}%
          </div>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>mastery</div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

const Student = () => {
  const { lang, setLang, t } = useLanguage();
  const [classCode, setClassCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [joinedClass, setJoinedClass] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const focusParam = searchParams.get('focus');
  const examIdParam = (searchParams.get('examId') || '').trim().toLowerCase();
  const selfStudyExamId = examIdParam === 'math48' || examIdParam === 'math712' ? examIdParam : 'math712';
  const focusTexesSelfStudy = focusParam === 'texes-signup';
  const [showTeacherClassJoin, setShowTeacherClassJoin] = useState(false);
  const tabParam = searchParams.get('tab');
  const validTabs = ['overview', 'skill-graph', 'feed', 'modules', 'chat', 'meet', 'studio', 'live', 'spaces', 'concept-map', 'progress', 'warmups', 'games', 'practice', 'awards', 'gamification', 'ai-tutor'];
  const [tab, setTabState] = useState(validTabs.includes(tabParam) ? tabParam : 'overview');
  const mainPanelRef = useRef(null);
  const texesSignupRef = useRef(null);
  const [highlightTexesSignup, setHighlightTexesSignup] = useState(false);
  const setTab = (newTab) => {
    setTabState(newTab);
    const next = new URLSearchParams(searchParams);
    next.set('tab', newTab);
    setSearchParams(next, { replace: true });
    mainPanelRef.current?.scrollTo?.({ top: 0, behavior: 'smooth' });
  };
  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam) && tabParam !== tab) setTabState(tabParam);
  }, [tabParam]);
  useEffect(() => {
    if (focusParam !== 'texes-signup') setShowTeacherClassJoin(false);
  }, [focusParam]);

  useEffect(() => {
    if (isJoined || focusParam !== 'texes-signup' || showTeacherClassJoin) return undefined;
    const scrollTimer = setTimeout(() => {
      texesSignupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightTexesSignup(true);
    }, 120);
    const clearHighlightTimer = setTimeout(() => setHighlightTexesSignup(false), 3600);
    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(clearHighlightTimer);
    };
  }, [isJoined, focusParam, showTeacherClassJoin]);
  const [joinError, setJoinError] = useState('');
  const [activeLecture, setActiveLecture] = useState(null);
  const [activeConceptCheck, setActiveConceptCheck] = useState(null); // Learn→Check→Game when no lecture
  const [lockedToast, setLockedToast] = useState(null);
  const navigate = useNavigate();

  // Restore session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const session = JSON.parse(saved);
        const classes = getClasses();
        const cls = classes.find((c) => c.id === session.classId);
        if (cls) {
          setJoinedClass(cls);
          setNickname(session.nickname);
          setStudentId(session.studentId);
          setIsJoined(true);
          ensureAssignmentRecords(cls);
          const allAssignments = getAssignments();
          setAssignments(allAssignments.filter((a) => a.classId === cls.id));
        }
      }
    } catch {
      // ignore bad session data
    }
  }, []);

  // Track page views for student activity analytics
  useEffect(() => {
    if (joinedClass?.id) {
      trackPageView('class', joinedClass.id);
    }
  }, [joinedClass?.id, tab]);

  const handleJoinClass = (e) => {
    e.preventDefault();
    setJoinError('');
    if (!classCode.trim()) { setJoinError('Please enter a class code.'); return; }
    if (!nickname.trim()) { setJoinError('Please enter your name.'); return; }
    const cls = getClassByCode(classCode.trim());
    if (!cls) { setJoinError('Class not found. Please check the code and try again.'); return; }
    const result = addStudentToClass(cls.id, nickname.trim());
    if (!result) { setJoinError('We couldn\'t add you to the class. Please check the code and your name, then try again.'); return; }
    const updatedClasses = getClasses();
    const updatedCls = updatedClasses.find((c) => c.id === cls.id) || cls;
    setJoinedClass(updatedCls);
    setStudentId(result.student.id);
    setIsJoined(true);
    ensureAssignmentRecords(updatedCls);
    const allAssignments = getAssignments();
    setAssignments(allAssignments.filter((a) => a.classId === updatedCls.id));
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      classId: updatedCls.id, nickname: nickname.trim(), studentId: result.student.id,
    }));
  };

  const handleLeave = () => {
    setIsJoined(false);
    setJoinedClass(null);
    setAssignments([]);
    setClassCode('');
    setNickname('');
    setStudentId('');
    setJoinError('');
    setTab('overview');
    localStorage.removeItem(SESSION_KEY);
  };

  // ── Computed data ──
  const gradeId = joinedClass?.gradeId || 'grade3';
  const conceptsGradeId = gradeId === 'texes' ? 'algebra' : gradeId; // TEXES uses algebra-level concepts
  const allConcepts = useMemo(() => getAllConcepts(conceptsGradeId), [conceptsGradeId]);
  const allConceptIds = useMemo(() => allConcepts.map((c) => c.conceptId), [allConcepts]);
  const recommendations = useMemo(() => getRecommendations(allConceptIds, 8), [allConceptIds]);
  const stats = useMemo(() => computeStats(allConcepts, gradeId), [allConcepts, gradeId]);
  const conceptsByDomain = useMemo(() => {
    const byDomain = {};
    for (const c of allConcepts) {
      const d = c.domainId || 'other';
      if (!byDomain[d]) byDomain[d] = [];
      byDomain[d].push(c);
    }
    return byDomain;
  }, [allConcepts]);
  const pacingSuggestion = useMemo(() => getPacingSuggestion(stats), [stats]);
  const xp = computeXP(stats);
  const levelInfo = getLevel(xp);
  const currentStreak = useMemo(() => getCurrentStreak(stats.activeDays), [stats.activeDays]);
  const earnedAchievements = useMemo(() => ACHIEVEMENTS.filter((a) => a.check(stats)), [stats]);
  const velocity = useMemo(() => getLearningVelocity(allConcepts), [allConcepts]);
  const spacedQueue = useMemo(() => getSpacedRepetitionQueue(allConceptIds, 4), [allConceptIds]);
  const portfolio = useMemo(() => getStudentPortfolio(), []);

  // Update cross-class portfolio whenever stats change
  useEffect(() => {
    if (joinedClass && stats.totalAttempts > 0) {
      updateStudentPortfolio(joinedClass.id, joinedClass.name, gradeId, stats);
    }
  }, [joinedClass, stats, gradeId]);

  // Auto-check certificate eligibility
  const [earnedCert, setEarnedCert] = useState(null);
  useEffect(() => {
    if (!joinedClass || !studentId) return;
    try {
      const cert = checkAndIssueCertificate(studentId, joinedClass.id);
      if (cert) setEarnedCert(cert);
      else {
        const existing = getCertificates().find((c) => c.studentId === studentId && c.classId === joinedClass.id && c.status === 'valid');
        if (existing) setEarnedCert(existing);
      }
    } catch (err) { console.warn('Certificate check failed:', err); }
  }, [joinedClass, studentId, stats.totalAttempts]);

  const showLockedMessage = (concept) => {
    const status = getPrerequisiteStatus(concept.conceptId);
    const unmet = status.prereqs.filter((p) => !p.met).map((p) => {
      const c = allConcepts.find((ac) => ac.conceptId === p.conceptId);
      return c?.label || p.conceptId;
    });
    setLockedToast({ concept: concept.label, prerequisites: unmet, met: status.met, total: status.total });
    setTimeout(() => setLockedToast(null), 5000);
  };

  // ── Warm-up launcher ──
  const launchWarmUp = (concept) => {
    if (!isConceptUnlocked(concept.conceptId)) { showLockedMessage(concept); return; }
    const teks = getTeksForConcept(concept.conceptId);
    const params = new URLSearchParams();
    params.set('teks', teks);
    params.set('grade', gradeId);
    params.set('label', concept.label);
    params.set('concept', concept.conceptId);
    if (studentId) params.set('sid', studentId);
    if (joinedClass?.id) params.set('cid', joinedClass.id);
    navigate('/warmup?' + params.toString());
  };

  // ── Available warm-ups (standards with questions in test bank) ──
  const availableWarmUps = useMemo(() => {
    const banked = getBankedTeks();
    // Only standards that have at least 3 MC questions
    return banked.filter((b) => {
      const mcCount = queryBank({ teks: b.teks, format: 'multiple-choice' }).length;
      return mcCount >= 3;
    }).sort((a, b) => a.teks.localeCompare(b.teks));
  }, []);

  const launchConcept = (concept) => {
    if (!concept || !concept.conceptId) return;
    if (!isConceptUnlocked(concept.conceptId)) { showLockedMessage(concept); return; }
    const teks = getTeksForConcept(concept.conceptId);
    if (!teks) return; // no TEKS mapped for this concept; avoid broken game URL
    const params = new URLSearchParams();
    params.set('teks', teks);
    params.set('label', concept.label || concept.conceptId);
    params.set('desc', concept.description || '');
    params.set('concept', concept.conceptId);
    if (gradeId) params.set('grade', gradeId);
    if (studentId) params.set('sid', studentId);
    if (joinedClass?.id) {
      params.set('cid', joinedClass.id);
      const match = findMatchingAssignment(joinedClass.id, 'math-sprint', teks);
      if (match) params.set('aid', match.id);
    }
    navigate('/games/math-sprint?' + params.toString());
  };

  /** One continuous flow: Learn → Check → (concept → 2 questions → game loop). Goes to practice-loop. */
  const launchLearnCheckGame = (concept) => {
    if (!concept || !concept.conceptId) return;
    if (!isConceptUnlocked(concept.conceptId)) { showLockedMessage(concept); return; }
    const teks = getTeksForConcept(concept.conceptId);
    if (!teks) return;
    const params = new URLSearchParams();
    params.set('phase', 'diagnostic');
    params.set('teks', concept.standardCode || teks);
    params.set('label', concept.label || concept.conceptId);
    params.set('concept', concept.conceptId);
    if (gradeId) params.set('grade', gradeId);
    if (studentId) params.set('sid', studentId);
    if (joinedClass?.id) params.set('cid', joinedClass.id);
    navigate('/practice-loop?' + params.toString());
  };

  const goToWarmUpFromConcept = (concept, teks) => {
    const params = new URLSearchParams();
    params.set('phase', 'diagnostic');
    params.set('teks', teks || getTeksForConcept(concept.conceptId));
    params.set('label', concept.label || concept.conceptId);
    params.set('concept', concept.conceptId);
    if (gradeId) params.set('grade', gradeId);
    if (studentId) params.set('sid', studentId);
    if (joinedClass?.id) params.set('cid', joinedClass.id);
    navigate('/practice-loop?' + params.toString());
  };

  const buildPlayLink = (assignment) => {
    if (!assignment.gamePath) return null;
    const sep = assignment.gamePath.includes('?') ? '&' : '?';
    return `${assignment.gamePath}${sep}sid=${studentId}&aid=${assignment.id}&cid=${joinedClass?.id || ''}`;
  };

  // ── Tab definitions (learner-centric: Skill Graph first) ──
  const TABS = [
    { id: 'overview', label: 'My Path', icon: '🎯' },
    { id: 'skill-graph', label: 'Skill Graph', icon: '🕸️' },
    { id: 'feed', label: 'Discussions', icon: '💬' },
    { id: 'modules', label: 'Materials', icon: '📚' },
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'meet', label: 'Video Meet', icon: '📹' },
    { id: 'studio', label: 'Video Studio', icon: '🎬' },
    { id: 'live', label: 'Live Game', icon: '🎯' },
    { id: 'spaces', label: 'My Spaces', icon: '👥' },
    { id: 'concept-map', label: 'Concept Map', icon: '🗺️' },
    { id: 'progress', label: 'Progress', icon: '📈' },
    { id: 'warmups', label: 'Warm-Ups', icon: '🔥' },
    { id: 'games', label: 'My Games', icon: '🎮' },
    { id: 'practice', label: 'Practice', icon: '🎯' },
    { id: 'awards', label: 'Awards', icon: '🏆' },
    { id: 'gamification', label: 'XP & Ranks', icon: '⚡' },
    { id: 'ai-tutor', label: 'AI Tutor', icon: '\uD83E\uDDD1\u200D\uD83C\uDFEB' },
  ];

  // ════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <style>{`
        @media (max-width: 900px) {
          .student-dash-layout { flex-direction: column !important; }
          .student-sidebar { width: 100% !important; min-width: 0 !important; flex-direction: row !important; flex-wrap: wrap !important; padding: 12px !important; border-right: none !important; border-bottom: 1px solid #e2e8f0 !important; gap: 6 !important; }
          .student-sidebar button { flex: 1 1 auto !important; min-width: 100px !important; justify-content: center !important; }
          .student-main { max-width: none !important; padding: 16px !important; }
        }
      `}</style>
      <div style={{
        maxWidth: isJoined ? 'none' : 680,
        margin: isJoined ? 0 : '0 auto',
        padding: isJoined ? 0 : '20px 16px 40px',
      }}>
        {!isJoined ? (
          /* ═══════════════════════════════════════════════
             TExES self-study (from pricing / pay flow) OR join class
             ═══════════════════════════════════════════════ */
          <div>
            {focusTexesSelfStudy && !showTeacherClassJoin ? (
              <div ref={texesSignupRef} style={{
                marginBottom: 28,
                textAlign: 'center', padding: '36px 24px 32px',
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 55%, #6d28d9 100%)',
                borderRadius: 24, color: '#fff',
                boxShadow: highlightTexesSignup ? '0 0 0 4px rgba(139,92,246,0.35), 0 8px 32px rgba(37,99,235,0.25)' : '0 8px 32px rgba(37,99,235,0.2)',
                border: highlightTexesSignup ? '2px solid rgba(255,255,255,0.5)' : 'none',
                transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px', fontSize: 36,
                }}>
                  📐
                </div>
                <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 800 }}>
                  {getExamLabel(selfStudyExamId)} prep
                </h1>
                <p style={{ margin: '0 auto 20px', fontSize: 15, opacity: 0.92, maxWidth: 400, lineHeight: 1.5 }}>
                  You&rsquo;re signing up for the adaptive practice loop for this exam. No class code is required unless your teacher gave you one.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                  <Link to={getSelfStudyPracticePaths(selfStudyExamId).preview} style={{
                    display: 'inline-block', padding: '12px 22px',
                    background: 'rgba(255,255,255,0.95)', color: '#1d4ed8', borderRadius: 12,
                    textDecoration: 'none', fontWeight: 800, fontSize: 15,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                  }}>
                    Start free preview
                  </Link>
                  <Link to={getSelfStudyPracticePaths(selfStudyExamId).paywall} style={{
                    display: 'inline-block', padding: '12px 22px',
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#1c1917', borderRadius: 12,
                    textDecoration: 'none', fontWeight: 800, fontSize: 15,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                  }}>
                    Create account &amp; pay
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowTeacherClassJoin(true); setHighlightTexesSignup(false); }}
                  style={{
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.45)', color: '#fff',
                    padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  I have a class code from my teacher
                </button>
              </div>
            ) : (
              <>
            {focusTexesSelfStudy && showTeacherClassJoin && (
              <div style={{ marginBottom: 16, textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowTeacherClassJoin(false)}
                  style={{
                    background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155',
                    padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  ← Back to {getExamLabel(selfStudyExamId)} self-study
                </button>
              </div>
            )}
            {/* Hero */}
            <div style={{
              textAlign: 'center', padding: '40px 24px 36px', marginBottom: 28,
              background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 60%, #7c3aed 100%)',
              borderRadius: 24, color: '#fff',
              boxShadow: '0 8px 32px rgba(37,99,235,0.2)',
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px', fontSize: 36,
              }}>
                🎓
              </div>
              <h1 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 800 }}>{t('studentPortal')}</h1>
              <p style={{ margin: 0, fontSize: 15, opacity: 0.85, maxWidth: 320, marginInline: 'auto' }}>
                {t('enterCode')}!
              </p>
            </div>

            {/* Join Form */}
            <section aria-labelledby="student-join-heading" style={{
              background: '#fff', borderRadius: 20, padding: '32px 28px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
            }}>
              <h2 id="student-join-heading" style={{ margin: '0 0 24px', fontSize: 20, textAlign: 'center', color: '#0f172a', fontWeight: 800 }}>
                {t('joinYourClass')}
              </h2>
              <form onSubmit={handleJoinClass}>
                <div style={{ marginBottom: 20 }}>
                  <label htmlFor="student-join-class-code" style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13, color: '#334155' }}>
                    {t('classCode')}
                  </label>
                  <input
                    id="student-join-class-code"
                    type="text"
                    placeholder="e.g. X7K3"
                    value={classCode}
                    onChange={(e) => { setClassCode(e.target.value.toUpperCase()); setJoinError(''); }}
                    maxLength={8}
                    style={{
                      width: '100%', padding: '16px 18px', boxSizing: 'border-box', borderRadius: 12,
                      border: '2px solid #e2e8f0', fontSize: 22, fontWeight: 800, letterSpacing: 6,
                      textAlign: 'center', textTransform: 'uppercase', color: '#0f172a',
                      outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    autoFocus
                  />
                  <p style={{ margin: '6px 0 0', fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
                    {t('teacherWillGiveCode')}
                  </p>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label htmlFor="student-join-nickname" style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13, color: '#334155' }}>
                    {t('yourName')}
                  </label>
                  <input
                    id="student-join-nickname"
                    type="text"
                    placeholder={t('enterYourName')}
                    value={nickname}
                    onChange={(e) => { setNickname(e.target.value); setJoinError(''); }}
                    maxLength={30}
                    style={{
                      width: '100%', padding: '14px 16px', boxSizing: 'border-box', borderRadius: 12,
                      border: '2px solid #e2e8f0', fontSize: 16, color: '#0f172a', outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {joinError && (
                  <div role="alert" aria-live="assertive" style={{
                    padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca',
                    borderRadius: 10, marginBottom: 18, color: '#dc2626', fontSize: 14, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span aria-hidden="true">⚠️</span> {joinError}
                  </div>
                )}

                <button type="submit" style={{
                  width: '100%', padding: '16px 24px', fontSize: 17, fontWeight: 800, cursor: 'pointer',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white',
                  border: 'none', borderRadius: 14, transition: 'transform 0.15s, box-shadow 0.15s',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.3)'; }}
                >
                  {t('joinClass')}
                </button>
              </form>
            </section>

            {/* Browse games link */}
            <div style={{
              marginTop: 20, padding: '18px 20px', background: '#fff', borderRadius: 14,
              border: '1px solid #e2e8f0', textAlign: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            }}>
              <p style={{ margin: '0 0 8px', fontSize: 14, color: '#64748b' }}>
                {t('orExploreGames')}
              </p>
              <Link to="/games" style={{
                display: 'inline-block', padding: '10px 22px',
                background: '#f1f5f9', color: '#2563eb', borderRadius: 10,
                textDecoration: 'none', fontWeight: 700, fontSize: 14,
                border: '1px solid #e2e8f0', transition: 'all 0.15s',
              }}>
                🎮 {t('browseGames')}
              </Link>
            </div>

            {/* Self-serve exam prep */}
            <div
              ref={texesSignupRef}
              style={{
              marginTop: 16, padding: '20px 20px', background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)', borderRadius: 14,
              border: highlightTexesSignup ? '2px solid #8b5cf6' : '1px solid #c7d2fe', textAlign: 'center',
              boxShadow: highlightTexesSignup ? '0 0 0 4px rgba(139,92,246,0.15)' : '0 1px 4px rgba(0,0,0,0.03)',
              transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
            }}
            >
              {highlightTexesSignup && (
                <div style={{ margin: '0 auto 8px', fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6d28d9' }}>
                  Recommended next step
                </div>
              )}
              <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                Preparing for a certification exam?
              </p>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>
                Start a free adaptive learning loop — no class code needed.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to={getSelfStudyPracticePaths('math712').preview} style={{
                display: 'inline-block', padding: '10px 22px',
                background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: '#fff', borderRadius: 10,
                textDecoration: 'none', fontWeight: 700, fontSize: 14,
                border: 'none', transition: 'all 0.15s',
                boxShadow: '0 2px 10px rgba(124,58,237,0.25)',
              }}>
                Start free preview (7–12)
                </Link>
                <Link to={getSelfStudyPracticePaths('math712').paywall} style={{
                  display: 'inline-block', padding: '10px 22px',
                  background: '#ffffff', color: '#5b21b6', borderRadius: 10,
                  textDecoration: 'none', fontWeight: 700, fontSize: 14,
                  border: '1px solid #a78bfa', transition: 'all 0.15s',
                }}>
                  Sign up &amp; pay (7–12)
                </Link>
                <Link to={getSelfStudyPracticePaths('math48').preview} style={{
                  display: 'inline-block', padding: '10px 22px',
                  background: '#fff', color: '#0369a1', borderRadius: 10,
                  textDecoration: 'none', fontWeight: 700, fontSize: 14,
                  border: '1px solid #7dd3fc', transition: 'all 0.15s',
                }}>
                  Math 4–8 preview
                </Link>
              </div>
            </div>
              </>
            )}
          </div>
        ) : (
          /* ═══════════════════════════════════════════════
             STUDENT DASHBOARD — Canvas-style layout
             ═══════════════════════════════════════════════ */
          <>
          {lockedToast && (
            <div role="alert" style={{
              position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10000,
              padding: '14px 24px', borderRadius: 12, background: '#fef3c7', border: '2px solid #f59e0b',
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)', maxWidth: 420, animation: 'fadeInSlide 0.3s',
            }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#92400e', marginBottom: 4 }}>
                {'\uD83D\uDD12'} {lockedToast.concept} is locked
              </div>
              <div style={{ fontSize: 12, color: '#78350f', marginBottom: 6 }}>
                Complete {lockedToast.total - lockedToast.met} more prerequisite{lockedToast.total - lockedToast.met > 1 ? 's' : ''} to unlock:
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {lockedToast.prerequisites.map((p) => (
                  <span key={p} style={{ padding: '3px 10px', borderRadius: 6, background: '#fff', border: '1px solid #fbbf24', fontSize: 11, fontWeight: 600, color: '#92400e' }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="student-dash-layout" style={{ display: 'flex', minHeight: 'calc(100vh - 50px)', alignItems: 'stretch' }}>
            {/* ── Left Sidebar (Canvas-style) ── */}
            <nav className="student-sidebar" aria-label="Student navigation" role="tablist" aria-orientation="vertical" style={{
              width: 200, minWidth: 200, flexShrink: 0,
              background: '#fff', borderRight: '1px solid #e2e8f0',
              padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 2,
            }}>
              {TABS.map((tabItem) => (
                <button
                  key={tabItem.id}
                  type="button"
                  role="tab"
                  id={`tab-${tabItem.id}`}
                  aria-selected={tab === tabItem.id}
                  aria-controls={`panel-${tabItem.id}`}
                  tabIndex={tab === tabItem.id ? 0 : -1}
                  onClick={() => setTab(tabItem.id)}
                  onKeyDown={(e) => {
                    const idx = TABS.findIndex((t2) => t2.id === tabItem.id);
                    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                      e.preventDefault();
                      const next = TABS[(idx + 1) % TABS.length];
                      setTab(next.id);
                      document.getElementById(`tab-${next.id}`)?.focus();
                    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                      e.preventDefault();
                      const prev = TABS[(idx - 1 + TABS.length) % TABS.length];
                      setTab(prev.id);
                      document.getElementById(`tab-${prev.id}`)?.focus();
                    } else if (e.key === 'Home') {
                      e.preventDefault(); setTab(TABS[0].id); document.getElementById(`tab-${TABS[0].id}`)?.focus();
                    } else if (e.key === 'End') {
                      e.preventDefault(); setTab(TABS[TABS.length - 1].id); document.getElementById(`tab-${TABS[TABS.length - 1].id}`)?.focus();
                    }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 16px', margin: '0 8px', borderRadius: 10,
                    border: 'none', background: tab === tabItem.id ? '#eff6ff' : 'transparent',
                    color: tab === tabItem.id ? '#1d4ed8' : '#475569',
                    fontSize: 14, fontWeight: tab === tabItem.id ? 700 : 600,
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { if (tab !== tabItem.id) e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={(e) => { if (tab !== tabItem.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 18 }} aria-hidden="true">{tabItem.icon}</span>
                  <span>{tabItem.label}</span>
                </button>
              ))}
            </nav>

            {/* ── Main Content ── */}
            <div ref={mainPanelRef} className="student-main" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} style={{ flex: 1, overflow: 'auto', padding: '0 24px 40px', minWidth: 0, maxWidth: tab === 'concept-map' ? 'none' : 720 }}>
            {/* ── Header Banner ── */}
            <div style={{
              padding: '22px 24px 14px', marginBottom: 20,
              background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 60%, #7c3aed 100%)',
              borderRadius: 20, color: '#fff',
              boxShadow: '0 4px 20px rgba(37,99,235,0.2)',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                flexWrap: 'wrap', gap: 10,
              }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 22, lineHeight: 1.2 }}>
                    Hey, {nickname}!
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.85 }}>
                    {joinedClass.name} &bull; {joinedClass.gradeLevel}
                    <span style={{
                      marginLeft: 8, padding: '2px 8px',
                      background: 'rgba(255,255,255,0.2)', borderRadius: 4,
                      fontSize: 11, fontWeight: 700,
                    }}>
                      {joinedClass.joinCode}
                    </span>
                  </p>
                </div>
                <button type="button" onClick={handleLeave} style={{
                  padding: '6px 14px', cursor: 'pointer', borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)',
                  fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)',
                  transition: 'all 0.15s',
                }}>
                  Leave
                </button>
              </div>

              {/* XP Level Bar */}
              <LevelBar levelInfo={levelInfo} />
            </div>

            {/* ── Stats Cards ── */}
            <div style={{
              display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap',
            }}>
              <StatCard
                icon="🎯"
                value={stats.totalAttempts}
                label="Questions"
                color="#2563eb"
                subtext="answered"
              />
              <StatCard
                icon="⭐"
                value={stats.overallAccuracy > 0 ? `${stats.overallAccuracy}%` : '—'}
                label="Accuracy"
                color={stats.overallAccuracy >= 80 ? '#22c55e' : stats.overallAccuracy >= 60 ? '#f59e0b' : '#64748b'}
              />
              <StatCard
                icon="🔥"
                value={currentStreak || stats.bestStreak || 0}
                label={currentStreak > 0 ? 'Day Streak' : 'Best Streak'}
                color="#f59e0b"
              />
              <StatCard
                icon="🏆"
                value={earnedAchievements.length}
                label="Awards"
                color="#7c3aed"
                subtext={`of ${ACHIEVEMENTS.length}`}
              />
            </div>

            {/* ── Cross-Class Portfolio (shown when student has multi-class history) ── */}
            {portfolio && portfolio.classes.length > 1 && (
              <div style={{
                padding: '16px 20px', borderRadius: 16, marginBottom: 20,
                background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                border: '1px solid #e9d5ff',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 18 }}>{'\uD83C\uDF10'}</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#6d28d9' }}>Your Learning Portfolio</h3>
                    <p style={{ margin: 0, fontSize: 12, color: '#7c3aed' }}>
                      Skills tracked across {portfolio.classes.length} classes · {Object.keys(portfolio.globalMastery).length} concepts tracked globally
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {portfolio.classes.map((cls) => (
                    <div key={cls.classId} style={{
                      padding: '8px 14px', borderRadius: 10, background: '#fff',
                      border: cls.classId === joinedClass?.id ? '2px solid #7c3aed' : '1px solid #e9d5ff',
                      minWidth: 120,
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                        {cls.className}
                        {cls.classId === joinedClass?.id && (
                          <span style={{ fontSize: 10, color: '#7c3aed', marginLeft: 4 }}>(current)</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        {cls.masteredCount}/{cls.totalConcepts} mastered · {cls.accuracy}% accuracy
                      </div>
                      <div style={{
                        height: 4, borderRadius: 2, background: '#e9d5ff', marginTop: 4, overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', borderRadius: 2,
                          width: `${cls.totalConcepts > 0 ? Math.round((cls.masteredCount / cls.totalConcepts) * 100) : 0}%`,
                          background: '#7c3aed',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Learner-centric: Your Path, Competency, Pacing ── */}
            <div style={{ display: 'grid', gap: 20, marginBottom: 20 }}>
              {recommendations.length > 0 && (
                <LearningPath
                  recommendations={recommendations}
                  allConcepts={allConcepts}
                  onLaunch={launchLearnCheckGame}
                  maxItems={6}
                  gradeId={gradeId}
                  studentStats={stats}
                />
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <CrossCompetencyDashboard
                  conceptsByDomain={conceptsByDomain}
                  gradeId={gradeId}
                  getMasteryLevel={getMasteryLevel}
                  onConceptClick={launchLearnCheckGame}
                />
                <div style={{
                  background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
                  padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                    Adaptive Pacing
                  </h3>
                  <p style={{ margin: '0 0 10px', fontSize: 13, color: '#64748b' }}>
                    AI-powered pacing based on your progress & velocity.
                  </p>
                  <div style={{
                    padding: 14, borderRadius: 10, background: pacingSuggestion.color + '15',
                    border: `2px solid ${pacingSuggestion.color}40`, marginBottom: 10,
                  }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: pacingSuggestion.color }}>
                      {pacingSuggestion.label}
                    </div>
                    <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                      {pacingSuggestion.tip}
                    </div>
                    {pacingSuggestion.pace === 'start' && (
                      <button
                        type="button"
                        onClick={() => setTab('games')}
                        aria-label="Get started: go to My Games to play your first practice"
                        style={{
                          marginTop: 12, padding: '10px 18px', borderRadius: 10, border: 'none',
                          background: pacingSuggestion.color, color: '#fff', fontSize: 14, fontWeight: 700,
                          cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                        }}
                      >
                        Get started →
                      </button>
                    )}
                  </div>

                  {/* Velocity + weekly goal */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {pacingSuggestion.weeklyGoal && (
                      <div style={{ flex: 1, minWidth: 80, padding: '8px 10px', borderRadius: 8, background: '#f0fdf4', textAlign: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#22c55e' }}>{pacingSuggestion.weeklyGoal}</div>
                        <div style={{ fontSize: 10, color: '#065f46', fontWeight: 600 }}>sessions/week</div>
                      </div>
                    )}
                    {pacingSuggestion.suggestedMinutes && (
                      <div style={{ flex: 1, minWidth: 80, padding: '8px 10px', borderRadius: 8, background: '#eff6ff', textAlign: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#2563eb' }}>{pacingSuggestion.suggestedMinutes}m</div>
                        <div style={{ fontSize: 10, color: '#1e40af', fontWeight: 600 }}>per session</div>
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 80, padding: '8px 10px', borderRadius: 8, background: '#faf5ff', textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#7c3aed' }}>
                        {velocity.currentWeek}
                      </div>
                      <div style={{ fontSize: 10, color: '#6d28d9', fontWeight: 600 }}>
                        mastered this wk
                      </div>
                    </div>
                  </div>

                  {/* Accuracy trend */}
                  {pacingSuggestion.accTrend != null && Math.abs(pacingSuggestion.accTrend) > 2 && (
                    <div style={{ marginTop: 8, fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: pacingSuggestion.accTrend > 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                        {pacingSuggestion.accTrend > 0 ? '\u2191' : '\u2193'} {Math.abs(Math.round(pacingSuggestion.accTrend))}%
                      </span>
                      accuracy trend (recent vs. overall)
                    </div>
                  )}

                  {/* Spaced repetition queue */}
                  {spacedQueue.length > 0 && (
                    <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                        Review Queue (Spaced Repetition)
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {spacedQueue.map((item) => {
                          const concept = allConcepts.find((c) => c.conceptId === item.conceptId);
                          return concept ? (
                            <button key={item.conceptId} type="button" onClick={() => launchLearnCheckGame(concept)} style={{
                              padding: '4px 10px', borderRadius: 6, border: '1px solid #fbbf24',
                              background: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                              color: '#92400e',
                            }}>
                              {concept.label} ({item.daysSince}d ago)
                            </button>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Next Best Challenge (legacy, keep for quick launch) ── */}
            {recommendations.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <NextChallenge
                  recommendation={recommendations[0]}
                  allConcepts={allConcepts}
                  onLaunch={launchLearnCheckGame}
                />
              </div>
            )}

            {/* ════════════════════════════════════════════
                OVERVIEW TAB
                ════════════════════════════════════════════ */}
            {tab === 'feed' && joinedClass && (
              <div style={{ marginTop: 4 }}>
                <ClassFeed classId={joinedClass.id} cls={joinedClass} isTeacher={false} studentId={studentId} studentName={nickname} />
              </div>
            )}

            {tab === 'modules' && joinedClass && (
              <div style={{ marginTop: 4 }}>
                <ContentModules classId={joinedClass.id} isTeacher={false} />
              </div>
            )}

            {tab === 'chat' && joinedClass && (
              <div style={{ marginTop: 4 }}>
                <ClassChat classId={joinedClass.id} isTeacher={false} userId={studentId} userName={nickname} />
              </div>
            )}

            {tab === 'meet' && joinedClass && (
              <div style={{ marginTop: 4 }}>
                <VideoMeet classId={joinedClass.id} userName={nickname} isTeacher={false} />
              </div>
            )}

            {tab === 'studio' && (
              <div style={{ marginTop: 4 }}>
                <VideoStudio
                  embedded
                  onBack={() => setTab('overview')}
                  createdBy={studentId || nickname || 'student'}
                />
              </div>
            )}

            {tab === 'live' && (
              <div style={{ marginTop: 4 }}>
                <LiveGamePlayer studentId={studentId} studentName={nickname} />
              </div>
            )}

            {tab === 'spaces' && joinedClass && (
              <div style={{ marginTop: 4 }}>
                <CollaborativeSpaces
                  classId={joinedClass.id}
                  cls={joinedClass}
                  isTeacher={false}
                  studentId={studentId}
                  studentName={nickname}
                />
              </div>
            )}

            {tab === 'skill-graph' && (
              <div style={{ marginTop: 4 }}>
                <SkillGraph
                  conceptsByDomain={conceptsByDomain}
                  gradeId={conceptsGradeId}
                  getMasteryLevel={getMasteryLevel}
                  onConceptClick={launchConcept}
                />
              </div>
            )}

            {tab === 'concept-map' && (
              <div style={{ marginTop: 4 }}>
                <ConceptMap
                  embedded
                  onBack={() => setTab('overview')}
                  studentId={studentId}
                />
              </div>
            )}

            {tab === 'overview' && (() => {
              // Pick the best warm-up for the student
              const bestWarmUp = (() => {
                for (const rec of recommendations) {
                  const concept = allConcepts.find((c) => c.conceptId === rec.conceptId);
                  if (!concept) continue;
                  const match = availableWarmUps.find((w) => w.teks === concept.standardCode);
                  if (match) return { warmUp: match, concept };
                }
                if (availableWarmUps.length > 0) {
                  const random = availableWarmUps[Math.floor(Math.random() * availableWarmUps.length)];
                  const concept = allConcepts.find((c) => c.standardCode === random.teks);
                  return { warmUp: random, concept };
                }
                return null;
              })();

              // Pick next 2 weak concepts for game practice
              const weakConcepts = recommendations.slice(0, 3).map((rec) => {
                const concept = allConcepts.find((c) => c.conceptId === rec.conceptId);
                if (!concept) return null;
                const level = getMasteryLevel(concept.conceptId);
                const accuracy = getAccuracy(concept.conceptId);
                return { ...concept, level, accuracy, rec };
              }).filter(Boolean);

              // Check if there are teacher assignments
              const pendingAssignments = assignments.filter((a) => !a.completed);

              // ── Build "Your Work" (assignments + discussions by due date) ──
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const endOfToday = new Date(today);
              endOfToday.setHours(23, 59, 59, 999);
              const endOfWeek = new Date(today);
              endOfWeek.setDate(endOfWeek.getDate() + 7);

              const classDiscussions = joinedClass ? getClassDiscussions(joinedClass.id) : [];
              const studentHasReplied = (d) => (d.replies || []).some((r) => r.authorId === studentId);

              const workOverdue = [];
              const workDueToday = [];
              const workDueThisWeek = [];
              const workNoDue = [];

              assignments.filter((a) => !a.completed).forEach((a) => {
                const due = a.dueDate ? new Date(a.dueDate) : null;
                const item = { type: 'assignment', id: a.id, title: a.name, due, data: a };
                if (!due) workNoDue.push(item);
                else if (due < today) workOverdue.push(item);
                else if (due <= endOfToday) workDueToday.push(item);
                else if (due <= endOfWeek) workDueThisWeek.push(item);
                else workNoDue.push(item);
              });

              classDiscussions.forEach((d) => {
                if (d.requireReply && studentHasReplied(d)) return;
                const due = d.dueDate ? new Date(d.dueDate) : null;
                const item = { type: 'discussion', id: d.id, title: d.title, due, data: d };
                if (!due) workNoDue.push(item);
                else if (due < today) workOverdue.push(item);
                else if (due <= endOfToday) workDueToday.push(item);
                else if (due <= endOfWeek) workDueThisWeek.push(item);
                else workNoDue.push(item);
              });

              const hasWork = workOverdue.length + workDueToday.length + workDueThisWeek.length + workNoDue.length > 0;

              const doLaunchWarmUp = (wu, concept) => {
                if (concept) launchWarmUp(concept);
                else {
                  const params = new URLSearchParams();
                  params.set('teks', wu.teks);
                  params.set('grade', gradeId);
                  if (studentId) params.set('sid', studentId);
                  if (joinedClass?.id) params.set('cid', joinedClass.id);
                  navigate('/warmup?' + params.toString());
                }
              };

              const renderWorkItem = (item, idx) => {
                if (item.type === 'assignment') {
                  const link = buildPlayLink(item.data);
                  const href = link || item.data.gamePath || '/games';
                  return (
                    <Link key={item.id} to={href} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                      padding: '14px 18px', borderRadius: 12, background: '#fff', border: '1px solid #f1f5f9',
                      textDecoration: 'none', color: 'inherit', transition: 'all 0.15s',
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 20 }}>🎮</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{item.title}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            {item.due ? `Due ${item.due.toLocaleDateString()}` : 'Assigned'}
                          </div>
                        </div>
                      </div>
                      <span style={{ padding: '6px 14px', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>Play →</span>
                    </Link>
                  );
                }
                return (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    padding: '14px 18px', borderRadius: 12, background: '#fff', border: '1px solid #f1f5f9',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 20 }}>💬</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{item.title}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          {item.due ? `Due ${item.due.toLocaleDateString()}` : 'Participate'}
                        </div>
                      </div>
                    </div>
                    <button type="button" onClick={() => setTab('feed')} style={{
                      padding: '6px 14px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff',
                      borderRadius: 8, fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', flexShrink: 0,
                    }}>
                      Reply →
                    </button>
                  </div>
                );
              };

              return (
                <div style={{ display: 'grid', gap: 16 }}>

                  {/* ═══ Certificate Banner ═══ */}
                  {earnedCert && (
                    <div style={{
                      padding: '16px 20px', borderRadius: 14,
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      border: '2px solid #d97706', display: 'flex', alignItems: 'center', gap: 14,
                      boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
                    }}>
                      <span style={{ fontSize: 36 }} aria-hidden="true">{'\uD83C\uDF93'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 16, color: '#78350f' }}>Certificate Earned!</div>
                        <div style={{ fontSize: 13, color: '#92400e' }}>
                          You completed <strong>{earnedCert.courseName}</strong> with a {earnedCert.avgScore}% average.
                        </div>
                      </div>
                      <a href={earnedCert.verifyUrl} target="_blank" rel="noopener noreferrer"
                        style={{
                          padding: '10px 20px', borderRadius: 10, background: '#78350f', color: '#fbbf24',
                          fontWeight: 700, fontSize: 13, textDecoration: 'none', flexShrink: 0,
                        }}>
                        View Certificate
                      </a>
                    </div>
                  )}

                  {/* ════════════════════════════════════════════
                      AI STUDENT AGENT — Personalized companion
                      ════════════════════════════════════════════ */}
                  <StudentAgent
                    studentProfile={{
                      name: nickname,
                      grade: gradeId || 'Grade 3',
                      level: levelInfo?.level || 1,
                      title: levelInfo?.title || 'Novice',
                      xp: xp || 0,
                      accuracy: stats.overallAccuracy || 0,
                      mastered: stats.masteredCount || 0,
                      streak: currentStreak || 0,
                      weakAreas: allConcepts.filter((c) => getMasteryLevel(c.conceptId) === 'struggling').map((c) => c.name).slice(0, 3).join(', '),
                      strongAreas: allConcepts.filter((c) => getMasteryLevel(c.conceptId) === 'mastered').map((c) => c.name).slice(0, 3).join(', '),
                      lastActive: new Date().toISOString(),
                    }}
                    onAction={(suggestion) => {
                      if (suggestion.type === 'practice') setTab('practice');
                      else if (suggestion.type === 'challenge') setTab('gamification');
                      else if (suggestion.type === 'review') setTab('warmups');
                      else if (suggestion.type === 'celebrate') setTab('awards');
                    }}
                  />

                  {/* ════════════════════════════════════════════
                      YOUR WORK — Due today, this week, click to continue
                      ════════════════════════════════════════════ */}
                  {hasWork && (
                    <div style={{
                      borderRadius: 20, overflow: 'hidden', background: '#fff',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '2px solid #e2e8f0',
                    }}>
                      <div style={{
                        padding: '18px 22px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        color: '#fff',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <span style={{ fontSize: 24 }}>📋</span>
                          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800 }}>Your Work</h2>
                        </div>
                        <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>
                          Click through each item — complete your assignments and join discussions.
                        </p>
                      </div>
                      <div style={{ padding: '16px 20px 20px' }}>
                        {workOverdue.length > 0 && (
                          <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#dc2626', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>⏰ Overdue</div>
                            <div style={{ display: 'grid', gap: 8 }}>{workOverdue.map(renderWorkItem)}</div>
                          </div>
                        )}
                        {workDueToday.length > 0 && (
                          <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#ea580c', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>📅 Due Today</div>
                            <div style={{ display: 'grid', gap: 8 }}>{workDueToday.map(renderWorkItem)}</div>
                          </div>
                        )}
                        {workDueThisWeek.length > 0 && (
                          <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>📅 Due This Week</div>
                            <div style={{ display: 'grid', gap: 8 }}>{workDueThisWeek.map(renderWorkItem)}</div>
                          </div>
                        )}
                        {workNoDue.length > 0 && (
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>📋 Assigned</div>
                            <div style={{ display: 'grid', gap: 8 }}>{workNoDue.map(renderWorkItem)}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ════════════════════════════════════════════
                      TODAY'S LEARNING PATH — guided 3-step flow
                      ════════════════════════════════════════════ */}
                  <div style={{
                    borderRadius: 20, overflow: 'hidden',
                    background: '#fff',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    border: '2px solid #e2e8f0',
                  }}>
                    {/* Header */}
                    <div style={{
                      padding: '20px 24px 16px',
                      background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 60%, #7c3aed 100%)',
                      color: '#fff',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 24 }}>🚀</span>
                        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Today's Learning Path</h2>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>
                        Follow these steps in order — warm up your brain, learn something new, then practice with games!
                      </p>
                    </div>

                    <div style={{ padding: '0 20px 20px' }}>

                      {/* ── STEP 1: WARM-UP ── */}
                      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '20px 0 16px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 800, fontSize: 16,
                          boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
                        }}>1</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                            Step 1 — Quick Warm-Up
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                            {bestWarmUp?.concept?.label || bestWarmUp?.warmUp?.teks || 'Daily Practice'}
                          </div>
                          <p style={{ margin: '0 0 10px', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                            5 quick questions to see what you know. This helps QBot figure out what to teach you next!
                          </p>
                          {bestWarmUp?.warmUp && (
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                              <button type="button" onClick={() => doLaunchWarmUp(bestWarmUp.warmUp, bestWarmUp.concept)}
                                style={{
                                  padding: '10px 24px', borderRadius: 10, border: 'none',
                                  background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                                  color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                                  boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
                                  transition: 'transform 0.15s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                              >
                                Start Warm-Up
                              </button>
                              <span style={{ fontSize: 12, color: '#94a3b8' }}>
                                5 questions · ~2 min {bestWarmUp.warmUp.teks && `· TEKS ${bestWarmUp.warmUp.teks}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ── STEP 2: LEARN ── */}
                      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 800, fontSize: 16,
                          boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                        }}>2</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                            Step 2 — Learn with QBot
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                            Mini-Lesson
                          </div>
                          <p style={{ margin: '0 0 10px', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                            After your warm-up, QBot will teach you the concepts you need help with — step by step with examples!
                          </p>
                          {weakConcepts.length > 0 && (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {weakConcepts.slice(0, 2).map((c) => {
                                const lec = getLecture(c.standardCode);
                                return (
                                  <button key={c.conceptId} type="button"
                                    onClick={() => {
                                      if (lec) setActiveLecture({ lecture: lec, concept: c, teks: c.standardCode });
                                      else launchWarmUp(c);
                                    }}
                                    style={{
                                      padding: '6px 14px', borderRadius: 8, border: '1.5px solid #bfdbfe',
                                      background: '#eff6ff', color: '#1e40af', fontSize: 12, fontWeight: 600,
                                      cursor: 'pointer', transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#dbeafe'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#eff6ff'}
                                  >
                                    {lec ? '📚' : '🔥'} {c.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ── STEP 3: PRACTICE WITH GAMES ── */}
                      <div
                        onClick={() => setTab('games')}
                        style={{
                          display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px 0 4px',
                          cursor: 'pointer', borderRadius: 12, transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, #059669, #047857)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 800, fontSize: 16,
                          boxShadow: '0 2px 8px rgba(5,150,105,0.3)',
                        }}>3</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                            Step 3 — Practice with Games
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                            Reinforce What You Learned
                          </div>
                          <p style={{ margin: '0 0 10px', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                            {pendingAssignments.length > 0
                              ? `Your teacher assigned ${pendingAssignments.length} game${pendingAssignments.length > 1 ? 's' : ''} to help you practice. Play them to level up!`
                              : 'Play math games to practice the skills you just learned. The more you play, the stronger you get!'}
                          </p>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {pendingAssignments.length > 0 ? (
                              <>
                                {pendingAssignments.slice(0, 3).map((a) => {
                                  const link = buildPlayLink(a);
                                  const gameName = a.name || a.gameLabel || a.gameName || 'Play';
                                  if (link) {
                                    return (
                                      <Link key={a.id} to={link} onClick={(e) => e.stopPropagation()} style={{
                                        padding: '8px 16px', borderRadius: 8, border: '1.5px solid #86efac',
                                        background: '#f0fdf4', color: '#166534', fontSize: 13, fontWeight: 700,
                                        textDecoration: 'none', transition: 'background 0.15s',
                                      }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#dcfce7'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#f0fdf4'}
                                      >
                                        🎮 {gameName}
                                      </Link>
                                    );
                                  }
                                  const fallbackPath = a.gamePath || `/games`;
                                  return (
                                    <Link key={a.id} to={fallbackPath} onClick={(e) => e.stopPropagation()} style={{
                                      padding: '8px 16px', borderRadius: 8, border: '1.5px solid #86efac',
                                      background: '#f0fdf4', color: '#166534', fontSize: 13, fontWeight: 700,
                                      textDecoration: 'none', transition: 'background 0.15s',
                                    }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = '#dcfce7'}
                                      onMouseLeave={(e) => e.currentTarget.style.background = '#f0fdf4'}
                                    >
                                      🎮 {gameName}
                                    </Link>
                                  );
                                })}
                                {pendingAssignments.length > 3 && (
                                  <button type="button" onClick={(e) => { e.stopPropagation(); setTab('games'); }} style={{
                                    padding: '8px 16px', borderRadius: 8, border: '1.5px solid #86efac',
                                    background: '#ecfdf5', color: '#059669', fontSize: 13, fontWeight: 700,
                                    cursor: 'pointer',
                                  }}>
                                    +{pendingAssignments.length - 3} more →
                                  </button>
                                )}
                              </>
                            ) : (
                              <>
                                {weakConcepts.slice(0, 2).map((c) => (
                                  <button key={c.conceptId} type="button" onClick={(e) => { e.stopPropagation(); launchLearnCheckGame(c); }}
                                    style={{
                                      padding: '8px 16px', borderRadius: 8, border: '1.5px solid #86efac',
                                      background: '#f0fdf4', color: '#166534', fontSize: 13, fontWeight: 700,
                                      cursor: 'pointer', transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#dcfce7'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#f0fdf4'}
                                  >
                                    🎮 {c.label}
                                  </button>
                                ))}
                                <button type="button" onClick={(e) => { e.stopPropagation(); setTab('practice'); }} style={{
                                  padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0',
                                  background: '#f8fafc', color: '#64748b', fontSize: 13, fontWeight: 700,
                                  cursor: 'pointer',
                                }}>
                                  Browse all →
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* ── Teacher Assignments Banner (if any) ── */}
                  {pendingAssignments.length > 0 && (
                    <div style={{
                      padding: '14px 20px', borderRadius: 14,
                      background: 'linear-gradient(135deg, #ecfdf5, #dcfce7)',
                      border: '2px solid #86efac',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: 12, flexWrap: 'wrap',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 20 }}>📋</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>
                            {pendingAssignments.length} assignment{pendingAssignments.length > 1 ? 's' : ''} from your teacher
                          </div>
                          <div style={{ fontSize: 12, color: '#475569' }}>
                            Complete these to earn points and help your grade!
                          </div>
                        </div>
                      </div>
                      <button type="button" onClick={() => setTab('games')} style={{
                        padding: '8px 18px', borderRadius: 8, border: 'none',
                        background: '#059669', color: '#fff', fontWeight: 700, fontSize: 13,
                        cursor: 'pointer', whiteSpace: 'nowrap',
                      }}>
                        View All
                      </button>
                    </div>
                  )}

                  {/* ── Activity Streak ── */}
                  <ActivityStreak activeDays={stats.activeDays} currentStreak={currentStreak} />

                  {/* ── Quick Stats + Mastery Donut ── */}
                  <MasteryDonut stats={stats} />

                  {/* ── Mastery Map ── */}
                  <MasteryMap
                    allConcepts={allConcepts}
                    gradeId={gradeId}
                    onConceptClick={launchConcept}
                    onWarmUp={launchWarmUp}
                    onLearn={(concept) => {
                      const lec = getLecture(concept.standardCode);
                      if (lec) setActiveLecture({ lecture: lec, concept, teks: concept.standardCode });
                    }}
                  />
                </div>
              );
            })()}

            {/* ════════════════════════════════════════════
                PROGRESS TAB
                ════════════════════════════════════════════ */}
            {tab === 'progress' && (() => {
              // Build comprehensive progress data
              const allStats = getAllConceptStats();
              const conceptProgress = allConcepts.map((c) => {
                const cStats = allStats[c.conceptId] || { attempts: 0, correct: 0, streak: 0, bestStreak: 0, lastSeen: null, history: [] };
                const level = getMasteryLevel(c.conceptId);
                const accuracy = cStats.attempts > 0 ? Math.round((cStats.correct / cStats.attempts) * 100) : null;
                return { ...c, stats: cStats, level, accuracy };
              });

              const mastered = conceptProgress.filter((c) => c.level === 'mastered');
              const proficient = conceptProgress.filter((c) => c.level === 'proficient');
              const developing = conceptProgress.filter((c) => c.level === 'developing');
              const struggling = conceptProgress.filter((c) => c.level === 'struggling');
              const notStarted = conceptProgress.filter((c) => c.level === 'not-started');
              const inProgress = [...proficient, ...developing, ...struggling];

              // Recent activity (last 7 days)
              const sevenDaysAgo = Date.now() - 7 * 86400000;
              const recentlyActive = conceptProgress
                .filter((c) => c.stats.lastSeen && new Date(c.stats.lastSeen).getTime() > sevenDaysAgo)
                .sort((a, b) => new Date(b.stats.lastSeen) - new Date(a.stats.lastSeen));

              // What to work on next
              const nextUp = recommendations.slice(0, 3).map((rec) => {
                const concept = allConcepts.find((c) => c.conceptId === rec.conceptId);
                return concept ? { ...concept, rec } : null;
              }).filter(Boolean);

              const totalWithData = mastered.length + inProgress.length;
              const progressPct = allConcepts.length > 0 ? Math.round((mastered.length / allConcepts.length) * 100) : 0;

              return (
                <div style={{ display: 'grid', gap: 16 }}>

                  {/* ── Velocity & Pacing Card ── */}
                  <div style={{
                    padding: '16px 20px', borderRadius: 14,
                    background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                    border: '1px solid #bae6fd',
                    display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap',
                  }}>
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: '#0c4a6e', marginBottom: 4 }}>Learning Velocity</div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                        <span style={{ fontSize: 28, fontWeight: 800, color: '#0284c7' }}>{velocity.currentWeek}</span>
                        <span style={{ fontSize: 13, color: '#0369a1' }}>skills mastered this week</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                        Trend: <span style={{
                          fontWeight: 700,
                          color: velocity.trend === 'accelerating' ? '#22c55e' : velocity.trend === 'slowing' ? '#f59e0b' : '#3b82f6',
                        }}>
                          {velocity.trend === 'accelerating' ? '\u2191 Accelerating' : velocity.trend === 'slowing' ? '\u2193 Slowing' : '\u2192 Steady'}
                        </span>
                        {' '} · Avg: {velocity.avgPrev}/week
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {velocity.weeks.map((w, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                          <div style={{
                            width: 28, height: Math.max(8, w * 14), borderRadius: 4,
                            background: i === 0 ? '#0284c7' : '#bae6fd',
                          }} />
                          <div style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>
                            {i === 0 ? 'Now' : `-${i}w`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Overall progress hero card ── */}
                  <div style={{
                    padding: '28px 24px', borderRadius: 20,
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 40%, #7c3aed 100%)',
                    color: '#fff', textAlign: 'center',
                    boxShadow: '0 4px 24px rgba(37,99,235,0.3)',
                  }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>📈</div>
                    <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800 }}>Your Learning Progress</h2>
                    <p style={{ margin: '0 0 20px', fontSize: 14, opacity: 0.85 }}>
                      Here's a summary of everything you've accomplished and what's coming next.
                    </p>

                    {/* Progress bar */}
                    <div style={{
                      maxWidth: 380, margin: '0 auto', textAlign: 'left',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, fontWeight: 700 }}>
                        <span>{mastered.length} of {allConcepts.length} standards mastered</span>
                        <span>{progressPct}%</span>
                      </div>
                      <div style={{
                        height: 12, background: 'rgba(255,255,255,0.2)', borderRadius: 6, overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', borderRadius: 6, transition: 'width 0.6s ease',
                          width: `${progressPct}%`,
                          background: 'linear-gradient(90deg, #22c55e, #4ade80)',
                        }} />
                      </div>
                    </div>

                    {/* Stat pills */}
                    <div style={{
                      display: 'flex', gap: 8, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap',
                    }}>
                      {[
                        { label: 'Mastered', count: mastered.length, bg: '#22c55e' },
                        { label: 'Proficient', count: proficient.length, bg: '#3b82f6' },
                        { label: 'Developing', count: developing.length, bg: '#f59e0b' },
                        { label: 'Struggling', count: struggling.length, bg: '#ef4444' },
                        { label: 'Not Started', count: notStarted.length, bg: '#94a3b8' },
                      ].map((pill) => (
                        <div key={pill.label} style={{
                          padding: '6px 14px', borderRadius: 20,
                          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)',
                          display: 'flex', alignItems: 'center', gap: 6,
                          fontSize: 12, fontWeight: 700,
                        }}>
                          <span style={{
                            width: 10, height: 10, borderRadius: '50%', background: pill.bg,
                            boxShadow: `0 0 6px ${pill.bg}80`,
                          }} />
                          {pill.count} {pill.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Mastered standards ── */}
                  <div style={{
                    background: '#fff', borderRadius: 16, padding: '20px',
                    border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <span style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16,
                      }}>&#x2705;</span>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Mastered</h3>
                        <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Standards you've conquered (85%+ accuracy)</p>
                      </div>
                    </div>
                    {mastered.length === 0 ? (
                      <div style={{
                        padding: '24px', textAlign: 'center', background: '#f8fafc',
                        borderRadius: 12, border: '1px dashed #e2e8f0',
                      }}>
                        <div style={{ fontSize: 28, marginBottom: 6 }}>🌱</div>
                        <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
                          No mastered standards yet. Focus on one standard, analyze missed steps, and accuracy will rise.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: 8 }}>
                        {mastered.map((c) => (
                          <div key={c.conceptId} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '12px 14px', borderRadius: 10,
                            background: '#f0fdf4', border: '1px solid #bbf7d0',
                          }}>
                            <span style={{
                              padding: '3px 8px', background: '#22c55e', color: '#fff',
                              borderRadius: 6, fontSize: 11, fontWeight: 700, flexShrink: 0,
                            }}>{c.standardCode}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{c.label}</div>
                              <div style={{ fontSize: 11, color: '#065f46' }}>
                                {c.accuracy}% accuracy · {c.stats.correct}/{c.stats.attempts} correct · Best streak: {c.stats.bestStreak}
                              </div>
                            </div>
                            <span style={{ fontSize: 18 }}>&#11088;</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── In progress (Proficient + Developing + Struggling) ── */}
                  <div style={{
                    background: '#fff', borderRadius: 16, padding: '20px',
                    border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <span style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, color: '#fff',
                      }}>&#x1F4AA;</span>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>In Progress</h3>
                        <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Standards you've started working on</p>
                      </div>
                    </div>
                    {inProgress.length === 0 ? (
                      <div style={{
                        padding: '24px', textAlign: 'center', background: '#f8fafc',
                        borderRadius: 12, border: '1px dashed #e2e8f0',
                      }}>
                        <div style={{ fontSize: 28, marginBottom: 6 }}>🎮</div>
                        <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
                          Play some games or take a warm-up to get started!
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: 8 }}>
                        {inProgress
                          .sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0))
                          .map((c) => {
                            const barColor = MASTERY_COLORS[c.level];
                            return (
                              <div key={c.conceptId} style={{
                                padding: '12px 14px', borderRadius: 10,
                                background: '#fff', border: '1px solid #e2e8f0',
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                  <span style={{
                                    padding: '3px 8px', background: '#e8f0fe', color: '#1a5cba',
                                    borderRadius: 6, fontSize: 11, fontWeight: 700, flexShrink: 0,
                                  }}>{c.standardCode}</span>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{c.label}</span>
                                  </div>
                                  <span style={{
                                    padding: '2px 8px', fontSize: 10, fontWeight: 700, borderRadius: 4,
                                    background: barColor + '18', color: barColor,
                                  }}>
                                    {MASTERY_LABELS[c.level]}
                                  </span>
                                </div>
                                {/* Progress bar toward mastery */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                                    <div style={{
                                      height: '100%', borderRadius: 4,
                                      width: `${Math.min(c.accuracy || 0, 100)}%`,
                                      background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
                                      transition: 'width 0.4s ease',
                                    }} />
                                  </div>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: barColor, minWidth: 36, textAlign: 'right' }}>
                                    {c.accuracy}%
                                  </span>
                                </div>
                                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                                  {c.stats.correct}/{c.stats.attempts} correct · Need 85% to master
                                  {c.accuracy >= 65 && c.accuracy < 85 && ' · Rework missed items to push this standard above 85%.'}
                                  {c.accuracy < 40 && ' · Rebuild core setup and operation steps before increasing speed.'}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* ── What's Next — recommended next steps ── */}
                  <div style={{
                    background: '#fff', borderRadius: 16, padding: '20px',
                    border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <span style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16,
                      }}>&#x1F680;</span>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>What's Next</h3>
                        <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Your recommended next steps to keep improving</p>
                      </div>
                    </div>
                    {nextUp.length === 0 && notStarted.length === 0 ? (
                      <div style={{
                        padding: '24px', textAlign: 'center', background: '#fefce8',
                        borderRadius: 12, border: '1px solid #fde68a',
                      }}>
                        <div style={{ fontSize: 28, marginBottom: 6 }}>&#127942;</div>
                        <p style={{ margin: 0, color: '#92400e', fontSize: 13, fontWeight: 600 }}>
                          Strong coverage across standards. Keep deepening accuracy by reviewing any recurring error patterns.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: 10 }}>
                        {nextUp.map((c, idx) => {
                          const level = getMasteryLevel(c.conceptId);
                          const color = MASTERY_COLORS[level];
                          return (
                            <div key={c.conceptId} style={{
                              display: 'flex', alignItems: 'center', gap: 12,
                              padding: '14px 16px', borderRadius: 12,
                              background: idx === 0 ? '#fffbeb' : '#fff',
                              border: idx === 0 ? '2px solid #fbbf24' : '1px solid #e2e8f0',
                            }}>
                              <div style={{
                                width: 30, height: 30, borderRadius: '50%',
                                background: idx === 0 ? 'linear-gradient(135deg, #f59e0b, #f97316)' : '#f1f5f9',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 800, fontSize: 14,
                                color: idx === 0 ? '#fff' : '#64748b', flexShrink: 0,
                              }}>
                                {idx + 1}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                  <span style={{
                                    padding: '2px 7px', background: '#e8f0fe', color: '#1a5cba',
                                    borderRadius: 4, fontSize: 11, fontWeight: 700,
                                  }}>{c.standardCode}</span>
                                  <span style={{
                                    padding: '2px 7px', fontSize: 10, fontWeight: 700, borderRadius: 4,
                                    background: color + '18', color,
                                  }}>
                                    {c.rec?.attempts > 0 ? `${c.rec.accuracy}%` : 'New'}
                                  </span>
                                </div>
                                <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{c.label}</div>
                                <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                                  {c.rec?.attempts > 0
                                    ? `${c.rec.attempts} attempts so far — ${c.rec.accuracy < 65 ? 'needs more practice' : 'almost mastered!'}`
                                    : 'Ready to explore — give it a try!'}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                {getLecture(c.standardCode) && (
                                  <button type="button" onClick={() => {
                                    const lec = getLecture(c.standardCode);
                                    if (lec) setActiveLecture({ lecture: lec, concept: c, teks: c.standardCode });
                                  }} style={{
                                    padding: '8px 12px', borderRadius: 8, border: 'none',
                                    background: '#f3e8ff', color: '#7c3aed',
                                    fontWeight: 700, fontSize: 12, cursor: 'pointer',
                                  }}>
                                    Learn
                                  </button>
                                )}
                                <button type="button" onClick={() => launchWarmUp(c)} style={{
                                  padding: '8px 14px', borderRadius: 8, border: 'none',
                                  background: '#eff6ff', color: '#2563eb',
                                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                                }}>
                                  Warm-Up
                                </button>
                                <button type="button" onClick={() => launchLearnCheckGame(c)} style={{
                                  padding: '8px 14px', borderRadius: 8, border: 'none',
                                  background: idx === 0
                                    ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                                    : '#2563eb',
                                  color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                                  boxShadow: idx === 0 ? '0 2px 8px rgba(37,99,235,0.25)' : 'none',
                                }}>
                                  Practice
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {/* Show not-started standards teaser */}
                        {notStarted.length > 0 && (
                          <div style={{
                            padding: '12px 16px', borderRadius: 10,
                            background: '#f8fafc', border: '1px dashed #cbd5e1',
                            display: 'flex', alignItems: 'center', gap: 10,
                          }}>
                            <span style={{ fontSize: 20 }}>&#x1F30D;</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: 13, color: '#475569' }}>
                                {notStarted.length} more standard{notStarted.length !== 1 ? 's' : ''} to explore
                              </div>
                              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                                {notStarted.slice(0, 3).map((c) => c.standardCode).join(', ')}
                                {notStarted.length > 3 ? ` and ${notStarted.length - 3} more` : ''}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── Recent activity ── */}
                  {recentlyActive.length > 0 && (
                    <div style={{
                      background: '#fff', borderRadius: 16, padding: '20px',
                      border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <span style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16,
                        }}>&#x1F4C5;</span>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Recent Activity</h3>
                          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Standards you worked on this week</p>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gap: 6 }}>
                        {recentlyActive.slice(0, 8).map((c) => {
                          const when = c.stats.lastSeen ? new Date(c.stats.lastSeen) : null;
                          const timeAgo = when ? (() => {
                            const diffH = Math.round((Date.now() - when.getTime()) / 3600000);
                            if (diffH < 1) return 'Just now';
                            if (diffH < 24) return `${diffH}h ago`;
                            return `${Math.round(diffH / 24)}d ago`;
                          })() : '';
                          return (
                            <div key={c.conceptId} style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '10px 12px', borderRadius: 8,
                              background: '#faf5ff', border: '1px solid #ede9fe',
                            }}>
                              <span style={{
                                padding: '2px 7px', background: '#e8f0fe', color: '#1a5cba',
                                borderRadius: 4, fontSize: 11, fontWeight: 700,
                              }}>{c.standardCode}</span>
                              <span style={{ flex: 1, fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{c.label}</span>
                              <span style={{
                                padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                                background: MASTERY_COLORS[c.level] + '18', color: MASTERY_COLORS[c.level],
                              }}>{c.accuracy}%</span>
                              <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 45, textAlign: 'right' }}>{timeAgo}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Quick stats summary ── */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: 10,
                  }}>
                    <StatCard icon="&#x2705;" value={stats.totalCorrect} label="Correct Answers" color="#22c55e" />
                    <StatCard icon="&#x1F4DD;" value={stats.totalAttempts} label="Total Attempts" color="#3b82f6" />
                    <StatCard icon="&#x1F3AF;" value={`${stats.overallAccuracy}%`} label="Overall Accuracy" color="#8b5cf6" />
                    <StatCard icon="&#x26A1;" value={stats.bestStreak} label="Best Streak" color="#f59e0b" />
                  </div>

                  {/* ── Continue button ── */}
                  <div style={{
                    background: 'linear-gradient(135deg, #eff6ff, #f0fdf4)',
                    borderRadius: 16, padding: '24px 20px', textAlign: 'center',
                    border: '1px solid #bfdbfe',
                  }}>
                    <p style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                      {nextUp.length > 0
                        ? `Ready to keep going? Your next focus: ${nextUp[0].label}`
                        : mastered.length > 0
                          ? 'Strong mastery momentum. Pick a new standard and transfer your solving process.'
                          : 'Start your first warm-up or game to track progress!'}
                    </p>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {nextUp.length > 0 ? (
                        <>
                          <button type="button" onClick={() => launchWarmUp(nextUp[0])} style={{
                            padding: '12px 28px', borderRadius: 12, border: 'none',
                            background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                            color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer',
                            boxShadow: '0 3px 12px rgba(245,158,11,0.3)',
                            transition: 'transform 0.15s',
                          }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            Start Warm-Up
                          </button>
                          <button type="button" onClick={() => launchLearnCheckGame(nextUp[0])} style={{
                            padding: '12px 28px', borderRadius: 12, border: 'none',
                            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                            color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer',
                            boxShadow: '0 3px 12px rgba(37,99,235,0.3)',
                            transition: 'transform 0.15s',
                          }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            Continue Practicing
                          </button>
                        </>
                      ) : (
                        <button type="button" onClick={() => setTab('warmups')} style={{
                          padding: '12px 28px', borderRadius: 12, border: 'none',
                          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                          color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer',
                          boxShadow: '0 3px 12px rgba(37,99,235,0.3)',
                        }}>
                          Explore Warm-Ups
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ════════════════════════════════════════════
                WARM-UPS TAB
                ════════════════════════════════════════════ */}
            {tab === 'warmups' && (
              <div style={{ display: 'grid', gap: 16 }}>
                {/* Warm-up intro card */}
                <div style={{
                  padding: '22px 22px', borderRadius: 18,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)',
                  color: '#fff', textAlign: 'center',
                  boxShadow: '0 4px 20px rgba(245,158,11,0.25)',
                }}>
                  <div style={{ fontSize: 36, marginBottom: 6 }}>🔥</div>
                  <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800 }}>Quick Warm-Up Assessments</h2>
                  <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>
                    5 quick questions per standard to check your understanding. Pick a standard below!
                  </p>
                </div>

                {/* List available warm-ups by standard */}
                {availableWarmUps.length === 0 ? (
                  <div style={{
                    padding: 32, textAlign: 'center', background: '#fff', borderRadius: 14,
                    border: '1px solid #f1f5f9',
                  }}>
                    <div style={{ fontSize: 40, marginBottom: 8, opacity: 0.7 }}>📝</div>
                    <p style={{ color: '#475569', fontWeight: 600, margin: 0 }}>
                      No warm-up assessments available yet.
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* Group by grade-level prefix */}
                    {(() => {
                      const teksPrefix = gradeId === 'algebra' || gradeId === 'grade9' ? 'A.' : gradeId === 'grade10' ? 'G.' : gradeId === 'grade11' ? '2A.' : (gradeId === 'grade1' ? '1.' : gradeId === 'grade2' ? '2.' : gradeId === 'grade4' ? '4.' : gradeId === 'grade5' ? '5.' : gradeId === 'grade6' ? '6.' : gradeId === 'grade7' ? '7.' : gradeId === 'grade8' ? '8.' : '3.');
                      const isGrade48 = gradeId === 'grade4-8';
                      const gradeStandards = availableWarmUps.filter((w) =>
                        isGrade48 ? /^[45678]\./.test(w.teks) : (gradeId === 'algebra' ? w.teks.startsWith('A.') : w.teks.startsWith(teksPrefix))
                      );
                      const otherStandards = availableWarmUps.filter((w) =>
                        isGrade48 ? !/^[45678]\./.test(w.teks) : (gradeId === 'algebra' ? !w.teks.startsWith('A.') : !w.teks.startsWith(teksPrefix))
                      );

                      const renderGroup = (items, title) => {
                        if (items.length === 0) return null;
                        // Match to concepts to get labels
                        return (
                          <div key={title} style={{ marginBottom: 16 }}>
                            {title && (
                              <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: '#475569' }}>
                                {title}
                              </h3>
                            )}
                            <div style={{ display: 'grid', gap: 8 }}>
                              {items.map((w) => {
                                // Find a matching concept
                                const matchedConcept = allConcepts.find((c) => c.standardCode === w.teks);
                                const masteryLevel = matchedConcept ? getMasteryLevel(matchedConcept.conceptId) : 'not-started';
                                const accuracy = matchedConcept ? getAccuracy(matchedConcept.conceptId) : null;
                                const mcCount = w.count;
                                const masteryColor = MASTERY_COLORS[masteryLevel];

                                return (
                                  <div key={w.teks} style={{
                                    display: 'flex', alignItems: 'center', gap: 14,
                                    padding: '14px 16px', borderRadius: 14, background: '#fff',
                                    border: '1px solid #f1f5f9',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                                    transition: 'box-shadow 0.15s',
                                  }}>
                                    {/* Mastery indicator */}
                                    <div style={{
                                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                                      background: masteryLevel !== 'not-started'
                                        ? masteryColor + '18'
                                        : 'linear-gradient(135deg, #fef3c7, #fed7aa)',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      border: masteryLevel !== 'not-started' ? `2px solid ${masteryColor}` : '2px solid #fbbf24',
                                    }}>
                                      {masteryLevel !== 'not-started' ? (
                                        <span style={{ fontSize: 14, fontWeight: 800, color: masteryColor }}>
                                          {accuracy}%
                                        </span>
                                      ) : (
                                        <span style={{ fontSize: 18 }}>🔥</span>
                                      )}
                                    </div>

                                    {/* Standard info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                        <span style={{
                                          padding: '2px 7px', background: '#e8f0fe', color: '#1a5cba',
                                          borderRadius: 4, fontSize: 11, fontWeight: 700,
                                        }}>TEKS {w.teks}</span>
                                        {masteryLevel !== 'not-started' && (
                                          <span style={{
                                            padding: '2px 7px', background: masteryColor + '18',
                                            color: masteryColor, borderRadius: 4, fontSize: 10, fontWeight: 700,
                                          }}>
                                            {MASTERY_LABELS[masteryLevel]}
                                          </span>
                                        )}
                                      </div>
                                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                                        {matchedConcept?.label || w.teks}
                                      </p>
                                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>
                                        {mcCount} questions available · ~2 min
                                      </p>
                                    </div>

                                    {/* Action buttons */}
                                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                      {getLecture(w.teks) && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const lec = getLecture(w.teks);
                                            if (lec) setActiveLecture({ lecture: lec, concept: matchedConcept, teks: w.teks });
                                          }}
                                          style={{
                                            padding: '10px 14px', borderRadius: 10, border: 'none',
                                            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                                            color: '#fff', fontWeight: 700, fontSize: 13,
                                            cursor: 'pointer', whiteSpace: 'nowrap',
                                            boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
                                            transition: 'transform 0.15s',
                                          }}
                                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                          title="Watch a short lesson first"
                                        >
                                          📚 Learn
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const params = new URLSearchParams();
                                          params.set('teks', w.teks);
                                          params.set('grade', gradeId);
                                          if (matchedConcept) {
                                            params.set('label', matchedConcept.label);
                                            params.set('concept', matchedConcept.conceptId);
                                          }
                                          if (studentId) params.set('sid', studentId);
                                          if (joinedClass?.id) params.set('cid', joinedClass.id);
                                          navigate('/warmup?' + params.toString());
                                        }}
                                        style={{
                                          padding: '10px 18px', borderRadius: 10, border: 'none',
                                          background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                                          color: '#fff', fontWeight: 700, fontSize: 13,
                                          cursor: 'pointer', whiteSpace: 'nowrap',
                                          boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
                                          transition: 'transform 0.15s',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                      >
                                        Start
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      };

                      return (
                        <>
                          {renderGroup(gradeStandards, gradeId === 'grade4-8' ? 'TExES Math 4-8 Standards' : gradeId === 'algebra' ? 'Algebra I Standards' : `Grade ${gradeId === 'grade1' ? '1' : gradeId === 'grade2' ? '2' : gradeId === 'grade4' ? '4' : gradeId === 'grade5' ? '5' : gradeId === 'grade6' ? '6' : gradeId === 'grade7' ? '7' : gradeId === 'grade8' ? '8' : gradeId === 'grade9' ? '9' : gradeId === 'grade10' ? '10' : gradeId === 'grade11' ? '11' : '3'} Standards`)}
                          {renderGroup(otherStandards, otherStandards.length > 0 ? 'Other Standards' : null)}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════
                MY GAMES TAB
                ════════════════════════════════════════════ */}
            {tab === 'games' && (
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 12, color: '#0f172a' }}>
                  Assigned Games
                </h2>
                {assignments.length === 0 ? (
                  <div style={{
                    padding: 40, textAlign: 'center', background: '#fff', borderRadius: 16,
                    border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                  }}>
                    <div style={{ fontSize: 48, marginBottom: 10, opacity: 0.8 }}>📋</div>
                    <p style={{ color: '#475569', fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>
                      No games assigned yet
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
                      Your teacher will assign games soon. Meanwhile, explore the Practice tab!
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {assignments.map((a) => {
                      const game = GAMES_CATALOG.find((g) => g.id === a.gameId);
                      const playLink = buildPlayLink(a);
                      const emoji = game?.id === 'math-match' ? '🃏' : game?.id === 'q-blocks' ? '🧱' : game?.id === 'algebra-sprint' ? '📐' : '⚡';
                      return (
                        <div key={a.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '16px 18px', borderRadius: 14, background: '#fff',
                          border: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 12,
                          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                          transition: 'box-shadow 0.15s',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                            <div style={{
                              width: 44, height: 44, borderRadius: 12,
                              background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 22, flexShrink: 0,
                            }}>
                              {emoji}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{a.name}</p>
                              {game && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>{game.description?.slice(0, 60)}...</p>}
                              {a.teks?.length > 0 && (
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                                  {a.teks.slice(0, 3).map((t) => (
                                    <span key={t} style={{
                                      padding: '1px 6px', background: '#e8f0fe', color: '#2563eb',
                                      borderRadius: 4, fontSize: 10, fontWeight: 700,
                                    }}>{t}</span>
                                  ))}
                                  {a.teks.length > 3 && (
                                    <span style={{ fontSize: 10, color: '#94a3b8' }}>+{a.teks.length - 3}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <Link
                            to={playLink || a.gamePath || '/games'}
                            style={{
                              padding: '10px 22px',
                              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                              color: 'white', borderRadius: 10, textDecoration: 'none',
                              fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap',
                              boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                              transition: 'transform 0.15s',
                            }}
                          >
                            ▶ Play
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={{
                  marginTop: 16, padding: 16, background: '#fff', borderRadius: 12,
                  border: '1px solid #f1f5f9', textAlign: 'center',
                }}>
                  <Link to="/games" style={{
                    color: '#2563eb', fontWeight: 700, fontSize: 14, textDecoration: 'none',
                  }}>
                    🎮 Browse All Games
                  </Link>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════
                PRACTICE TAB
                ════════════════════════════════════════════ */}
            {tab === 'practice' && (
              <div style={{ display: 'grid', gap: 20 }}>
                {/* Certification Exam Prep */}
                <div style={{ display: 'grid', gap: 10 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 0, color: '#0f172a' }}>
                    Certification Exam Prep
                  </h2>
                  <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
                    Prepare for your teaching certification exams with structured practice by competency and standard.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <Link to="/texes-prep?exam=math712" style={{
                      padding: '18px 16px', borderRadius: 14, textDecoration: 'none',
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff',
                      boxShadow: '0 2px 10px rgba(37,99,235,0.3)', display: 'flex', flexDirection: 'column', gap: 4,
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.5 }}>TExES</span>
                      <span style={{ fontSize: 15, fontWeight: 800 }}>Math 7-12</span>
                      <span style={{ fontSize: 11, opacity: 0.7 }}>6 domains · 21 competencies</span>
                    </Link>
                    <Link to="/texes-prep?exam=math48" style={{
                      padding: '18px 16px', borderRadius: 14, textDecoration: 'none',
                      background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff',
                      boxShadow: '0 2px 10px rgba(124,58,237,0.3)', display: 'flex', flexDirection: 'column', gap: 4,
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.5 }}>TExES</span>
                      <span style={{ fontSize: 15, fontWeight: 800 }}>Math 4-8</span>
                      <span style={{ fontSize: 11, opacity: 0.7 }}>6 domains · 18 standards</span>
                    </Link>
                    <Link to="/texes-prep?exam=linearAlgebra" style={{
                      padding: '18px 16px', borderRadius: 14, textDecoration: 'none',
                      background: 'linear-gradient(135deg, #059669, #047857)', color: '#fff',
                      boxShadow: '0 2px 10px rgba(5,150,105,0.3)', display: 'flex', flexDirection: 'column', gap: 4,
                      gridColumn: '1 / -1',
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Course</span>
                      <span style={{ fontSize: 15, fontWeight: 800 }}>Linear Algebra</span>
                      <span style={{ fontSize: 11, opacity: 0.7 }}>6 domains · 12 topics · vectors, matrices, eigenvalues & SVD</span>
                    </Link>
                  </div>
                  <Link to="/texes-prep" style={{
                    display: 'block', padding: '10px 16px', borderRadius: 10, textDecoration: 'none',
                    background: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center',
                    fontSize: 13, fontWeight: 700, color: '#2563eb',
                  }}>
                    View all certification exams →
                  </Link>
                </div>

                {/* Recommendations */}
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 4, color: '#0f172a' }}>
                    Recommended for You
                  </h2>
                  <p style={{ color: '#64748b', fontSize: 13, marginBottom: 14, marginTop: 0 }}>
                    Concepts that need the most attention based on your performance.
                  </p>
                  {recommendations.length === 0 ? (
                    <div style={{
                      padding: 32, textAlign: 'center', background: '#fff', borderRadius: 14,
                      border: '1px solid #f1f5f9',
                    }}>
                      <div style={{ fontSize: 40, marginBottom: 8 }}>🌱</div>
                      <p style={{ color: '#475569', fontWeight: 600, margin: 0 }}>
                        Play some games first so we can personalize your recommendations!
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: 8 }}>
                      {recommendations.slice(0, 5).map((rec) => {
                        const concept = allConcepts.find((c) => c.conceptId === rec.conceptId);
                        if (!concept) return null;
                        const level = getMasteryLevel(rec.conceptId);
                        const color = MASTERY_COLORS[level];
                        return (
                          <div key={rec.conceptId} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '14px 16px', borderRadius: 12, background: '#fff',
                            border: '1px solid #f1f5f9', gap: 12,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                          }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                                <span style={{
                                  padding: '2px 7px', background: '#e8f0fe', color: '#1a5cba',
                                  borderRadius: 4, fontSize: 11, fontWeight: 700,
                                }}>{concept.standardCode}</span>
                                <span style={{
                                  padding: '2px 7px', background: color + '18',
                                  color, borderRadius: 4, fontSize: 10, fontWeight: 700,
                                }}>
                                  {rec.attempts > 0 ? `${rec.accuracy}% \u00B7 ${MASTERY_LABELS[level]}` : 'Not started'}
                                </span>
                              </div>
                              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#1e293b' }}>
                                {concept.label}
                              </p>
                              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                                {rec.attempts > 0
                                  ? `${rec.attempts} attempts \u00B7 Last seen ${rec.daysSinceSeen}d ago`
                                  : 'Ready to start \u2014 give it a try!'}
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                              {getLecture(concept.standardCode) && (
                                <button type="button" onClick={() => {
                                  const lec = getLecture(concept.standardCode);
                                  if (lec) setActiveLecture({ lecture: lec, concept, teks: concept.standardCode });
                                }} style={{
                                  padding: '10px 14px',
                                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                                  color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer',
                                  fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap',
                                  boxShadow: '0 2px 6px rgba(124,58,237,0.25)',
                                }}>
                                  📚 Learn
                                </button>
                              )}
                              <button type="button" onClick={() => launchLearnCheckGame(concept)} style={{
                                padding: '10px 18px',
                                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer',
                                fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap',
                                boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
                              }}>
                                Practice
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Concept picker */}
                <div style={{
                  background: '#fff', borderRadius: 16, padding: '20px 20px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9',
                }}>
                  <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 4, color: '#0f172a', marginTop: 0 }}>
                    Choose What to Practice
                  </h2>
                  <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16, marginTop: 0 }}>
                    Pick a topic and start a focused practice session.
                  </p>
                  <ConceptPicker
                    defaultGrade={gradeId}
                    showMastery={true}
                    showGameCount={true}
                    onSelect={launchConcept}
                  />
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════
                AWARDS TAB
                ════════════════════════════════════════════ */}
            {tab === 'awards' && (
              <div>
                <div style={{
                  textAlign: 'center', marginBottom: 20, padding: '20px',
                  background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                  borderRadius: 16, border: '1px solid #fcd34d',
                }}>
                  <div style={{ fontSize: 36, marginBottom: 4 }}>🏆</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#92400e' }}>
                    {earnedAchievements.length} / {ACHIEVEMENTS.length}
                  </div>
                  <div style={{ fontSize: 14, color: '#a16207', fontWeight: 600 }}>Awards Earned</div>
                </div>

                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
                  gap: 10,
                }}>
                  {ACHIEVEMENTS.map((achievement) => {
                    const earned = achievement.check(stats);
                    return (
                      <div key={achievement.id} style={{
                        padding: '18px 14px', textAlign: 'center', borderRadius: 14,
                        background: earned ? '#fff' : '#f8fafc',
                        border: earned ? '2px solid #fbbf24' : '1px solid #e2e8f0',
                        opacity: earned ? 1 : 0.55,
                        boxShadow: earned ? '0 2px 8px rgba(251,191,36,0.2)' : 'none',
                        transition: 'all 0.2s',
                      }}>
                        <div style={{
                          fontSize: 32, marginBottom: 6,
                          filter: earned ? 'none' : 'grayscale(1)',
                        }}>
                          {achievement.icon}
                        </div>
                        <div style={{
                          fontSize: 13, fontWeight: 800,
                          color: earned ? '#0f172a' : '#94a3b8',
                          marginBottom: 2,
                        }}>
                          {achievement.label}
                        </div>
                        <div style={{
                          fontSize: 11,
                          color: earned ? '#64748b' : '#cbd5e1',
                        }}>
                          {achievement.desc}
                        </div>
                        {earned && (
                          <div style={{
                            marginTop: 6, fontSize: 10, fontWeight: 700,
                            color: '#d97706', textTransform: 'uppercase', letterSpacing: 0.5,
                          }}>
                            Earned!
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════
                GAMIFICATION HUB TAB
                ════════════════════════════════════════════ */}
            {tab === 'gamification' && (
              <GamificationHub
                studentId={studentId}
                classId={joinedClass?.id}
                stats={{
                  ...stats,
                  currentStreak: currentStreak,
                  gamesCompleted: Math.ceil((stats.totalAttempts || 0) / 10),
                  hasClass: !!joinedClass,
                  discussionReplies: 0,
                  weakAreas: stats.strugglingCount > 0 ? 'struggling concepts' : '',
                }}
                gradeId={gradeId}
              />
            )}

            {/* ════════════════════════════════════════════
                AI TEACHING AGENT TAB
                ════════════════════════════════════════════ */}
            {tab === 'ai-tutor' && (
              <AITutor
                studentProfile={{
                  accuracy: stats.overallAccuracy || 0,
                  masteredCount: stats.masteredCount || 0,
                  weakAreas: allConcepts.filter((c) => getMasteryLevel(c.conceptId) === 'struggling').map((c) => c.name).slice(0, 3).join(', '),
                  streak: currentStreak || 0,
                  level: levelInfo?.level || 1,
                }}
                gradeId={gradeId || 'Grade 3'}
                onXPEarned={(amount) => {
                  try { gamificationAwardXP(studentId, 'tutorLesson', amount); } catch (err) { console.warn('XP award failed:', err); }
                }}
              />
            )}

            {/* ── Footer ── */}
            <div style={{
              marginTop: 24, padding: '14px 16px', background: '#fff', borderRadius: 12,
              border: '1px solid #f1f5f9', textAlign: 'center',
            }}>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                Want to explore more? Visit the{' '}
                <Link to="/games" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
                  Games Library
                </Link>.
              </p>
            </div>
            </div>
          </div>
          </>
        )}
      </div>

      {/* ── MiniLesson Modal (Learn step) ── */}
      {activeLecture && (
        <MiniLesson
          lecture={activeLecture.lecture}
          flow={activeLecture.flow}
          onClose={() => setActiveLecture(null)}
          onPractice={activeLecture.concept && activeLecture.flow !== 'learn-check-game' ? () => {
            setActiveLecture(null);
            launchConcept(activeLecture.concept);
          } : undefined}
          onWarmUp={activeLecture.teks ? () => {
            setActiveLecture(null);
            const params = new URLSearchParams();
            params.set('teks', activeLecture.teks);
            params.set('grade', gradeId);
            if (activeLecture.concept) {
              params.set('label', activeLecture.concept.label);
              params.set('concept', activeLecture.concept.conceptId);
            }
            if (studentId) params.set('sid', studentId);
            if (joinedClass?.id) params.set('cid', joinedClass.id);
            navigate('/warmup?' + params.toString());
          } : undefined}
        />
      )}

      {/* ── No-lecture concept card: intro video + explain → then "Take the check" (Learn → Check → Game) ── */}
      {activeConceptCheck && (() => {
        const teks = activeConceptCheck.concept?.standardCode || activeConceptCheck.teks || '';
        const is712 = /^[78]\.|^A\.|^G\.|^2A\./.test(teks) || gradeId === 'grade7-12';
        const introVideo = is712 ? 'https://www.youtube.com/embed/CLWpkv6ccpA' : 'https://www.youtube.com/embed/jxA8MffVmPs';
        return (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
          onClick={() => setActiveConceptCheck(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 520, width: '100%', background: '#fff', borderRadius: 20,
              boxShadow: '0 24px 80px rgba(0,0,0,0.2)', padding: 0, overflow: 'hidden',
            }}
          >
            <div style={{ padding: '20px 28px 0' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0369a1', marginBottom: 8 }}>
                Learn → Check → Game
              </div>
              <h3 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                {activeConceptCheck.concept.label}
              </h3>
            </div>
            {/* Quick intro video — always show so 7-12 users see video first */}
            <div style={{ padding: '0 28px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>
                Quick intro
              </div>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 12, overflow: 'hidden', background: '#0f172a' }}>
                <iframe
                  title="Quick intro"
                  src={introVideo + '?rel=0'}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
            <p style={{ margin: '0 28px 20px', fontSize: 15, color: '#475569', lineHeight: 1.6 }}>
              Take a quick check to see how well you know this. Based on your results we&apos;ll suggest an easy practice game to build skills, or a harder challenge to stretch you.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: '0 28px 28px' }}>
              <button
                type="button"
                onClick={() => goToWarmUpFromConcept(activeConceptCheck.concept, activeConceptCheck.teks)}
                style={{
                  flex: 1, minWidth: 140, padding: '14px 20px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                  color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                }}
              >
                Take the check
              </button>
              <button
                type="button"
                onClick={() => setActiveConceptCheck(null)}
                style={{
                  padding: '14px 20px', borderRadius: 12, border: '1px solid #e2e8f0',
                  background: '#fff', color: '#64748b', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
};

export default Student;
