import { v4 as uuidv4 } from 'uuid';

export function createAnnotationsRouter(express, db, requireAuth) {
  const router = express.Router();

  router.get('/:submissionId', requireAuth, (req, res) => {
    try {
      const annotations = db.prepare('SELECT * FROM annotations WHERE submissionId = ? ORDER BY pageNum, y')
        .all(req.params.submissionId);
      res.json({ success: true, annotations });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  router.post('/:submissionId', requireAuth, (req, res) => {
    try {
      const { pageNum, x, y, width, height, type, content, color } = req.body;
      const id = uuidv4();
      db.prepare(
        `INSERT INTO annotations (id, submissionId, pageNum, x, y, width, height, type, content, color, authorId, authorName)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
      ).run(id, req.params.submissionId, pageNum || 1, x || 0, y || 0, width || null, height || null, type || 'comment', content || '', color || '#facc15', req.user.username, req.user.displayName || req.user.username);
      const annotation = db.prepare('SELECT * FROM annotations WHERE id = ?').get(id);
      res.json({ success: true, annotation });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  router.delete('/:submissionId/:annotationId', requireAuth, (req, res) => {
    try {
      db.prepare('DELETE FROM annotations WHERE id = ? AND submissionId = ?')
        .run(req.params.annotationId, req.params.submissionId);
      res.json({ success: true });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  return router;
}
