import React, { useMemo } from 'react';

const NEXT_PHASE_META = {
  diagnostic: { tile: 1, label: 'Diagnostic Quiz' },
  video: { tile: 2, label: 'Video Micro-Lesson A' },
  'check-quiz': { tile: 3, label: 'Short Quiz 1' },
  game: { tile: 4, label: 'Game A' },
  'check-quiz-2': { tile: 5, label: 'Short Quiz 2' },
  'activity-1': { tile: 6, label: 'Interactive Activity A' },
  'check-quiz-3': { tile: 7, label: 'Short Quiz 3' },
  'concept-refresh': { tile: 8, label: 'Concept Reminder' },
  'check-quiz-4': { tile: 9, label: 'Short Quiz 4' },
  game2: { tile: 10, label: 'Game B' },
  'check-quiz-5': { tile: 11, label: 'Short Quiz 5' },
  'activity-2': { tile: 12, label: 'Interactive Activity B' },
  'check-quiz-6': { tile: 13, label: 'Short Quiz 6' },
  'video-2': { tile: 14, label: 'Video Micro-Lesson B' },
  'check-quiz-7': { tile: 15, label: 'Short Quiz 7' },
  game3: { tile: 16, label: 'Game C' },
  'check-quiz-8': { tile: 17, label: 'Short Quiz 8' },
  'activity-3': { tile: 18, label: 'Interactive Activity C' },
  game4: { tile: 19, label: 'Game D' },
  'readiness-quiz': { tile: 20, label: 'Readiness Quiz' },
  'mastery-check': { tile: 21, label: 'Mastery Check' },
};

export default function LoopContinueButton({
  onClick,
  label = 'Continue →',
  fixed = true,
  zIndex = 9999,
  bottom = 24,
}) {
  const nextTileHint = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search || '');
      let nextPhase = params.get('returnPhase') || '';

      if (!nextPhase) {
        const rawReturn = params.get('returnUrl') || '';
        if (rawReturn) {
          const decoded = decodeURIComponent(rawReturn);
          const parsed = new URL(decoded, window.location.origin);
          nextPhase = parsed.searchParams.get('phase') || '';
        }
      }

      const meta = NEXT_PHASE_META[nextPhase];
      if (!meta) return '';
      return `Next tile ${meta.tile}: ${meta.label}`;
    } catch {
      return '';
    }
  }, []);

  const wrapperStyle = fixed
    ? {
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom,
        zIndex,
        animation: 'loopContinuePulse 2s ease-in-out infinite',
      }
    : {};

  return (
    <div style={wrapperStyle}>
      <style>{`
        @keyframes loopContinuePulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(5,150,105,0.4); }
          50% { box-shadow: 0 4px 30px rgba(5,150,105,0.7); }
        }
      `}</style>
      <button
        type="button"
        onClick={onClick}
        style={{
          padding: '16px 36px',
          fontSize: 17,
          fontWeight: 800,
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #059669, #047857)',
          color: '#fff',
          border: '2px solid #34d399',
          borderRadius: 14,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          whiteSpace: 'nowrap',
          letterSpacing: '0.02em',
          boxShadow: '0 4px 20px rgba(5,150,105,0.4)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {label}
      </button>
      {nextTileHint && (
        <div style={{ marginTop: 6, textAlign: 'center', color: '#d1fae5', fontSize: 12, fontWeight: 700 }}>
          {nextTileHint}
        </div>
      )}
    </div>
  );
}
