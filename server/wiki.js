import { v4 as uuidv4 } from 'uuid';

export function createWikiRouter(express, db, requireAuth, requireTeacher) {
  const router = express.Router();

  router.get('/:classId', requireAuth, (req, res) => {
    try {
      const pages = db.prepare('SELECT * FROM wiki_pages WHERE classId = ? ORDER BY title').all(req.params.classId);
      res.json({ success: true, pages });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  router.get('/:classId/:pageId', requireAuth, (req, res) => {
    try {
      const page = db.prepare('SELECT * FROM wiki_pages WHERE id = ? AND classId = ?').get(req.params.pageId, req.params.classId);
      if (!page) return res.status(404).json({ success: false, error: 'Page not found.' });
      res.json({ success: true, page });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  router.get('/:classId/:pageId/revisions', requireAuth, (req, res) => {
    try {
      const revisions = db.prepare('SELECT * FROM wiki_revisions WHERE pageId = ? ORDER BY createdAt DESC').all(req.params.pageId);
      res.json({ success: true, revisions });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  router.post('/:classId', requireTeacher, (req, res) => {
    try {
      const id = uuidv4();
      const { title, body } = req.body;
      const now = new Date().toISOString();
      db.prepare(
        'INSERT INTO wiki_pages (id, classId, title, body, createdBy, updatedBy, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?)'
      ).run(id, req.params.classId, title || 'Untitled Page', body || '', req.user.username, req.user.username, now, now);
      const page = db.prepare('SELECT * FROM wiki_pages WHERE id = ?').get(id);
      res.json({ success: true, page });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  router.put('/:classId/:pageId', requireTeacher, (req, res) => {
    try {
      const { title, body } = req.body;
      const existing = db.prepare('SELECT * FROM wiki_pages WHERE id = ?').get(req.params.pageId);
      if (!existing) return res.status(404).json({ success: false, error: 'Page not found.' });

      if (existing.body !== body) {
        db.prepare('INSERT INTO wiki_revisions (pageId, body, editedBy) VALUES (?,?,?)')
          .run(req.params.pageId, existing.body, existing.updatedBy || existing.createdBy);
      }

      const now = new Date().toISOString();
      db.prepare('UPDATE wiki_pages SET title=?, body=?, updatedBy=?, updatedAt=? WHERE id=?')
        .run(title || existing.title, body ?? existing.body, req.user.username, now, req.params.pageId);

      const page = db.prepare('SELECT * FROM wiki_pages WHERE id = ?').get(req.params.pageId);
      res.json({ success: true, page });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  router.delete('/:classId/:pageId', requireTeacher, (req, res) => {
    try {
      db.prepare('DELETE FROM wiki_revisions WHERE pageId = ?').run(req.params.pageId);
      db.prepare('DELETE FROM wiki_pages WHERE id = ? AND classId = ?').run(req.params.pageId, req.params.classId);
      res.json({ success: true });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  return router;
}
