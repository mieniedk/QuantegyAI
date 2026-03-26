const SEP = '\u001f';

/**
 * Stable React `key` for remounting PracticeLoop when the URL identifies a different
 * competency/topic (same `/practice-loop` route, new search params).
 *
 * @param {{ get: (name: string) => string | null }} params - URLSearchParams or compatible
 * @returns {string}
 */
export function practiceLoopInstanceKey(params) {
  const examId = params.get('examId') || '';
  const grade = params.get('grade') || '';
  const subject = params.get('subject') || '';
  const comp = params.get('comp') || '';
  const std = params.get('currentStd') || params.get('std') || '';
  const teks = params.get('teks') || '';
  const concept = params.get('concept') || '';
  return [examId, grade, subject, comp, std, teks, concept].join(SEP);
}
