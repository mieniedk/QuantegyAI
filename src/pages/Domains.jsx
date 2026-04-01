import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import TeacherLayout from '../components/TeacherLayout';
import { TEXES_EXAM_OPTIONS } from '../data/texesExams';
import { getDomainsForExam, getQuestionsForExam } from '../data/texes-questions';
import { GAMES_CATALOG } from '../data/games';
import { hasPaidProAccess } from '../utils/subscription';
import {
  COLOR, CARD, PAGE_WRAP, PAGE_HEADER, PAGE_SUBTITLE, SECTION_HEADING,
  BTN_PRIMARY, BTN_ACCENT, BTN_PURPLE, BTN_SECONDARY, CHIP,
  PROGRESS_TRACK, progressFill,
} from '../utils/loopStyles';

function getStatusFromPct(pct, attempts) {
  if (!attempts) return 'not-started';
  if (pct >= 80) return 'strong';
  if (pct >= 60) return 'in-progress';
  return 'needs-work';
}

function formatWhen(ts) {
  if (!ts) return 'Never';
  try {
    return new Date(ts).toLocaleDateString();
  } catch {
    return '—';
  }
}

function normalizeAnswer(a) {
  return Array.isArray(a) ? [...a].sort() : [a];
}

function isCorrectAnswer(question, studentAnswer) {
  if (!question || studentAnswer == null) return false;
  if (question.type === 'multi') {
    const correct = normalizeAnswer(question.answer);
    const student = normalizeAnswer(studentAnswer);
    return JSON.stringify(correct) === JSON.stringify(student);
  }
  return String(studentAnswer) === String(question.answer);
}

function getDomainType(name = '', desc = '') {
  const t = `${name} ${desc}`.toLowerCase();
  if (t.includes('instruction') || t.includes('assessment') || t.includes('pedagogy')) return 'Pedagogy';
  if (t.includes('process') || t.includes('perspective') || t.includes('professional')) return 'Process';
  return 'Content';
}

export default function Domains() {
  const [searchParams, setSearchParams] = useSearchParams();
  const examFromUrl = searchParams.get('exam');
  const defaultExamId = TEXES_EXAM_OPTIONS.some((x) => x.id === examFromUrl) ? examFromUrl : 'math712';

  const [examId, setExamId] = useState(defaultExamId);
  const [query, setQuery] = useState('');
  const [weakOnly, setWeakOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const username = typeof localStorage !== 'undefined' ? localStorage.getItem('quantegy-teacher-user') : null;
  const hasPro = username ? hasPaidProAccess(username) : false;

  const domains = getDomainsForExam(examId) || [];
  const questionBank = getQuestionsForExam(examId) || [];
  const qById = useMemo(() => {
    const m = {};
    for (const q of questionBank) m[q.id] = q;
    return m;
  }, [questionBank]);

  const domainStats = useMemo(() => {
    let results = [];
    try {
      let raw = localStorage.getItem('quantegyai-texes-results');
      if (raw == null) {
        raw = localStorage.getItem('allen-ace-texes-results');
        if (raw != null) {
          try { localStorage.setItem('quantegyai-texes-results', raw); } catch {}
        }
      }
      results = JSON.parse(raw || '[]');
    } catch {
      results = [];
    }

    const perDomain = {};
    for (const d of domains) {
      perDomain[d.id] = {
        ...d,
        attempts: 0,
        correct: 0,
        lastPracticedAt: null,
      };
    }

    for (const r of results) {
      const rExamId = r.examId || 'math712';
      if (rExamId !== examId) continue;
      const ts = r.timestamp || 0;
      const answers = r.answers && typeof r.answers === 'object' ? r.answers : {};

      for (const [qid, studentAnswer] of Object.entries(answers)) {
        const q = qById[qid];
        if (!q || !perDomain[q.comp]) continue;
        perDomain[q.comp].attempts += 1;
        if (isCorrectAnswer(q, studentAnswer)) perDomain[q.comp].correct += 1;
        if (!perDomain[q.comp].lastPracticedAt || ts > perDomain[q.comp].lastPracticedAt) {
          perDomain[q.comp].lastPracticedAt = ts;
        }
      }

      if (r.category && perDomain[r.category]) {
        if (!perDomain[r.category].lastPracticedAt || ts > perDomain[r.category].lastPracticedAt) {
          perDomain[r.category].lastPracticedAt = ts;
        }
      }
    }

    return Object.values(perDomain).map((d) => {
      const pct = d.attempts > 0 ? Math.round((d.correct / d.attempts) * 100) : 0;
      const status = getStatusFromPct(pct, d.attempts);
      const type = getDomainType(d.name, d.desc);
      const weaknessScore = d.attempts === 0 ? 200 : (100 - pct) + Math.max(0, 15 - d.attempts);
      return { ...d, pct, status, type, weaknessScore };
    }).sort((a, b) => b.weaknessScore - a.weaknessScore);
  }, [domains, examId, qById]);

  const filteredDomains = useMemo(() => {
    const q = query.trim().toLowerCase();
    return domainStats.filter((d) => {
      if (weakOnly && d.status === 'strong') return false;
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (!q) return true;
      return `${d.name} ${d.desc || ''} ${d.type}`.toLowerCase().includes(q);
    });
  }, [domainStats, query, weakOnly, statusFilter]);

  const summary = useMemo(() => {
    let notStarted = 0;
    let needsWork = 0;
    let inProgress = 0;
    let strong = 0;
    for (const d of domainStats) {
      if (d.status === 'not-started') notStarted += 1;
      else if (d.status === 'needs-work') needsWork += 1;
      else if (d.status === 'in-progress') inProgress += 1;
      else strong += 1;
    }
    const readiness = domainStats.length
      ? Math.round(domainStats.reduce((s, d) => s + d.pct, 0) / domainStats.length)
      : 0;
    return { notStarted, needsWork, inProgress, strong, readiness };
  }, [domainStats]);

  const statusChipConfig = {
    'not-started': { color: COLOR.textMuted, bg: COLOR.borderLight },
    'needs-work': { color: COLOR.red, bg: COLOR.redBg },
    'in-progress': { color: COLOR.amber, bg: COLOR.amberBg },
    'strong': { color: COLOR.green, bg: COLOR.successBg },
  };

  const inputStyle = {
    padding: '10px 14px',
    borderRadius: 12,
    border: `1px solid ${COLOR.border}`,
    fontWeight: 600,
    color: COLOR.text,
    background: COLOR.card,
    fontFamily: PAGE_WRAP.fontFamily,
    fontSize: 14,
  };

  return (
    <TeacherLayout>
      <div style={{ ...PAGE_WRAP, padding: '24px 20px 40px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
            <div>
              <div style={PAGE_HEADER}>Domains & Competencies</div>
              <div style={PAGE_SUBTITLE}>Browse all 21 competencies across 6 domains. Practice each one individually.</div>
            </div>
            <Link to={`/texes-prep?exam=${encodeURIComponent(examId)}`} style={{ ...BTN_ACCENT, textDecoration: 'none', padding: '10px 18px' }}>
              Open Test Prep
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            <select
              value={examId}
              onChange={(e) => {
                const next = e.target.value;
                setExamId(next);
                setSearchParams({ exam: next });
              }}
              style={inputStyle}
            >
              {TEXES_EXAM_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search competencies"
              style={{ ...inputStyle, fontWeight: 500 }}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={inputStyle}>
              <option value="all">All statuses</option>
              <option value="needs-work">Needs work</option>
              <option value="in-progress">In progress</option>
              <option value="strong">Strong</option>
              <option value="not-started">Not started</option>
            </select>
            <button
              type="button"
              onClick={() => setWeakOnly((v) => !v)}
              style={{
                ...inputStyle,
                background: weakOnly ? COLOR.text : COLOR.card,
                color: weakOnly ? '#fff' : COLOR.text,
                cursor: 'pointer',
                fontWeight: 700,
                textAlign: 'center',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              Weak only
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Not started', value: summary.notStarted, border: COLOR.border, color: COLOR.text },
              { label: 'Needs work', value: summary.needsWork, border: '#fca5a5', color: COLOR.red },
              { label: 'In progress', value: summary.inProgress, border: COLOR.amberBorder, color: COLOR.amber },
              { label: 'Strong', value: summary.strong, border: COLOR.successBorder, color: COLOR.green },
              { label: 'Readiness', value: `${summary.readiness}%`, border: COLOR.blueBorder, color: COLOR.blue },
            ].map((s) => (
              <div key={s.label} style={{ ...CARD, padding: '14px 16px', borderColor: s.border }}>
                <div style={{ fontSize: 11, color: COLOR.textSecondary, fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ ...CARD, padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
            <Link
              to={`/texes-prep?exam=${encodeURIComponent(examId)}`}
              style={{ ...BTN_PRIMARY, width: 'auto', padding: '12px 24px', textDecoration: 'none', textAlign: 'center' }}
            >
              Continue study
            </Link>
            <Link
              to={hasPro ? `/texes-prep?exam=${encodeURIComponent(examId)}` : (username ? `/pricing?user=${encodeURIComponent(username)}` : '/pricing')}
              style={{ ...BTN_PURPLE, textDecoration: 'none', textAlign: 'center', padding: '12px 24px' }}
            >
              {hasPro ? 'Start full practice exam' : 'Unlock full practice exam'}
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 24 }}>
            {(() => {
              const ROMAN_NUMS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
              return filteredDomains.map((d) => {
                const gameDefs = (d.games || []).slice(0, 3).map((id) => GAMES_CATALOG.find((g) => g.id === id)).filter(Boolean);
                const barColor = d.status === 'strong' ? COLOR.green : d.status === 'in-progress' ? COLOR.amber : d.status === 'needs-work' ? COLOR.red : COLOR.textMuted;
                const sc = statusChipConfig[d.status] || statusChipConfig['not-started'];
                const domIdx = domains.findIndex((x) => x.id === d.id);
                const domStds = d.standards || [];

                const buildLoopUrl = (stdId) => {
                  const p = new URLSearchParams();
                  p.set('comp', d.id);
                  if (stdId) p.set('std', stdId);
                  p.set('phase', 'diagnostic');
                  p.set('examId', examId);
                  if (examId === 'math712') { p.set('grade', 'grade7-12'); p.set('label', 'Math 7\u201312'); }
                  else if (examId === 'math48') { p.set('grade', 'grade4-8'); p.set('label', 'Math 4\u20138'); }
                  else { p.set('grade', String(examId)); p.set('label', d.name); }
                  return `/practice-loop?${p.toString()}`;
                };

                return (
                  <div key={d.id} style={{ ...CARD, padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: domStds.length > 0 ? `1px solid ${COLOR.border}` : 'none' }}>
                      <div style={{ minWidth: 32, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, background: COLOR.purple, color: '#fff', padding: '0 8px' }}>
                        {ROMAN_NUMS[domIdx] || domIdx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: COLOR.text }}>{d.name}</div>
                        <div style={{ fontSize: 11, color: COLOR.textSecondary, marginTop: 2 }}>
                          {d.desc}{typeof d.weight === 'number' ? ` · ${(d.weight * 100).toFixed(0)}% of exam` : ''}
                        </div>
                      </div>
                      <div style={CHIP(sc.color, sc.bg)}>{d.status.replace('-', ' ')}</div>
                    </div>

                    {domStds.length > 0 && (
                      <div style={{ padding: '0 18px 14px' }}>
                        {domStds.map((std, si) => {
                          const compNum = std.name?.match(/Competency\s+(\d+)/)?.[1] || '';
                          const shortName = std.name?.replace(/^Competency\s+\d+\s*[—–-]\s*/, '') || std.name;
                          return (
                            <div key={std.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: si > 0 ? `1px solid ${COLOR.borderLight}` : 'none' }}>
                              <div style={{ minWidth: 30, fontSize: 12, fontWeight: 800, color: '#6366f1' }}>{compNum}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: COLOR.text }}>{shortName}</div>
                                <div style={{ fontSize: 10, color: COLOR.textMuted, marginTop: 2, lineHeight: 1.4 }}>{std.desc}</div>
                              </div>
                              <Link to={buildLoopUrl(std.id)} style={{ textDecoration: 'none', padding: '5px 10px', borderRadius: 8, background: `linear-gradient(135deg, ${COLOR.blue}, #1d4ed8)`, color: '#fff', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                Practice →
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div style={{ padding: '0 18px 14px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ ...PROGRESS_TRACK, height: 5, width: '100%', marginBottom: 6 }}>
                        <div style={progressFill(d.pct, barColor)} />
                      </div>
                      <div style={{ width: '100%', fontSize: 11, color: COLOR.textSecondary, marginBottom: 6 }}>
                        {d.correct}/{d.attempts} correct ({d.pct}%) · Last: {formatWhen(d.lastPracticedAt)}
                      </div>
                      <Link to={`/texes-prep?exam=${encodeURIComponent(examId)}&comp=${encodeURIComponent(d.id)}`} style={{ textDecoration: 'none', padding: '6px 12px', borderRadius: 8, background: `linear-gradient(135deg, ${COLOR.green}, ${COLOR.greenDark})`, color: '#fff', fontSize: 11, fontWeight: 700 }}>
                        Quick drill
                      </Link>
                      {gameDefs[0] && (
                        <Link to={`${gameDefs[0].path}?returnUrl=${encodeURIComponent(`/domains?exam=${examId}`)}`} style={{ textDecoration: 'none', padding: '6px 12px', borderRadius: 8, background: `linear-gradient(135deg, ${COLOR.blue}, #1d4ed8)`, color: '#fff', fontSize: 11, fontWeight: 700 }}>
                          Play {gameDefs[0].name}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
