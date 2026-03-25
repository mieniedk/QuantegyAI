import React, { useState, useMemo } from 'react';
import { FRAMEWORKS, GRADES, DOMAINS, STANDARDS, DIFFICULTY_LEVELS, GAME_CONCEPT_MAP, getAllConcepts, getConceptsByDomain } from '../data/taxonomy';
import { getAccuracy, getMasteryLevel, MASTERY_COLORS, MASTERY_LABELS } from '../utils/conceptTracker';

/**
 * ConceptPicker – Cascading selector for: Framework → Grade → Domain → Concept
 *
 * Props:
 *   onSelect(concept)        – called when a concept is clicked
 *   selectedConceptId        – highlight the currently selected concept
 *   showMastery              – show accuracy badges from tracker (default true)
 *   showGameCount            – show how many games support each concept (default false)
 *   filterGameId             – only show concepts supported by this game template
 *   defaultGrade             – pre-select a grade (e.g., 'grade3')
 *   compact                  – smaller layout for embedding in panels
 */
const ConceptPicker = ({
  onSelect,
  selectedConceptId,
  showMastery = true,
  showGameCount = false,
  filterGameId,
  defaultGrade = '',
  compact = false,
}) => {
  const [framework, setFramework] = useState('teks');
  const [grade, setGrade] = useState(defaultGrade);
  const [domain, setDomain] = useState('');

  const grades = GRADES[framework] || [];
  const domains = grade ? (DOMAINS[grade] || []) : [];

  // Get concepts for the current selection, optionally filtered by game
  const concepts = useMemo(() => {
    if (!grade) return [];
    let list = domain ? getConceptsByDomain(grade, domain) : getAllConcepts(grade);
    if (filterGameId) {
      const supported = GAME_CONCEPT_MAP[filterGameId]?.concepts || [];
      list = list.filter((c) => supported.includes(c.conceptId));
    }
    return list;
  }, [grade, domain, filterGameId]);

  const selectStyle = {
    padding: compact ? '6px 10px' : '8px 12px',
    borderRadius: 6,
    border: '1px solid #d1d5db',
    fontSize: compact ? 13 : 14,
    background: '#fff',
    minWidth: 140,
    cursor: 'pointer',
  };

  const labelStyle = {
    fontSize: compact ? 12 : 13,
    fontWeight: 600,
    color: '#475569',
    marginBottom: 4,
    display: 'block',
  };

  return (
    <div>
      {/* Selectors row */}
      <div style={{
        display: 'flex', gap: compact ? 10 : 14, flexWrap: 'wrap',
        marginBottom: compact ? 12 : 18, alignItems: 'flex-end',
      }}>
        {/* Framework (only show if more than one) */}
        {FRAMEWORKS.length > 1 && (
          <div>
            <span style={labelStyle}>Framework</span>
            <select value={framework} onChange={(e) => { setFramework(e.target.value); setGrade(''); setDomain(''); }} style={selectStyle}>
              {FRAMEWORKS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </div>
        )}

        {/* Grade */}
        <div>
          <span style={labelStyle}>Grade</span>
          <select value={grade} onChange={(e) => { setGrade(e.target.value); setDomain(''); }} style={selectStyle}>
            <option value="">Select grade...</option>
            {grades.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
          </select>
        </div>

        {/* Domain/Strand */}
        {grade && domains.length > 0 && (
          <div>
            <span style={labelStyle}>Domain</span>
            <select value={domain} onChange={(e) => setDomain(e.target.value)} style={selectStyle}>
              <option value="">All domains</option>
              {domains.map((d) => <option key={d.id} value={d.id}>{d.icon} {d.label}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Concepts list */}
      {grade && concepts.length > 0 && (
        <div style={{ display: 'grid', gap: compact ? 6 : 8 }}>
          {concepts.map((concept) => {
            const isSelected = selectedConceptId === concept.conceptId;
            const acc = showMastery ? getAccuracy(concept.conceptId) : null;
            const level = showMastery ? getMasteryLevel(concept.conceptId) : null;
            const gameCount = showGameCount
              ? Object.values(GAME_CONCEPT_MAP).filter((m) => m.concepts.includes(concept.conceptId)).length
              : 0;
            const diffLevel = DIFFICULTY_LEVELS.find((d) => d.id === concept.difficulty);

            return (
              <div
                key={concept.conceptId}
                onClick={() => onSelect?.(concept)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: compact ? '8px 12px' : '12px 14px',
                  background: isSelected ? '#e8f0fe' : '#fff',
                  borderRadius: 8,
                  border: isSelected ? '2px solid #2B7DE9' : '1px solid #e2e8f0',
                  cursor: 'pointer', transition: 'all 0.15s',
                  gap: 10,
                }}
              >
                {/* Left: concept info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                    <span style={{
                      padding: '1px 7px', background: '#e8f0fe', color: '#1a5cba',
                      borderRadius: 4, fontSize: 11, fontWeight: 700,
                    }}>{concept.standardCode}</span>
                    {diffLevel && (
                      <span style={{
                        padding: '1px 6px', background: diffLevel.color + '18',
                        color: diffLevel.color, borderRadius: 4, fontSize: 10, fontWeight: 700,
                      }}>{diffLevel.label}</span>
                    )}
                    {showGameCount && gameCount > 0 && (
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>
                        {gameCount} game{gameCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p style={{
                    margin: 0, fontSize: compact ? 13 : 14, fontWeight: 600, color: '#1e293b',
                  }}>{concept.label}</p>
                  {!compact && (
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.3 }}>
                      {concept.description}
                    </p>
                  )}
                </div>

                {/* Right: mastery indicator */}
                {showMastery && (
                  <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 56 }}>
                    {acc !== null ? (
                      <>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%',
                          background: `conic-gradient(${MASTERY_COLORS[level]} ${acc * 3.6}deg, #e2e8f0 0deg)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          margin: '0 auto 3px',
                        }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%', background: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700, color: MASTERY_COLORS[level],
                          }}>{acc}%</div>
                        </div>
                        <span style={{ fontSize: 9, color: MASTERY_COLORS[level], fontWeight: 600 }}>
                          {MASTERY_LABELS[level]}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: 10, color: '#cbd5e1' }}>New</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {grade && concepts.length === 0 && (
        <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 16 }}>
          No concepts found for this selection.
        </p>
      )}

      {!grade && (
        <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 16 }}>
          Select a grade to see available concepts.
        </p>
      )}
    </div>
  );
};

export default ConceptPicker;
