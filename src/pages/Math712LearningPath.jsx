import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import { getDomainsForExam } from '../data/texes-questions';
import {
  getMasteryScore,
  getMasteryStatus,
  getStandardPathProgress,
  MASTERY_LABELS,
  MASTERY_COLORS,
} from '../utils/masteryEngine';
import { COLOR, CARD, BTN_PRIMARY, PROGRESS_TRACK, progressFill } from '../utils/loopStyles';

const EXAM_ID = 'math712';
const GRADE = 'grade7-12';

/**
 * Recommended domain order for study: Algebra emphasis (exam weight), then foundations,
 * geometry, statistics, processes, instruction/assessment.
 */
const PATH_DOMAIN_ORDER = ['comp002', 'comp001', 'comp003', 'comp004', 'comp005', 'comp006'];

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

function buildLoopUrl(compId, stdId, domainName) {
  const params = new URLSearchParams({
    comp: compId,
    currentStd: stdId,
    examId: EXAM_ID,
    grade: GRADE,
    label: domainName || compId,
  });
  return `/practice-loop?${params.toString()}`;
}

function StatusPill({ status }) {
  const color = MASTERY_COLORS[status] || COLOR.textMuted;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: '4px 10px',
        borderRadius: 999,
        background: `${color}22`,
        color,
        border: `1px solid ${color}44`,
        whiteSpace: 'nowrap',
      }}
    >
      {MASTERY_LABELS[status] || status}
    </span>
  );
}

export default function Math712LearningPath() {
  const domains = useMemo(() => getDomainsForExam(EXAM_ID) || [], []);
  const domainById = useMemo(() => new Map(domains.map((d) => [d.id, d])), [domains]);

  const orderedDomains = useMemo(() => {
    const out = [];
    for (const id of PATH_DOMAIN_ORDER) {
      const d = domainById.get(id);
      if (d) out.push(d);
    }
    for (const d of domains) {
      if (!PATH_DOMAIN_ORDER.includes(d.id)) out.push(d);
    }
    return out;
  }, [domains, domainById]);

  const flatStandards = useMemo(() => {
    const rows = [];
    orderedDomains.forEach((dom, di) => {
      const stds = dom.standards || [];
      stds.forEach((std) => {
        rows.push({ dom, std, domainIndex: di });
      });
    });
    return rows;
  }, [orderedDomains]);

  const pathProgress = useMemo(() => getStandardPathProgress(EXAM_ID, domains), [domains]);

  const nextUp = useMemo(() => {
    for (const { dom, std } of flatStandards) {
      const score = getMasteryScore(EXAM_ID, dom.id, '', std.id);
      if (score < 85) return { dom, std };
    }
    return null;
  }, [flatStandards]);

  const pct = pathProgress.total ? Math.round((pathProgress.mastered / pathProgress.total) * 100) : 0;

  return (
    <StudentLayout>
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '24px 16px 48px',
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          color: COLOR.text,
        }}
      >
        <Link
          to="/texes-prep"
          style={{ fontSize: 13, fontWeight: 600, color: COLOR.textMuted, textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}
        >
          ← TExES Test Prep
        </Link>

        <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 800, color: COLOR.text }}>
          Math 7–12 learning path
        </h1>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: COLOR.textSecondary, lineHeight: 1.6 }}>
          Twenty-one TExES competencies in a recommended order. Each opens the adaptive 20-tile loop scoped to that
          competency. Mastery is tracked per competency (85%+ on the mastery bar for that standard).
        </p>

        <div style={{ ...CARD, marginBottom: 20, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: COLOR.textMuted, marginBottom: 8 }}>
            Overall path progress
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: COLOR.blue }}>
              {pathProgress.mastered}/{pathProgress.total}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: COLOR.textSecondary }}>{pct}% at ≥85%</span>
          </div>
          <div style={PROGRESS_TRACK}>
            <div style={progressFill(pct, COLOR.blue)} />
          </div>
          {nextUp ? (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLOR.green, marginBottom: 8 }}>Suggested next</div>
              <p style={{ margin: '0 0 10px', fontSize: 14, lineHeight: 1.5 }}>
                <strong>{nextUp.std.name}</strong>
                <span style={{ color: COLOR.textMuted }}> · {nextUp.dom.name}</span>
              </p>
              <Link to={buildLoopUrl(nextUp.dom.id, nextUp.std.id, nextUp.dom.name)} style={BTN_PRIMARY}>
                Continue adaptive loop →
              </Link>
            </div>
          ) : (
            <p style={{ margin: '16px 0 0', fontSize: 14, fontWeight: 600, color: COLOR.green }}>
              All listed competencies are at or above 85%. Revisit any row below for spaced practice or exam review.
            </p>
          )}
        </div>

        {orderedDomains.map((dom) => {
          const stds = dom.standards || [];
          if (stds.length === 0) return null;
          const di = domains.findIndex((d) => d.id === dom.id);
          return (
            <section key={dom.id} style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 12px', color: COLOR.text }}>
                Domain {ROMAN[di] || di + 1}: {dom.name}
              </h2>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: COLOR.textSecondary, lineHeight: 1.5 }}>{dom.desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {stds.map((std) => {
                  const score = getMasteryScore(EXAM_ID, dom.id, '', std.id);
                  const status = getMasteryStatus(EXAM_ID, dom.id, '', std.id);
                  return (
                    <li
                      key={std.id}
                      style={{
                        ...CARD,
                        marginBottom: 10,
                        padding: '14px 16px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: 12,
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{std.name}</div>
                        {std.desc && (
                          <div style={{ fontSize: 12, color: COLOR.textSecondary, lineHeight: 1.45 }}>{std.desc}</div>
                        )}
                        <div style={{ fontSize: 11, color: COLOR.textMuted, marginTop: 6 }}>Mastery signal: {score}%</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <StatusPill status={status} />
                        <Link
                          to={buildLoopUrl(dom.id, std.id, dom.name)}
                          style={{
                            ...BTN_PRIMARY,
                            fontSize: 13,
                            padding: '10px 16px',
                            textDecoration: 'none',
                            display: 'inline-block',
                          }}
                        >
                          Open loop
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </StudentLayout>
  );
}
