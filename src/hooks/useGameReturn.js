import { useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'practice-loop-return';
const GAME_PHASE_CONTINUE_MAP = {
  game: 'check-quiz-2',
  game2: 'check-quiz-5',
  game3: 'check-quiz-8',
  game4: 'readiness-quiz',
};

function normalizeLoopReturnUrl(rawUrl) {
  if (!rawUrl) return '';
  try {
    const parsed = new URL(rawUrl, window.location.origin);
    if (!parsed.pathname.startsWith('/practice-loop')) return rawUrl;
    const phase = parsed.searchParams.get('phase') || '';
    const mapped = GAME_PHASE_CONTINUE_MAP[phase];
    if (!mapped) return rawUrl;
    parsed.searchParams.set('phase', mapped);
    return `${parsed.pathname}?${parsed.searchParams.toString()}`;
  } catch {
    return rawUrl;
  }
}

export default function useGameReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEmbedded = searchParams.get('embed') === '1';

  const fromParams = searchParams.get('returnUrl') || '';
  const fromStorage = (() => {
    try { return sessionStorage.getItem(STORAGE_KEY) || ''; } catch { return ''; }
  })();

  const teksParam = searchParams.get('teks') || '';
  const gradeParam = searchParams.get('grade') || '';
  const labelParam = searchParams.get('label') || '';
  const compParam = searchParams.get('comp') || '';
  const stdParam = searchParams.get('currentStd') || searchParams.get('std') || '';
  const examParam = searchParams.get('examId') || '';
  const explicitReturnPhase = searchParams.get('returnPhase') || '';
  const buildFallback = () => {
    if (!teksParam && !explicitReturnPhase) return '';
    const p = new URLSearchParams();
    if (teksParam) p.set('teks', teksParam);
    if (gradeParam) p.set('grade', gradeParam);
    if (labelParam) p.set('label', labelParam);
    if (compParam) p.set('comp', compParam);
    if (stdParam) p.set('currentStd', stdParam);
    if (examParam) p.set('examId', examParam);
    p.set('phase', explicitReturnPhase || 'reminder');
    return `/practice-loop?${p}`;
  };

  const returnUrl = useMemo(() => {
    const candidate = fromParams || fromStorage || buildFallback();
    return normalizeLoopReturnUrl(candidate);
  }, [fromParams, fromStorage, teksParam, gradeParam, labelParam, compParam, stdParam, examParam, explicitReturnPhase]);

  useEffect(() => {
    if (fromParams) {
      try { sessionStorage.setItem(STORAGE_KEY, fromParams); } catch (_) {}
    }
  }, [fromParams]);

  const goBack = () => {
    if (typeof window !== 'undefined' && isEmbedded && window.parent && window.parent !== window) {
      try {
        const url = returnUrl || '/practice-loop';
        window.parent.postMessage({ type: 'loopGameNavigate', url }, '*');
      } catch (_) {}
      return;
    }
    if (returnUrl) navigate(returnUrl);
    else navigate('/games');
  };

  return { returnUrl, goBack, isEmbedded };
}
