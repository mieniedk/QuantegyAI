/**
 * Subject areas for organizing content (Math, Science, etc.)
 * Used for filtering Games, TExES prep, and grade-level content.
 */

export const SUBJECTS = [
  { id: 'math', label: 'Mathematics', icon: '📐', description: 'TEKS-aligned math games and practice' },
  { id: 'science', label: 'Science', icon: '🔬', description: 'TEKS-aligned science (coming soon)' },
];

/** Get grades that belong to a subject */
export function getGradesBySubject(subjectId, grades) {
  if (!subjectId || subjectId === 'all') return grades;
  return grades.filter((g) => (g.subjectId || g.subject) === subjectId);
}
