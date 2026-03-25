/**
 * Maps examId → subject area so the practice loop can select
 * competency-appropriate interactive activities.
 */

const EXAM_SUBJECT_MAP = {
  math712: 'math',
  math48: 'math',
  ec6: 'math',
  physicsMath612: 'math',

  ela712: 'ela',
  ela48: 'ela',
  ec6_ela: 'ela',
  str: 'ela',
  readingSpecialist: 'ela',
  bilingual: 'ela',
  bilingualSpanish: 'ela',
  esl: 'ela',
  loteSpanish: 'ela',

  physicalScience: 'science',
  chemistry: 'science',
  science712: 'science',
  science48: 'science',
  lifeScience712: 'science',
  ec6_science: 'science',

  socialStudies712: 'social',
  socialStudies48: 'social',
  history712: 'social',
  ec6_social: 'social',

  ppr: 'pedagogy',
  specialEd: 'pedagogy',
  schoolCounselor: 'pedagogy',

  artEC12: 'arts',
  musicEC12: 'arts',
  peEC12: 'pe',

  cs812: 'tech',
  techAppEC12: 'tech',
};

export function getSubjectForExam(examId) {
  if (!examId) return 'general';
  if (EXAM_SUBJECT_MAP[examId]) return EXAM_SUBJECT_MAP[examId];
  if (examId === 'ec6_full') return 'general';
  return 'general';
}
