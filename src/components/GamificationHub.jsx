/**
 * Gamification Hub — XP progress, achievements, leaderboard,
 * streak tracker, skill tree, peer competition, AI challenges.
 */
import React, { useState, useMemo, useEffect } from 'react';
import {
  ACHIEVEMENTS, TIER_COLORS, getLevel, getEarnedAchievements,
  checkAndUnlockAchievements, getClassLeaderboard, getWeeklyLeaderboard,
  getDailyStreak, recordDailyLogin, awardXP, getPlayerXP,
  recordChallenge, getChallengeCount, LEVEL_COLORS,
} from '../utils/gamification';

export default function GamificationHub({ studentId, classId, stats, gradeId }) {
  const [section, setSection] = useState('overview');
  const [newUnlocks, setNewUnlocks] = useState([]);
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [challenge, setChallenge] = useState(null);
  const [challengeAnswer, setChallengeAnswer] = useState('');
  const [challengeResult, setChallengeResult] = useState(null);

  // Record daily login & check achievements on mount
  useEffect(() => {
    if (studentId) {
      recordDailyLogin(studentId);
      const unlocked = checkAndUnlockAchievements(studentId, {
        ...stats,
        currentStreak: getDailyStreak(studentId),
        gamesCompleted: stats.totalAttempts > 0 ? Math.ceil(stats.totalAttempts / 10) : 0,
        hasClass: !!classId,
        discussionReplies: stats.discussionReplies || 0,
        challengesCompleted: getChallengeCount(studentId),
      });
      if (unlocked.length > 0) setNewUnlocks(unlocked);
    }
  }, [studentId]);

  const xp = useMemo(() => getPlayerXP(studentId), [studentId, newUnlocks, challengeResult]);
  const levelInfo = useMemo(() => getLevel(xp), [xp]);
  const earned = useMemo(() => getEarnedAchievements(studentId), [studentId, newUnlocks]);
  const streak = useMemo(() => getDailyStreak(studentId), [studentId]);
  const leaderboard = useMemo(() => classId ? getClassLeaderboard(classId) : [], [classId, xp]);
  const weeklyBoard = useMemo(() => classId ? getWeeklyLeaderboard(classId) : [], [classId, xp]);

  const myRank = leaderboard.findIndex((s) => s.id === studentId) + 1;

  // AI Adaptive Challenge
  const fetchChallenge = async () => {
    setChallengeLoading(true);
    setChallenge(null);
    setChallengeResult(null);
    setChallengeAnswer('');
    try {
      const resp = await fetch('/api/adaptive-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel: gradeId || 'grade3',
          accuracy: stats.overallAccuracy || 50,
          masteredCount: stats.masteredCount || 0,
          level: levelInfo.level,
          weakAreas: stats.weakAreas || '',
        }),
      });
      const data = await resp.json();
      if (data.challenge) setChallenge(data.challenge);
      else setChallenge({ question: data.rawChallenge || 'AI challenge unavailable.', options: [], correct: '', hint: '', xpReward: 20 });
    } catch (err) {
      console.warn('Gamification challenge load failed:', err);
      setChallenge({ question: 'Could not load challenge. Check your connection.', options: [], correct: '', hint: '', xpReward: 0 });
    }
    setChallengeLoading(false);
  };

  const submitChallenge = () => {
    if (!challenge || !challengeAnswer) return;
    const isCorrect = challengeAnswer === challenge.correct;
    const xpEarned = isCorrect ? (challenge.xpReward || 20) : 5;
    awardXP(studentId, 'challengeCompleted', xpEarned);
    if (isCorrect && challenge.xpReward >= 40) awardXP(studentId, 'challengePerfect', 0);
    recordChallenge(studentId, { correct: isCorrect, xpEarned, level: levelInfo.level });
    setChallengeResult({ correct: isCorrect, xpEarned });
    checkAndUnlockAchievements(studentId, {
      ...stats,
      currentStreak: streak,
      gamesCompleted: Math.ceil((stats.totalAttempts || 0) / 10),
      hasClass: !!classId,
      discussionReplies: stats.discussionReplies || 0,
      challengesCompleted: getChallengeCount(studentId),
    });
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: '\u2B50' },
    { id: 'achievements', label: 'Achievements', icon: '\uD83C\uDFC6' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '\uD83D\uDCC8' },
    { id: 'challenge', label: 'AI Challenge', icon: '\u26A1' },
  ];

  return (
    <div>
      {/* Unlock notification */}
      {newUnlocks.length > 0 && (
        <div style={{
          padding: 16, borderRadius: 14, marginBottom: 16,
          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          color: '#78350f', animation: 'fadeInSlide 0.4s ease-out',
        }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>{'\uD83C\uDF89'} Achievement Unlocked!</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {newUnlocks.map((a) => (
              <span key={a.id} style={{
                padding: '4px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.5)',
                fontSize: 13, fontWeight: 700,
              }}>{a.icon} {a.label} (+{a.xp} XP)</span>
            ))}
          </div>
          <button type="button" onClick={() => setNewUnlocks([])} style={{
            marginTop: 8, padding: '4px 12px', borderRadius: 6, border: 'none',
            background: 'rgba(120,53,15,0.2)', color: '#78350f', fontSize: 11, fontWeight: 700, cursor: 'pointer',
          }}>Dismiss</button>
        </div>
      )}

      {/* XP Hero Bar */}
      <div style={{
        padding: '20px 24px', borderRadius: 16, marginBottom: 16,
        background: `linear-gradient(135deg, ${levelInfo.color}dd, ${levelInfo.color}88)`,
        color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -20, fontSize: 120, opacity: 0.08, fontWeight: 900 }}>{levelInfo.level}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 900, border: '3px solid rgba(255,255,255,0.3)',
          }}>{levelInfo.level}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{levelInfo.title}</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>
              {levelInfo.xp} / {levelInfo.nextXp} XP
              {streak > 0 && <span> {'\u00B7'} {'\uD83D\uDD25'} {streak} day streak</span>}
              {myRank > 0 && <span> {'\u00B7'} #{myRank} in class</span>}
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${levelInfo.progress}%`,
                background: 'rgba(255,255,255,0.7)', borderRadius: 4,
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 14, position: 'relative', zIndex: 1 }}>
          {[
            { label: 'Achievements', value: `${earned.size}/${ACHIEVEMENTS.length}` },
            { label: 'Mastered', value: stats.masteredCount || 0 },
            { label: 'Accuracy', value: `${stats.overallAccuracy || 0}%` },
            { label: 'Challenges', value: getChallengeCount(studentId) },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section tabs */}
      <div role="tablist" aria-label="Gamification sections" style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {sections.map((s) => (
          <button key={s.id} type="button" role="tab" aria-selected={section === s.id} tabIndex={section === s.id ? 0 : -1}
            onClick={() => setSection(s.id)} style={{
            padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            border: section === s.id ? '2px solid #0f172a' : '1px solid #e2e8f0',
            background: section === s.id ? '#0f172a' : '#fff',
            color: section === s.id ? '#fff' : '#475569',
            display: 'flex', alignItems: 'center', gap: 5,
          }}><span>{s.icon}</span> {s.label}</button>
        ))}
      </div>

      {/* ═══ OVERVIEW ═══ */}
      {section === 'overview' && (
        <div style={{ display: 'grid', gap: 12 }}>
          {/* Streak tracker */}
          <div style={{ padding: 18, borderRadius: 14, background: '#fff', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800 }}>{'\uD83D\uDD25'} Daily Streak</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: streak >= 7 ? 'linear-gradient(135deg, #ef4444, #f59e0b)' : streak >= 3 ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' : '#f1f5f9',
                fontSize: 24, fontWeight: 900, color: streak > 0 ? '#fff' : '#94a3b8',
              }}>{streak}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>
                  {streak === 0 ? 'Start your streak today!' : `${streak} day${streak !== 1 ? 's' : ''} strong!`}
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {streak < 3 && 'Reach 3 days for a bonus!'}
                  {streak >= 3 && streak < 7 && 'Keep going to 7 for a bigger reward!'}
                  {streak >= 7 && streak < 14 && '2 weeks will unlock a special badge!'}
                  {streak >= 14 && streak < 30 && 'Almost a month! 30-day legends get 250 XP!'}
                  {streak >= 30 && 'Incredible dedication! You are a legend!'}
                </div>
              </div>
            </div>
            {/* Milestone markers */}
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              {[3, 7, 14, 30].map((m) => (
                <div key={m} style={{
                  flex: 1, padding: '6px 0', borderRadius: 6, textAlign: 'center', fontSize: 11, fontWeight: 700,
                  background: streak >= m ? '#dcfce7' : '#f8fafc',
                  color: streak >= m ? '#166534' : '#94a3b8',
                  border: `1px solid ${streak >= m ? '#bbf7d0' : '#e2e8f0'}`,
                }}>
                  {streak >= m ? '\u2713' : ''} {m}d
                </div>
              ))}
            </div>
          </div>

          {/* Recent achievements */}
          <div style={{ padding: 18, borderRadius: 14, background: '#fff', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>{'\uD83C\uDFC6'} Achievements ({earned.size}/{ACHIEVEMENTS.length})</h4>
              <button type="button" onClick={() => setSection('achievements')} style={{
                padding: '4px 10px', borderRadius: 5, border: '1px solid #e2e8f0', background: '#fff',
                fontSize: 11, fontWeight: 600, color: '#64748b', cursor: 'pointer',
              }}>View All</button>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {ACHIEVEMENTS.filter((a) => earned.has(a.id)).slice(-8).map((a) => (
                <span key={a.id} title={a.desc} style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                  background: TIER_COLORS[a.tier]?.bg || '#f8fafc',
                  color: TIER_COLORS[a.tier]?.text || '#475569',
                  border: `1px solid ${TIER_COLORS[a.tier]?.border || '#e2e8f0'}`,
                }}>{a.icon} {a.label}</span>
              ))}
              {earned.size === 0 && <span style={{ color: '#94a3b8', fontSize: 12 }}>Play games to unlock achievements!</span>}
            </div>
          </div>

          {/* Quick leaderboard preview */}
          {leaderboard.length > 0 && (
            <div style={{ padding: 18, borderRadius: 14, background: '#fff', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800 }}>{'\uD83D\uDCC8'} Class Ranking</h4>
              {leaderboard.slice(0, 5).map((s, i) => {
                const isMe = s.id === studentId;
                return (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px',
                    borderRadius: 6, background: isMe ? '#eff6ff' : 'transparent',
                    marginBottom: 2,
                  }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 12,
                      background: i === 0 ? '#fbbf24' : i === 1 ? '#cbd5e1' : i === 2 ? '#d97706' : '#f1f5f9',
                      color: i < 3 ? '#fff' : '#64748b',
                    }}>{i + 1}</span>
                    <span style={{ flex: 1, fontWeight: isMe ? 700 : 500, fontSize: 13, color: '#0f172a' }}>
                      {s.name}{isMe ? ' (You)' : ''}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.xp} XP</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>Lv{s.level}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ ACHIEVEMENTS ═══ */}
      {section === 'achievements' && (
        <div style={{ display: 'grid', gap: 8 }}>
          {['bronze', 'silver', 'gold', 'platinum'].map((tier) => {
            const tierAchs = ACHIEVEMENTS.filter((a) => a.tier === tier);
            const tc = TIER_COLORS[tier];
            return (
              <div key={tier}>
                <h4 style={{ margin: '12px 0 8px', fontSize: 13, fontWeight: 700, color: tc.text, textTransform: 'capitalize' }}>
                  {tier} Tier ({tierAchs.filter((a) => earned.has(a.id)).length}/{tierAchs.length})
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                  {tierAchs.map((a) => {
                    const unlocked = earned.has(a.id);
                    return (
                      <div key={a.id} style={{
                        padding: '12px 14px', borderRadius: 10,
                        background: unlocked ? tc.bg : '#f8fafc',
                        border: `1px solid ${unlocked ? tc.border : '#e2e8f0'}`,
                        opacity: unlocked ? 1 : 0.6,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 20 }}>{unlocked ? a.icon : '\uD83D\uDD12'}</span>
                          <span style={{ fontWeight: 700, fontSize: 13, color: unlocked ? tc.text : '#94a3b8' }}>{a.label}</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{a.desc}</div>
                        <div style={{ fontSize: 10, color: unlocked ? tc.text : '#cbd5e1', fontWeight: 700, marginTop: 4 }}>+{a.xp} XP</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ LEADERBOARD ═══ */}
      {section === 'leaderboard' && (
        <div>
          {/* Podium */}
          {leaderboard.length >= 3 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 12, marginBottom: 20, padding: '0 20px' }}>
              {[1, 0, 2].map((rank) => {
                const s = leaderboard[rank];
                if (!s) return null;
                const heights = [140, 100, 80];
                const colors = ['#fbbf24', '#cbd5e1', '#d97706'];
                return (
                  <div key={rank} style={{ textAlign: 'center', flex: 1, maxWidth: 120 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>{s.xp} XP · Lv{s.level}</div>
                    <div style={{
                      height: heights[rank], borderRadius: '10px 10px 0 0',
                      background: `linear-gradient(180deg, ${colors[rank]}, ${colors[rank]}88)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, fontWeight: 900, color: '#fff',
                    }}>
                      {rank === 0 ? '\uD83E\uDD47' : rank === 1 ? '\uD83E\uDD48' : '\uD83E\uDD49'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full list */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: 6, padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
              <button type="button" onClick={() => {}} style={{ padding: '4px 10px', borderRadius: 5, border: '2px solid #0f172a', background: '#0f172a', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>All Time</button>
              <button type="button" style={{ padding: '4px 10px', borderRadius: 5, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>This Week</button>
            </div>
            {leaderboard.map((s, i) => {
              const isMe = s.id === studentId;
              return (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                  borderBottom: '1px solid #f1f5f9',
                  background: isMe ? '#eff6ff' : 'transparent',
                }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 12,
                    background: i < 3 ? ['#fbbf24', '#e2e8f0', '#d97706'][i] : '#f1f5f9',
                    color: i < 3 ? '#fff' : '#64748b',
                  }}>{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: isMe ? 700 : 500, fontSize: 13, color: '#0f172a' }}>{s.name}{isMe ? ' (You)' : ''}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{s.title} · {s.achievements} badges · {s.streak}d streak</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: s.color }}>{s.xp}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>XP</div>
                  </div>
                </div>
              );
            })}
            {leaderboard.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Join a class to see the leaderboard!</div>}
          </div>
        </div>
      )}

      {/* ═══ AI CHALLENGE ═══ */}
      {section === 'challenge' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800 }}>{'\u26A1'} AI Adaptive Challenge</h4>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                Get a personalized challenge based on your level and weak areas. Earn bonus XP!
              </p>
            </div>
            <button type="button" onClick={fetchChallenge} disabled={challengeLoading} style={{
              padding: '10px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700,
              background: challengeLoading ? '#94a3b8' : 'linear-gradient(135deg, #7c3aed, #2563eb)',
              color: '#fff', cursor: challengeLoading ? 'wait' : 'pointer',
            }}>
              {challengeLoading ? 'Generating...' : challenge ? 'New Challenge' : 'Get Challenge'}
            </button>
          </div>

          {challenge && !challengeResult && (
            <div style={{ padding: 20, borderRadius: 12, background: '#f5f3ff', border: '1px solid #e9d5ff' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 12, lineHeight: 1.5 }}>{challenge.question}</div>
              {challenge.options && challenge.options.length > 0 && (
                <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
                  {challenge.options.map((opt, i) => (
                    <button key={i} type="button" onClick={() => setChallengeAnswer(opt)} style={{
                      padding: '12px 16px', borderRadius: 8, textAlign: 'left', fontSize: 14,
                      border: challengeAnswer === opt ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                      background: challengeAnswer === opt ? '#f5f3ff' : '#fff',
                      color: '#0f172a', fontWeight: challengeAnswer === opt ? 700 : 500, cursor: 'pointer',
                    }}>{opt}</button>
                  ))}
                </div>
              )}
              {(!challenge.options || challenge.options.length === 0) && (
                <input value={challengeAnswer} onChange={(e) => setChallengeAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }}
                />
              )}
              {challenge.hint && (
                <details style={{ marginBottom: 12 }}>
                  <summary style={{ fontSize: 12, color: '#7c3aed', cursor: 'pointer', fontWeight: 600 }}>{'\uD83D\uDCA1'} Hint</summary>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 4, padding: '8px 12px', background: '#fff', borderRadius: 6 }}>{challenge.hint}</div>
                </details>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button type="button" onClick={submitChallenge} disabled={!challengeAnswer} style={{
                  padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700,
                  background: challengeAnswer ? '#7c3aed' : '#94a3b8', color: '#fff', cursor: 'pointer',
                }}>Submit Answer</button>
                <span style={{ fontSize: 12, color: '#7c3aed', fontWeight: 700 }}>+{challenge.xpReward || 20} XP</span>
              </div>
            </div>
          )}

          {challengeResult && (
            <div style={{
              padding: 20, borderRadius: 12,
              background: challengeResult.correct ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${challengeResult.correct ? '#bbf7d0' : '#fecaca'}`,
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{challengeResult.correct ? '\uD83C\uDF89' : '\uD83D\uDCAA'}</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: challengeResult.correct ? '#166534' : '#991b1b', marginBottom: 4 }}>
                {challengeResult.correct ? 'Correct!' : 'Not quite!'}
              </div>
              <div style={{ fontSize: 13, color: challengeResult.correct ? '#065f46' : '#7f1d1d', marginBottom: 8 }}>
                {challengeResult.correct ? `Great work! You earned ${challengeResult.xpEarned} XP.` : `The answer was: ${challenge.correct}. You still earned ${challengeResult.xpEarned} XP for trying!`}
              </div>
              <button type="button" onClick={fetchChallenge} style={{
                padding: '10px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700,
                background: '#7c3aed', color: '#fff', cursor: 'pointer',
              }}>Next Challenge</button>
            </div>
          )}

          {!challenge && !challengeLoading && (
            <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{'\u26A1'}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Ready for a challenge?</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>AI will create a question just for your level.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
