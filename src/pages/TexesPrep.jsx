import React from 'react';
import TestPrepPage from './TestPrepPage';
import { getQuestionsForExam, getDomainsForExam, getStandardForQuestion, TEXES_TEST_CONFIG } from '../data/texes-questions';
import { hasPaidProAccess } from '../utils/subscription';

const EXAM_OPTIONS = [
  { id: 'math712', label: 'Math 7–12', examLabel: 'Mathematics (235)', questions: 90, domains: 6 },
  { id: 'ela712', label: 'ELA 7–12', examLabel: 'English Language Arts and Reading (231)', questions: 100, domains: 4 },
  { id: 'physicalScience', label: 'Physical Science 6–12', examLabel: 'Physical Science (237)', questions: 90, domains: 4 },
  { id: 'chemistry', label: 'Chemistry 7–12', examLabel: 'Chemistry (240)', questions: 100, domains: 4 },
  { id: 'science712', label: 'Science 7–12', examLabel: 'Science (236)', questions: 140, domains: 10 },
  { id: 'lifeScience712', label: 'Life Science 7–12', examLabel: 'Life Science (238)', questions: 100, domains: 6 },
  { id: 'physicsMath612', label: 'Physics/Math 6–12', examLabel: 'Physics/Mathematics (243)', questions: 120, domains: 9 },
  { id: 'socialStudies712', label: 'Social Studies 7–12', examLabel: 'Social Studies (232)', questions: 140, domains: 7 },
  { id: 'history712', label: 'History 7–12', examLabel: 'History (233)', questions: 100, domains: 4 },
  { id: 'bilingual', label: 'Bilingual Education Supplemental', examLabel: 'Bilingual Education Supplemental (164)', questions: 80, domains: 4 },
  { id: 'esl', label: 'ESL Supplemental', examLabel: 'ESL Supplemental (154)', questions: 80, domains: 3 },
  { id: 'specialEd', label: 'Special Education EC–12', examLabel: 'Special Education EC–12 (161)', questions: 150, domains: 4 },
  { id: 'ppr', label: 'PPR EC–12', examLabel: 'PPR EC–12 (160)', questions: 100, domains: 4 },
  { id: 'bilingualSpanish', label: 'BTLPT Spanish', examLabel: 'Bilingual Target Language Spanish (190)', questions: 84, domains: 4 },
  { id: 'ela48', label: 'ELA 4–8', examLabel: 'ELA and Reading (117)', questions: 100, domains: 2 },
  { id: 'science48', label: 'Science 4–8', examLabel: 'Science (116)', questions: 100, domains: 5 },
  { id: 'socialStudies48', label: 'Social Studies 4–8', examLabel: 'Social Studies (118)', questions: 100, domains: 6 },
  { id: 'math48', label: 'Math 4–8', examLabel: 'Mathematics (115)', questions: 100, domains: 6 },
  { id: 'ec6', label: 'Core Subjects EC–6 — Math', examLabel: 'Core Subjects (291) Math', questions: 47, domains: 6 },
  { id: 'ec6_ela', label: 'Core Subjects EC–6 — ELA', examLabel: 'Core Subjects (291) ELA', questions: 45, domains: 4 },
  { id: 'ec6_science', label: 'Core Subjects EC–6 — Science', examLabel: 'Core Subjects (291) Science', questions: 45, domains: 3 },
  { id: 'ec6_social', label: 'Core Subjects EC–6 — Social Studies', examLabel: 'Core Subjects (291) Social Studies', questions: 45, domains: 3 },
  { id: 'ec6_full', label: 'Core Subjects EC–6 — Full (all subjects)', examLabel: 'Core Subjects (291) Full', questions: 182, domains: 16 },
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
  { id: 'calculus', label: 'Calculus', examLabel: 'Calculus', questions: 60, domains: 6 },
];

function getTestConfig(examId) {
  return TEXES_TEST_CONFIG[examId] || TEXES_TEST_CONFIG.math712;
}

const examLabelsForHistory = EXAM_OPTIONS.reduce((acc, o) => {
  acc[o.id] = o.label;
  return acc;
}, {});

export default function TexesPrep() {
  const username = typeof localStorage !== 'undefined' ? localStorage.getItem('quantegy-teacher-user') : null;
  const hasFullExamAccess = username ? hasPaidProAccess(username) : false;

  const texesConfig = {
    title: 'TExES Certification Prep',
    resultsStorageKey: 'quantegyai-texes-results',
    adaptiveStorageKey: 'quantegyai-texes-adaptive',
    examOptions: EXAM_OPTIONS,
    defaultExamId: 'math712',
    getQuestionsForExam,
    getDomainsForExam,
    getStandardForQuestion,
    getTestConfig,
    hasFullExamAccess,
    examLabelsForHistory,
    backLink: '/teacher-dashboard',
    math712LearningPath: '/math-712-learning-path',
  };

  return <TestPrepPage config={texesConfig} />;
}
