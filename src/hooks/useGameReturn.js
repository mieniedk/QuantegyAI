import { useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'practice-loop-return';

export default function useGameReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const fromParams = searchParams.get('returnUrl') || '';
  const fromStorage = (() => {
    try { return sessionStorage.getItem(STORAGE_KEY) || ''; } catch { return ''; }
  })();

  const teksParam = searchParams.get('teks') || '';
  const gradeParam = searchParams.get('grade') || '';
  const buildFallback = () => {
    if (!teksParam) return '';
    const p = new URLSearchParams();
    p.set('teks', teksParam);
    if (gradeParam) p.set('grade', gradeParam);
    p.set('phase', 'reminder');
    return `/practice-loop?${p}`;
  };

  const returnUrl = useMemo(
    () => fromParams || fromStorage || buildFallback(),
    [fromParams, fromStorage, teksParam, gradeParam],
  );

  useEffect(() => {
    if (fromParams) {
      try { sessionStorage.setItem(STORAGE_KEY, fromParams); } catch (_) {}
    }
  }, [fromParams]);

  const goBack = () => {
    if (returnUrl) navigate(returnUrl);
    else navigate('/games');
  };

  return { returnUrl, goBack };
}
