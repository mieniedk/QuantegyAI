import React, { useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import Calculator, { CALC_TYPE_BY_EXAM } from './Calculator';
import ScratchPad from './ScratchPad';

const CALC_LABELS = { graphing: 'TI-84', scientific: 'Scientific', basic: 'Calc' };

export default function GlobalLoopCalculator() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [calcOpen, setCalcOpen] = useState(false);
  const [padOpen, setPadOpen] = useState(false);

  if (location.pathname === '/practice-loop') return null;

  const fromLoop = searchParams.get('from') === 'loop';
  const examId = searchParams.get('examId');
  if (!fromLoop || !examId) return null;

  const calcType = CALC_TYPE_BY_EXAM[examId];

  return (
    <>
      <div style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 9998, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setPadOpen((o) => !o)}
          aria-label={padOpen ? 'Close scratch pad' : 'Open scratch pad'}
          style={{
            height: 44, borderRadius: 22, padding: '0 16px 0 12px',
            background: padOpen ? '#1e293b' : '#6d28d9', color: '#fff',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
            transition: 'background 0.15s',
          }}
        >
          {padOpen ? '\u2715' : '\u270F\uFE0F'} Scratch Pad
        </button>
        {calcType && (
          <button
            type="button"
            onClick={() => setCalcOpen((o) => !o)}
            aria-label={calcOpen ? 'Close calculator' : 'Open calculator'}
            style={{
              height: 44, borderRadius: 22, padding: '0 16px 0 12px',
              background: calcOpen ? '#1e293b' : '#2563eb', color: '#fff',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
          >
            {calcOpen ? '\u2715' : '\uD83D\uDDA9'}{' '}
            {CALC_LABELS[calcType] || 'Calc'}
          </button>
        )}
      </div>
      <ScratchPad open={padOpen} onClose={() => setPadOpen(false)} />
      {calcType && <Calculator mode={calcType} open={calcOpen} onClose={() => setCalcOpen(false)} />}
    </>
  );
}
