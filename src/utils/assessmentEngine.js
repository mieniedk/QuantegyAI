/**
 * Assessment Engine — Core logic for the full assessment system.
 * Handles: question types, grading, submissions, item analysis, proctoring events.
 */

const STORAGE_PREFIX = 'allen-ace-';
const KEYS = {
  assessments: `${STORAGE_PREFIX}assessments`,
  submissions: `${STORAGE_PREFIX}submissions`,
  proctoringLogs: `${STORAGE_PREFIX}proctoring-logs`,
};

// ─── 14+ Question Types ────────────────────────────────────────
export const QUESTION_TYPES = [
  { id: 'multiple-choice', label: 'Multiple Choice', icon: '\u2B55', autoGrade: true, category: 'objective' },
  { id: 'select-all', label: 'Select All That Apply', icon: '\u2611\uFE0F', autoGrade: true, category: 'objective' },
  { id: 'true-false', label: 'True / False', icon: '\u2696\uFE0F', autoGrade: true, category: 'objective' },
  { id: 'short-answer', label: 'Short Answer', icon: '\u270D\uFE0F', autoGrade: true, category: 'objective' },
  { id: 'fill-blank', label: 'Fill in the Blank', icon: '\u2588\u2581\u2588', autoGrade: true, category: 'objective' },
  { id: 'matching', label: 'Matching', icon: '\uD83D\uDD17', autoGrade: true, category: 'objective' },
  { id: 'ordering', label: 'Ordering / Sequencing', icon: '\uD83D\uDD22', autoGrade: true, category: 'objective' },
  { id: 'numeric', label: 'Numeric (with tolerance)', icon: '\uD83D\uDD22', autoGrade: true, category: 'objective' },
  { id: 'categorization', label: 'Categorization / Sorting', icon: '\uD83D\uDDC2\uFE0F', autoGrade: true, category: 'objective' },
  { id: 'formula', label: 'Formula / Equation', icon: '\u222B', autoGrade: true, category: 'objective' },
  { id: 'essay', label: 'Essay', icon: '\uD83D\uDCDD', autoGrade: false, category: 'subjective' },
  { id: 'file-upload', label: 'File Upload', icon: '\uD83D\uDCC1', autoGrade: false, category: 'subjective' },
  { id: 'url', label: 'URL Submission', icon: '\uD83D\uDD17', autoGrade: false, category: 'subjective' },
  { id: 'hot-spot', label: 'Hot Spot (Image Click)', icon: '\uD83D\uDDBC\uFE0F', autoGrade: false, category: 'interactive' },
  { id: 'likert', label: 'Likert Scale / Survey', icon: '\uD83D\uDCCA', autoGrade: false, category: 'survey' },
];

export const getQuestionType = (id) => QUESTION_TYPES.find((t) => t.id === id);

// ─── Assessment CRUD ───────────────────────────────────────────
const _load = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
const _save = (key, data) => localStorage.setItem(key, JSON.stringify(data));

export const getAssessments = () => _load(KEYS.assessments);
export const saveAssessments = (a) => _save(KEYS.assessments, a);

export const getAssessment = (id) => getAssessments().find((a) => a.id === id) || null;

export const createAssessment = (data) => {
  const all = getAssessments();
  const assessment = {
    id: `asmt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
    ...data,
    settings: {
      timeLimit: 0,
      maxAttempts: 1,
      shuffleQuestions: false,
      shuffleOptions: false,
      showFeedback: 'after-submit',
      showScore: true,
      allowBacktrack: true,
      requireLockdown: false,
      proctoringLevel: 'none',
      passingScore: 60,
      latePolicy: 'none',
      partialCredit: true,
      ...(data.settings || {}),
    },
  };
  all.push(assessment);
  saveAssessments(all);
  return assessment;
};

export const updateAssessment = (id, updates) => {
  const all = getAssessments();
  const idx = all.findIndex((a) => a.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
  saveAssessments(all);
  return all[idx];
};

export const deleteAssessment = (id) => {
  saveAssessments(getAssessments().filter((a) => a.id !== id));
};

export const publishAssessment = (id) => updateAssessment(id, { status: 'published' });

// ─── Submission System ─────────────────────────────────────────
export const getSubmissions = () => _load(KEYS.submissions);
export const saveSubmissions = (s) => _save(KEYS.submissions, s);

export const getSubmission = (id) => getSubmissions().find((s) => s.id === id) || null;

export const getStudentSubmissions = (assessmentId, studentId) =>
  getSubmissions().filter((s) => s.assessmentId === assessmentId && s.studentId === studentId);

export const getAssessmentSubmissions = (assessmentId) =>
  getSubmissions().filter((s) => s.assessmentId === assessmentId);

export const startSubmission = (assessmentId, studentId, studentName) => {
  const assessment = getAssessment(assessmentId);
  if (!assessment) return null;

  const existing = getStudentSubmissions(assessmentId, studentId);
  const max = assessment.settings?.maxAttempts || 1;
  if (max > 0 && existing.filter((s) => s.status === 'submitted' || s.status === 'graded').length >= max) {
    return { error: 'Max attempts reached' };
  }

  const inProgress = existing.find((s) => s.status === 'in-progress');
  if (inProgress) return inProgress;

  let questions = [...(assessment.questions || [])];
  if (assessment.settings?.shuffleQuestions) {
    questions = questions.sort(() => Math.random() - 0.5);
  }
  if (assessment.settings?.shuffleOptions) {
    questions = questions.map((q) => {
      if (q.options && Array.isArray(q.options)) {
        return { ...q, options: [...q.options].sort(() => Math.random() - 0.5) };
      }
      if (q.options && typeof q.options === 'object' && !Array.isArray(q.options)) {
        const entries = Object.entries(q.options);
        const shuffled = entries.sort(() => Math.random() - 0.5);
        return { ...q, options: Object.fromEntries(shuffled) };
      }
      return q;
    });
  }

  const sub = {
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    assessmentId,
    studentId,
    studentName: studentName || 'Student',
    status: 'in-progress',
    startedAt: new Date().toISOString(),
    answers: {},
    flagged: [],
    timeSpent: 0,
    proctoringEvents: [],
    questions,
    attemptNumber: existing.length + 1,
  };

  const all = getSubmissions();
  all.push(sub);
  saveSubmissions(all);
  return sub;
};

export const saveAnswer = (submissionId, questionId, answer) => {
  const all = getSubmissions();
  const idx = all.findIndex((s) => s.id === submissionId);
  if (idx < 0) return null;
  all[idx].answers[questionId] = { value: answer, savedAt: new Date().toISOString() };
  all[idx].lastSavedAt = new Date().toISOString();
  saveSubmissions(all);
  return all[idx];
};

export const toggleFlag = (submissionId, questionId) => {
  const all = getSubmissions();
  const idx = all.findIndex((s) => s.id === submissionId);
  if (idx < 0) return null;
  const flagged = all[idx].flagged || [];
  const fi = flagged.indexOf(questionId);
  if (fi >= 0) flagged.splice(fi, 1); else flagged.push(questionId);
  all[idx].flagged = flagged;
  saveSubmissions(all);
  return all[idx];
};

export const updateTimeSpent = (submissionId, seconds) => {
  const all = getSubmissions();
  const idx = all.findIndex((s) => s.id === submissionId);
  if (idx < 0) return;
  all[idx].timeSpent = seconds;
  saveSubmissions(all);
};

// ─── Auto-Grading Engine ───────────────────────────────────────

const _normalize = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');

const graders = {
  'multiple-choice': (q, answer) => {
    return _normalize(answer) === _normalize(q.correct) ? q.points || 1 : 0;
  },

  'select-all': (q, answer) => {
    const selected = Array.isArray(answer) ? answer.map(_normalize).sort() : [];
    const correct = (q.correct || []).map(_normalize).sort();
    if (selected.length !== correct.length) {
      if (!q.partialCredit) return 0;
      const hits = selected.filter((s) => correct.includes(s)).length;
      const penalties = selected.filter((s) => !correct.includes(s)).length;
      return Math.max(0, ((hits - penalties) / correct.length) * (q.points || 1));
    }
    return JSON.stringify(selected) === JSON.stringify(correct) ? (q.points || 1) : 0;
  },

  'true-false': (q, answer) => {
    const a = typeof answer === 'string' ? answer.toLowerCase() === 'true' : !!answer;
    return a === q.correct ? (q.points || 1) : 0;
  },

  'short-answer': (q, answer) => {
    const acceptable = (q.acceptedAnswers || [q.correct]).map(_normalize);
    return acceptable.includes(_normalize(answer)) ? (q.points || 1) : 0;
  },

  'fill-blank': (q, answer) => {
    const blanks = q.blanks || [{ correct: q.correct }];
    const answers = Array.isArray(answer) ? answer : [answer];
    let earned = 0;
    const perBlank = (q.points || blanks.length) / blanks.length;
    blanks.forEach((blank, i) => {
      const acceptable = (blank.acceptedAnswers || [blank.correct]).map(_normalize);
      if (acceptable.includes(_normalize(answers[i]))) earned += perBlank;
    });
    return earned;
  },

  'matching': (q, answer) => {
    const pairs = q.pairs || [];
    const ans = answer || {};
    let correct = 0;
    pairs.forEach((pair) => {
      if (_normalize(ans[pair.left]) === _normalize(pair.right)) correct++;
    });
    if (q.partialCredit !== false) return (correct / pairs.length) * (q.points || pairs.length);
    return correct === pairs.length ? (q.points || pairs.length) : 0;
  },

  'ordering': (q, answer) => {
    const correct = q.correctOrder || [];
    const ans = Array.isArray(answer) ? answer : [];
    if (ans.length !== correct.length) return 0;
    let matched = 0;
    correct.forEach((item, i) => { if (_normalize(ans[i]) === _normalize(item)) matched++; });
    if (q.partialCredit !== false) return (matched / correct.length) * (q.points || correct.length);
    return matched === correct.length ? (q.points || correct.length) : 0;
  },

  'numeric': (q, answer) => {
    const num = parseFloat(answer);
    if (isNaN(num)) return 0;
    const target = parseFloat(q.correct);
    const tolerance = q.tolerance || 0;
    return Math.abs(num - target) <= tolerance ? (q.points || 1) : 0;
  },

  'categorization': (q, answer) => {
    const categories = q.categories || {};
    const ans = answer || {};
    let total = 0;
    let correct = 0;
    Object.entries(categories).forEach(([cat, items]) => {
      const expected = items.map(_normalize);
      const given = (ans[cat] || []).map(_normalize);
      total += expected.length;
      expected.forEach((item) => { if (given.includes(item)) correct++; });
    });
    if (total === 0) return 0;
    return (correct / total) * (q.points || total);
  },

  'formula': (q, answer) => {
    const num = parseFloat(answer);
    if (isNaN(num)) return 0;
    const target = parseFloat(q.correct);
    const tolerance = q.tolerance || 0.01;
    return Math.abs(num - target) <= tolerance ? (q.points || 1) : 0;
  },

  'likert': () => 0,
  'essay': () => null,
  'file-upload': () => null,
  'url': () => null,
  'hot-spot': () => null,
};

export const gradeQuestion = (question, answer) => {
  const grader = graders[question.type];
  if (!grader) return null;
  return grader(question, answer);
};

export const gradeSubmission = (submission, assessment) => {
  const questions = submission.questions || assessment?.questions || [];
  const results = {};
  let totalPoints = 0;
  let earnedPoints = 0;
  let autoGraded = 0;
  let needsManual = 0;

  questions.forEach((q) => {
    const answer = submission.answers[q.id]?.value;
    const score = gradeQuestion(q, answer);
    const maxPoints = q.points || 1;
    totalPoints += maxPoints;

    if (score === null) {
      needsManual++;
      results[q.id] = { score: null, maxPoints, status: 'needs-review', answer };
    } else {
      autoGraded++;
      earnedPoints += score;
      results[q.id] = { score: Math.round(score * 100) / 100, maxPoints, status: 'graded', answer };
    }
  });

  return {
    results,
    totalPoints,
    earnedPoints: Math.round(earnedPoints * 100) / 100,
    percentage: totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 10000) / 100 : 0,
    autoGraded,
    needsManual,
    allGraded: needsManual === 0,
  };
};

export const submitAssessment = (submissionId) => {
  const all = getSubmissions();
  const idx = all.findIndex((s) => s.id === submissionId);
  if (idx < 0) return null;

  const sub = all[idx];
  sub.status = 'submitted';
  sub.submittedAt = new Date().toISOString();

  const assessment = getAssessment(sub.assessmentId);
  const gradeResult = gradeSubmission(sub, assessment);
  sub.gradeResult = gradeResult;
  sub.status = gradeResult.allGraded ? 'graded' : 'submitted';

  saveSubmissions(all);
  return sub;
};

export const manualGradeQuestion = (submissionId, questionId, score, feedback) => {
  const all = getSubmissions();
  const idx = all.findIndex((s) => s.id === submissionId);
  if (idx < 0) return null;

  const sub = all[idx];
  if (!sub.gradeResult) return null;

  sub.gradeResult.results[questionId] = {
    ...sub.gradeResult.results[questionId],
    score,
    status: 'graded',
    feedback,
    manuallyGraded: true,
  };

  let earned = 0;
  let total = 0;
  let needsManual = 0;
  Object.values(sub.gradeResult.results).forEach((r) => {
    total += r.maxPoints;
    if (r.status === 'needs-review') needsManual++;
    else earned += r.score || 0;
  });

  sub.gradeResult.earnedPoints = Math.round(earned * 100) / 100;
  sub.gradeResult.totalPoints = total;
  sub.gradeResult.percentage = total > 0 ? Math.round((earned / total) * 10000) / 100 : 0;
  sub.gradeResult.needsManual = needsManual;
  sub.gradeResult.allGraded = needsManual === 0;
  if (needsManual === 0) sub.status = 'graded';

  saveSubmissions(all);
  return sub;
};

// ─── Proctoring Event Logger ───────────────────────────────────
export const PROCTORING_LEVELS = {
  none: { label: 'No Proctoring', features: [] },
  basic: { label: 'Basic', features: ['tab-switch', 'copy-paste'] },
  moderate: { label: 'Moderate', features: ['tab-switch', 'copy-paste', 'fullscreen', 'right-click'] },
  strict: { label: 'Strict', features: ['tab-switch', 'copy-paste', 'fullscreen', 'right-click', 'webcam'] },
};

export const logProctoringEvent = (submissionId, event) => {
  const all = getSubmissions();
  const idx = all.findIndex((s) => s.id === submissionId);
  if (idx < 0) return;
  if (!all[idx].proctoringEvents) all[idx].proctoringEvents = [];
  all[idx].proctoringEvents.push({
    ...event,
    timestamp: new Date().toISOString(),
  });
  saveSubmissions(all);
};

// ─── Item Analysis ─────────────────────────────────────────────
export const computeItemAnalysis = (assessmentId) => {
  const submissions = getAssessmentSubmissions(assessmentId)
    .filter((s) => s.status === 'graded' || s.status === 'submitted');
  const assessment = getAssessment(assessmentId);
  if (!assessment || submissions.length < 2) return null;

  const questions = assessment.questions || [];
  const n = submissions.length;

  const totalScores = submissions.map((s) => s.gradeResult?.percentage || 0).sort((a, b) => a - b);
  const cutoff27 = Math.max(1, Math.floor(n * 0.27));
  const lowGroup = new Set(submissions.sort((a, b) => (a.gradeResult?.percentage || 0) - (b.gradeResult?.percentage || 0)).slice(0, cutoff27).map((s) => s.id));
  const highGroup = new Set(submissions.sort((a, b) => (b.gradeResult?.percentage || 0) - (a.gradeResult?.percentage || 0)).slice(0, cutoff27).map((s) => s.id));

  const analysis = questions.map((q) => {
    let correctCount = 0;
    let highCorrect = 0;
    let lowCorrect = 0;
    const optionCounts = {};

    submissions.forEach((sub) => {
      const result = sub.gradeResult?.results?.[q.id];
      const answer = sub.answers?.[q.id]?.value;
      const isCorrect = result && result.score === result.maxPoints;

      if (isCorrect) {
        correctCount++;
        if (highGroup.has(sub.id)) highCorrect++;
        if (lowGroup.has(sub.id)) lowCorrect++;
      }

      if (q.type === 'multiple-choice' || q.type === 'true-false') {
        const key = String(answer || 'no-answer');
        optionCounts[key] = (optionCounts[key] || 0) + 1;
      }
    });

    const difficulty = n > 0 ? correctCount / n : 0;
    const discrimination = cutoff27 > 0 ? (highCorrect - lowCorrect) / cutoff27 : 0;

    let difficultyLabel = 'moderate';
    if (difficulty < 0.3) difficultyLabel = 'hard';
    else if (difficulty > 0.8) difficultyLabel = 'easy';

    let discriminationLabel = 'good';
    if (discrimination < 0.1) discriminationLabel = 'poor';
    else if (discrimination < 0.2) discriminationLabel = 'fair';
    else if (discrimination > 0.4) discriminationLabel = 'excellent';

    const distractors = {};
    if (q.options) {
      const opts = Array.isArray(q.options) ? q.options : Object.keys(q.options);
      opts.forEach((opt) => {
        const key = typeof opt === 'string' ? opt : opt.id || opt.label;
        const count = optionCounts[key] || 0;
        distractors[key] = {
          count,
          percentage: n > 0 ? Math.round((count / n) * 100) : 0,
          isCorrect: _normalize(key) === _normalize(q.correct),
        };
      });
    }

    return {
      questionId: q.id,
      questionText: q.question || q.statement || '',
      type: q.type,
      difficulty: Math.round(difficulty * 100) / 100,
      difficultyLabel,
      discrimination: Math.round(discrimination * 100) / 100,
      discriminationLabel,
      correctCount,
      totalResponses: n,
      distractors,
      pointBiserial: discrimination,
    };
  });

  return {
    assessmentId,
    totalSubmissions: n,
    averageScore: Math.round(totalScores.reduce((a, b) => a + b, 0) / n * 100) / 100,
    median: totalScores[Math.floor(n / 2)],
    standardDeviation: Math.round(Math.sqrt(totalScores.reduce((acc, s) => acc + Math.pow(s - (totalScores.reduce((a, b) => a + b, 0) / n), 2), 0) / n) * 100) / 100,
    cronbachAlpha: null,
    items: analysis,
  };
};

// ─── Question Pool (random subset from bank) ──────────────────
export const createQuestionPool = (questions, poolSize) => {
  if (!poolSize || poolSize >= questions.length) return questions;
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, poolSize);
};

// ─── Question Templates (empty structures for each type) ──────
export const getQuestionTemplate = (type) => {
  const base = { id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type, points: 1, tags: [], teks: '', bloomLevel: 'remember' };

  const templates = {
    'multiple-choice': { ...base, question: '', options: { A: '', B: '', C: '', D: '' }, correct: 'A', explanation: '' },
    'select-all': { ...base, question: '', options: ['', '', '', ''], correct: [], explanation: '' },
    'true-false': { ...base, statement: '', correct: true, explanation: '' },
    'short-answer': { ...base, question: '', correct: '', acceptedAnswers: [], caseSensitive: false },
    'fill-blank': { ...base, question: '', blanks: [{ correct: '', acceptedAnswers: [] }] },
    'matching': { ...base, question: 'Match the items', pairs: [{ left: '', right: '' }] },
    'ordering': { ...base, question: 'Put these in the correct order', correctOrder: ['', ''], items: ['', ''] },
    'numeric': { ...base, question: '', correct: 0, tolerance: 0, unit: '' },
    'categorization': { ...base, question: 'Sort items into categories', categories: { 'Category 1': [], 'Category 2': [] }, allItems: [] },
    'formula': { ...base, question: '', correct: 0, tolerance: 0.01, variables: {} },
    'essay': { ...base, question: '', rubric: '', maxWords: 500, minWords: 50, points: 10 },
    'file-upload': { ...base, question: '', allowedTypes: ['.pdf', '.docx', '.jpg', '.png'], maxSizeMB: 10, rubric: '', points: 10 },
    'url': { ...base, question: 'Submit a link to your work', rubric: '', points: 10 },
    'hot-spot': { ...base, question: '', imageUrl: '', correctRegion: { x: 0, y: 0, width: 100, height: 100 }, points: 1 },
    'likert': { ...base, question: '', scale: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'], points: 0 },
  };
  return templates[type] || base;
};

export const BLOOM_LEVELS = [
  { id: 'remember', label: 'Remember', color: '#dc2626' },
  { id: 'understand', label: 'Understand', color: '#f59e0b' },
  { id: 'apply', label: 'Apply', color: '#10b981' },
  { id: 'analyze', label: 'Analyze', color: '#3b82f6' },
  { id: 'evaluate', label: 'Evaluate', color: '#7c3aed' },
  { id: 'create', label: 'Create', color: '#ec4899' },
];
