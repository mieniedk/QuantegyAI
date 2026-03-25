import React, { useState, useCallback, useMemo } from 'react';
import TeacherLayout from '../components/TeacherLayout';

/* ═══════════════════════════════════════════════════════════════
   PACING GUIDE — Scope & Sequence Calendar for Grade 3 Math
   Based on TEA-recommended pacing for Texas teachers
   ═══════════════════════════════════════════════════════════════ */

const COLORS = {
  'NPA': '#2563eb', 'ACE': '#7c3aed', 'GMP': '#059669', 'DAP': '#d97706',
  'review': '#64748b', 'staar': '#ef4444',
};

const DEFAULT_UNITS = [
  { id: 1,  title: 'Place Value & Number Sense', teks: ['3.2A','3.2B','3.2C','3.2D'], cat: 'NPA', weeks: 3, startWeek: 1, desc: 'Read, write, compare, order, and represent whole numbers to 100,000. Use number lines and rounding.' },
  { id: 2,  title: 'Addition & Subtraction Strategies', teks: ['3.4A','3.4B','3.4I','3.4K'], cat: 'ACE', weeks: 3, startWeek: 4, desc: 'Add and subtract within 1,000 using strategies and standard algorithm. Solve one- and two-step problems.' },
  { id: 3,  title: 'Multiplication Concepts', teks: ['3.4C','3.4E','3.4F','3.4G','3.5C'], cat: 'ACE', weeks: 3, startWeek: 7, desc: 'Model and apply multiplication facts to 10×10 using arrays, strip diagrams, and equal groups.' },
  { id: 4,  title: 'Division Concepts', teks: ['3.4D','3.4E','3.4F','3.4J','3.4K'], cat: 'ACE', weeks: 2, startWeek: 10, desc: 'Model and apply division with equal sharing and grouping. Relate multiplication and division.' },
  { id: 5,  title: 'Algebraic Reasoning & Patterns', teks: ['3.4H','3.5A','3.5B','3.5D','3.5E'], cat: 'ACE', weeks: 2, startWeek: 12, desc: 'Represent problems using number sentences. Identify, extend, and create numeric patterns.' },
  { id: 6,  title: 'Fractions (Part 1) — Concepts', teks: ['3.3A','3.3B','3.3C','3.3H'], cat: 'NPA', weeks: 3, startWeek: 14, desc: 'Represent fractions with concrete/pictorial models, number lines, and compose/decompose fractions.' },
  { id: 7,  title: 'Fractions (Part 2) — Comparisons', teks: ['3.3D','3.3E','3.3F','3.3G','3.7A'], cat: 'NPA', weeks: 3, startWeek: 17, desc: 'Compare fractions, explain equivalence, and represent fractions as distances from zero on a number line.' },
  { id: 8,  title: 'Geometry — 2D & 3D Shapes', teks: ['3.6A','3.6B'], cat: 'GMP', weeks: 2, startWeek: 20, desc: 'Classify 2D and 3D shapes, including quadrilaterals, based on attributes.' },
  { id: 9,  title: 'Measurement — Perimeter & Area', teks: ['3.6C','3.7B'], cat: 'GMP', weeks: 2, startWeek: 22, desc: 'Determine area using unit squares and perimeter using addition. Solve real-world measurement problems.' },
  { id: 10, title: 'Measurement — Time, Length, Weight', teks: ['3.7C','3.7D','3.7E'], cat: 'GMP', weeks: 2, startWeek: 24, desc: 'Determine elapsed time, measure with appropriate tools, and convert within the same measurement system.' },
  { id: 11, title: 'Data Analysis — Graphs', teks: ['3.8A','3.8B'], cat: 'DAP', weeks: 2, startWeek: 26, desc: 'Summarize and interpret data from bar graphs, dot plots, and pictographs.' },
  { id: 12, title: 'Personal Financial Literacy', teks: ['3.9A','3.9B','3.9C','3.9D','3.9E'], cat: 'DAP', weeks: 2, startWeek: 28, desc: 'Identify coins/bills, calculate profit, create simple spending plans, and explain saving/borrowing.' },
  { id: 13, title: 'STAAR Review & Test Prep', teks: [], cat: 'staar', weeks: 3, startWeek: 30, desc: 'Comprehensive review across all reporting categories. Practice tests, timed drills, and targeted remediation.' },
  { id: 14, title: 'Post-STAAR Enrichment', teks: [], cat: 'review', weeks: 3, startWeek: 33, desc: 'Project-based learning, math games tournaments, and enrichment activities for the remaining school year.' },
];

const SCHOOL_START = new Date(2025, 7, 18); // Aug 18
const STAAR_DATE = new Date(2026, 3, 7);    // Apr 7 (same as STAARPrep)
const TOTAL_WEEKS = 36;

function getWeekDate(weekNum) {
  const d = new Date(SCHOOL_START);
  d.setDate(d.getDate() + (weekNum - 1) * 7);
  return d;
}

function fmtDate(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getCurrentWeek() {
  const now = new Date();
  const diff = Math.floor((now - SCHOOL_START) / (7 * 24 * 60 * 60 * 1000)) + 1;
  return Math.max(1, Math.min(TOTAL_WEEKS, diff));
}

export default function PacingGuide() {
  const [units] = useState(DEFAULT_UNITS);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [view, setView] = useState('timeline');
  const currentWeek = getCurrentWeek();

  const catNames = { 'NPA': 'Numerical Representations', 'ACE': 'Computations & Equations', 'GMP': 'Geometry & Measurement', 'DAP': 'Data & Financial Literacy', 'review': 'Review', 'staar': 'STAAR Prep' };

  return (
    <TeacherLayout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 24, color: '#0f172a' }}>📅 Scope & Sequence</h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
          TEA-aligned pacing guide for Grade 3 Math. Currently in Week {currentWeek} of {TOTAL_WEEKS}.
        </p>
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" onClick={() => setView('timeline')} style={pillBtn(view === 'timeline')}>📊 Timeline</button>
        <button type="button" onClick={() => setView('list')} style={pillBtn(view === 'list')}>📋 List View</button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {Object.entries(COLORS).map(([cat, color]) => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748b' }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
              {catNames[cat]?.split(' ')[0] || cat}
            </div>
          ))}
        </div>
      </div>

      {/* STAAR countdown bar */}
      <div style={{
        background: 'linear-gradient(135deg,#991b1b,#dc2626)', color: '#fff', borderRadius: 12, padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20,
      }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>STAAR Math Test</div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{fmtDate(STAAR_DATE)}</div>
        </div>
        <div style={{ fontSize: 24, fontWeight: 900 }}>
          {Math.max(0, Math.ceil((STAAR_DATE - new Date()) / (24 * 60 * 60 * 1000)))} days
        </div>
      </div>

      {/* Timeline view */}
      {view === 'timeline' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20, overflowX: 'auto' }}>
          <div style={{ minWidth: 800 }}>
            {/* Week header */}
            <div style={{ display: 'flex', marginBottom: 4, marginLeft: 200 }}>
              {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map(w => (
                <div key={w} style={{
                  flex: '0 0 20px', fontSize: 9, textAlign: 'center', color: w === currentWeek ? '#2563eb' : '#94a3b8',
                  fontWeight: w === currentWeek ? 900 : 400,
                }}>
                  {w}
                </div>
              ))}
            </div>

            {/* Unit bars */}
            {units.map(unit => {
              const left = (unit.startWeek - 1) * 20;
              const width = unit.weeks * 20;
              const isPast = unit.startWeek + unit.weeks - 1 < currentWeek;
              const isCurrent = currentWeek >= unit.startWeek && currentWeek < unit.startWeek + unit.weeks;

              return (
                <div key={unit.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 6, cursor: 'pointer' }}
                  onClick={() => setSelectedUnit(selectedUnit?.id === unit.id ? null : unit)}>
                  <div style={{ width: 200, flexShrink: 0, fontSize: 12, fontWeight: 600, color: '#0f172a', paddingRight: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {unit.title}
                  </div>
                  <div style={{ position: 'relative', height: 28, flex: 1, minWidth: TOTAL_WEEKS * 20 }}>
                    {/* Current week indicator */}
                    <div style={{ position: 'absolute', left: (currentWeek - 1) * 20 + 9, top: 0, bottom: 0, width: 2, background: '#2563eb', opacity: 0.3, zIndex: 1 }} />
                    <div style={{
                      position: 'absolute', left, width, height: '100%', borderRadius: 6,
                      background: COLORS[unit.cat] || '#64748b',
                      opacity: isPast ? 0.4 : 1,
                      border: isCurrent ? '2px solid #0f172a' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: '#fff', fontWeight: 700, padding: '0 4px', overflow: 'hidden',
                      boxShadow: isCurrent ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                    }}>
                      {unit.weeks >= 2 && `${fmtDate(getWeekDate(unit.startWeek))}`}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Month labels */}
            <div style={{ display: 'flex', marginTop: 8, marginLeft: 200 }}>
              {['Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May'].map((m, i) => (
                <div key={m} style={{ flex: `0 0 ${i < 9 ? 80 : 40}px`, fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{m}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {units.map(unit => {
            const isPast = unit.startWeek + unit.weeks - 1 < currentWeek;
            const isCurrent = currentWeek >= unit.startWeek && currentWeek < unit.startWeek + unit.weeks;
            const startDate = getWeekDate(unit.startWeek);
            const endDate = getWeekDate(unit.startWeek + unit.weeks - 1);

            return (
              <div key={unit.id}
                onClick={() => setSelectedUnit(selectedUnit?.id === unit.id ? null : unit)}
                style={{
                  background: '#fff', borderRadius: 12, padding: 16,
                  border: isCurrent ? `2px solid ${COLORS[unit.cat]}` : '1px solid #e2e8f0',
                  cursor: 'pointer', opacity: isPast ? 0.6 : 1,
                  boxShadow: isCurrent ? `0 2px 12px ${COLORS[unit.cat]}33` : 'none',
                }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: COLORS[unit.cat], display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 900, fontSize: 16, flexShrink: 0,
                  }}>
                    {unit.id}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, fontSize: 15, color: '#0f172a' }}>{unit.title}</h3>
                      {isCurrent && <span style={{ padding: '2px 8px', background: COLORS[unit.cat], color: '#fff', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>CURRENT</span>}
                      {isPast && <span style={{ padding: '2px 8px', background: '#e2e8f0', color: '#64748b', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>COMPLETE</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                      Weeks {unit.startWeek}–{unit.startWeek + unit.weeks - 1} &middot; {fmtDate(startDate)} – {fmtDate(endDate)} &middot; {unit.weeks} weeks
                    </div>
                    {unit.teks.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                        {unit.teks.map(t => (
                          <span key={t} style={{ padding: '2px 8px', background: '#f1f5f9', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#334155' }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {selectedUnit?.id === unit.id && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, margin: 0 }}>{unit.desc}</p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                      {unit.teks.length > 0 && (
                        <a href="/printables" style={{ padding: '6px 14px', background: '#f1f5f9', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}>
                          🖨️ Print Worksheet
                        </a>
                      )}
                      <a href="/games" style={{ padding: '6px 14px', background: '#f1f5f9', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#7c3aed', textDecoration: 'none' }}>
                        🎮 Related Games
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </TeacherLayout>
  );
}

function pillBtn(active) { return { padding: '8px 16px', borderRadius: 20, border: active ? '2px solid #2563eb' : '1px solid #e2e8f0', background: active ? 'rgba(37,99,235,0.05)' : '#fff', cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 500, color: active ? '#2563eb' : '#334155' }; }
