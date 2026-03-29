/**
 * TExES certification exam list and helpers for Class Wizard & ClassView.
 * Keeps a single source of exam options and gradeId/contentGradeId mapping.
 */

import { getDomainsForExam } from './texes-questions';

export const TEXES_EXAM_OPTIONS = [
  { id: 'math712', label: 'Math 7–12', examLabel: 'Mathematics (235)', questions: 90, domains: 6 },
  { id: 'math48', label: 'Math 4–8', examLabel: 'Mathematics (115)', questions: 100, domains: 6 },
  { id: 'ec6', label: 'Core Subjects EC–6', examLabel: 'Core Subjects (291)', questions: 47, domains: 6 },
  { id: 'ela712', label: 'ELA 7–12', examLabel: 'English Language Arts and Reading (231)', questions: 100, domains: 4 },
  { id: 'ela48', label: 'ELA 4–8', examLabel: 'ELA and Reading (117)', questions: 100, domains: 2 },
  { id: 'physicalScience', label: 'Physical Science 6–12', examLabel: 'Physical Science (237)', questions: 90, domains: 4 },
  { id: 'chemistry', label: 'Chemistry 7–12', examLabel: 'Chemistry (240)', questions: 100, domains: 4 },
  { id: 'science712', label: 'Science 7–12', examLabel: 'Science (236)', questions: 140, domains: 10 },
  { id: 'science48', label: 'Science 4–8', examLabel: 'Science (116)', questions: 100, domains: 5 },
  { id: 'lifeScience712', label: 'Life Science 7–12', examLabel: 'Life Science (238)', questions: 100, domains: 6 },
  { id: 'physicsMath612', label: 'Physics/Math 6–12', examLabel: 'Physics/Mathematics (243)', questions: 120, domains: 9 },
  { id: 'socialStudies712', label: 'Social Studies 7–12', examLabel: 'Social Studies (232)', questions: 140, domains: 7 },
  { id: 'socialStudies48', label: 'Social Studies 4–8', examLabel: 'Social Studies (118)', questions: 100, domains: 6 },
  { id: 'history712', label: 'History 7–12', examLabel: 'History (233)', questions: 100, domains: 4 },
  { id: 'bilingual', label: 'Bilingual Education Supplemental', examLabel: 'Bilingual Education Supplemental (164)', questions: 80, domains: 4 },
  { id: 'bilingualSpanish', label: 'BTLPT Spanish', examLabel: 'Bilingual Target Language Spanish (190)', questions: 84, domains: 4 },
  { id: 'esl', label: 'ESL Supplemental', examLabel: 'ESL Supplemental (154)', questions: 80, domains: 3 },
  { id: 'specialEd', label: 'Special Education EC–12', examLabel: 'Special Education EC–12 (161)', questions: 150, domains: 4 },
  { id: 'ppr', label: 'PPR EC–12', examLabel: 'PPR EC–12 (160)', questions: 100, domains: 4 },
  { id: 'str', label: 'Science of Teaching Reading', examLabel: 'Science of Teaching Reading (293)', questions: 90, domains: 4 },
  { id: 'artEC12', label: 'Art EC–12', examLabel: 'Art EC–12 (178)', questions: 100, domains: 4 },
  { id: 'musicEC12', label: 'Music EC–12', examLabel: 'Music EC–12 (177)', questions: 100, domains: 5 },
  { id: 'peEC12', label: 'Physical Education EC–12', examLabel: 'Physical Education EC–12 (258)', questions: 90, domains: 5 },
  { id: 'cs812', label: 'Computer Science 8–12', examLabel: 'Computer Science 8–12 (241)', questions: 100, domains: 4 },
  { id: 'techAppEC12', label: 'Technology Applications EC–12', examLabel: 'Technology Applications EC–12 (242)', questions: 100, domains: 4 },
  { id: 'readingSpecialist', label: 'Reading Specialist', examLabel: 'Reading Specialist (151)', questions: 100, domains: 4 },
  { id: 'schoolCounselor', label: 'School Counselor', examLabel: 'School Counselor (252)', questions: 90, domains: 4 },
  { id: 'loteSpanish', label: 'LOTE Spanish', examLabel: 'LOTE Spanish (613)', questions: 120, domains: 6 },
  { id: 'linearAlgebra', label: 'Linear Algebra', examLabel: 'Linear Algebra', questions: 60, domains: 6 },
];

/** Content key for COURSE_CONTENT (used by populateCourseContent). */
export function getContentGradeIdForExam(examId) {
  if (examId === 'math712') return 'grade7-12';
  if (examId === 'math48') return 'grade4-8';
  if (examId === 'ec6') return 'grade-ec6';
  return `texes-${examId}`;
}

/** gradeId stored on the class (used by ClassView, ContentModules). */
export function getGradeIdForExam(examId) {
  if (examId === 'math712') return 'texes';
  if (examId === 'math48') return 'grade4-8';
  if (examId === 'ec6') return 'grade-ec6';
  return `texes-${examId}`;
}

/** Reverse: from class.gradeId to examId. */
export function getExamIdFromGradeId(gradeId) {
  if (gradeId === 'texes') return 'math712';
  if (gradeId === 'grade4-8') return 'math48';
  if (gradeId === 'grade-ec6') return 'ec6';
  if (gradeId && gradeId.startsWith('texes-')) return gradeId.slice(6);
  return null;
}

/** Domains list for a TExES class (by class.gradeId). Returns [] if not a TExES gradeId. */
export function getDomainsForGradeId(gradeId) {
  if (!gradeId) return [];
  const examId = getExamIdFromGradeId(gradeId);
  return examId ? getDomainsForExam(examId) : [];
}

/** Human-readable label for class type / review step. */
export function getExamLabel(examId) {
  const opt = TEXES_EXAM_OPTIONS.find((e) => e.id === examId);
  return opt ? opt.label : examId;
}
