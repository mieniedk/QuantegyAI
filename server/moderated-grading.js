import { v4 as uuidv4 } from 'uuid';

export function createModeratedGradingRouter(express, db, requireAuth, requireTeacher) {
  const router = express.Router();

  router.get('/:submissionId', requireAuth, (req, res) => {
    try {
      const grades = db.prepare('SELECT * FROM moderated_grades WHERE submissionId = ? ORDER BY createdAt')
        .all(req.params.submissionId);
      res.json({ success: true, grades });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  router.post('/:submissionId', requireTeacher, (req, res) => {
    try {
      const { assessmentId, score, maxScore, rubricScores, comments } = req.body;
      const id = uuidv4();
      db.prepare(
        `INSERT INTO moderated_grades (id, submissionId, assessmentId, graderId, graderName, score, maxScore, rubricScores, comments)
         VALUES (?,?,?,?,?,?,?,?,?)`
      ).run(id, req.params.submissionId, assessmentId || '', req.user.username, req.user.displayName || req.user.username, score, maxScore || 100, JSON.stringify(rubricScores || {}), comments || '');
      const grade = db.prepare('SELECT * FROM moderated_grades WHERE id = ?').get(id);
      res.json({ success: true, grade });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  router.post('/:submissionId/finalize', requireTeacher, (req, res) => {
    try {
      const { gradeId } = req.body;
      if (!gradeId) return res.json({ success: false, error: 'gradeId required.' });

      db.prepare('UPDATE moderated_grades SET isFinal = 0 WHERE submissionId = ?').run(req.params.submissionId);
      db.prepare('UPDATE moderated_grades SET isFinal = 1, selectedBy = ? WHERE id = ?').run(req.user.username, gradeId);

      const grades = db.prepare('SELECT * FROM moderated_grades WHERE submissionId = ? ORDER BY createdAt').all(req.params.submissionId);
      res.json({ success: true, grades });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  return router;
}
