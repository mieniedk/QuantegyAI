import { v4 as uuidv4 } from 'uuid';

export function createSCORMRouter(express, db, requireAuth, requireTeacher) {
  const router = express.Router();

  router.get('/:classId', requireAuth, (req, res) => {
    try {
      const packages = db.prepare('SELECT * FROM scorm_packages WHERE classId = ? ORDER BY createdAt DESC')
        .all(req.params.classId);
      res.json({ success: true, packages });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  router.post('/:classId/upload', requireTeacher, (req, res) => {
    try {
      const id = uuidv4();
      const { title, version, entryUrl } = req.body || {};
      db.prepare(
        'INSERT INTO scorm_packages (id, classId, title, version, entryUrl, uploadedBy) VALUES (?,?,?,?,?,?)'
      ).run(id, req.params.classId, title || 'SCORM Package', version || '1.2', entryUrl || '', req.user.username);
      const pkg = db.prepare('SELECT * FROM scorm_packages WHERE id = ?').get(id);
      res.json({ success: true, package: pkg });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  router.post('/:classId/:packageId/launch', requireAuth, (req, res) => {
    try {
      const { studentId } = req.body;
      const pkg = db.prepare('SELECT * FROM scorm_packages WHERE id = ?').get(req.params.packageId);
      if (!pkg) return res.status(404).json({ success: false, error: 'Package not found.' });

      let attempt = db.prepare(
        'SELECT * FROM scorm_attempts WHERE packageId = ? AND studentId = ? ORDER BY createdAt DESC LIMIT 1'
      ).get(req.params.packageId, studentId || req.user.username);

      if (!attempt || attempt.status === 'completed') {
        const id = uuidv4();
        db.prepare(
          'INSERT INTO scorm_attempts (id, packageId, studentId, status) VALUES (?,?,?,?)'
        ).run(id, req.params.packageId, studentId || req.user.username, 'incomplete');
        attempt = db.prepare('SELECT * FROM scorm_attempts WHERE id = ?').get(id);
      }

      res.json({ success: true, attempt, entryUrl: pkg.entryUrl });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  router.post('/:classId/:packageId/commit', requireAuth, (req, res) => {
    try {
      const { attemptId, key, value } = req.body;
      if (!attemptId) return res.json({ success: false, error: 'attemptId required.' });

      const updates = {};
      if (key === 'cmi.core.lesson_status' || key === 'cmi.completion_status') updates.status = value;
      if (key === 'cmi.core.score.raw' || key === 'cmi.score.raw') updates.score = Number(value);
      if (key === 'cmi.core.score.max' || key === 'cmi.score.max') updates.maxScore = Number(value);
      if (key === 'cmi.core.lesson_location' || key === 'cmi.location') updates.location = value;
      if (key === 'cmi.suspend_data') updates.suspendData = value;
      if (key === 'cmi.core.session_time' || key === 'cmi.session_time') {
        updates.timeSpent = (db.prepare('SELECT timeSpent FROM scorm_attempts WHERE id = ?').get(attemptId)?.timeSpent || 0) + parseSCORMTime(value);
      }

      const sets = Object.entries(updates).map(([k]) => `${k}=?`);
      if (sets.length > 0) {
        sets.push('updatedAt=?');
        const vals = [...Object.values(updates), new Date().toISOString(), attemptId];
        db.prepare(`UPDATE scorm_attempts SET ${sets.join(', ')} WHERE id=?`).run(...vals);
      }

      if (updates.status === 'completed' || updates.status === 'passed') {
        db.prepare('UPDATE scorm_attempts SET completedAt=? WHERE id=?').run(new Date().toISOString(), attemptId);
      }

      res.json({ success: true });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  router.delete('/:classId/:packageId', requireTeacher, (req, res) => {
    try {
      db.prepare('DELETE FROM scorm_attempts WHERE packageId = ?').run(req.params.packageId);
      db.prepare('DELETE FROM scorm_packages WHERE id = ? AND classId = ?').run(req.params.packageId, req.params.classId);
      res.json({ success: true });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  return router;
}

function parseSCORMTime(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  if (parts.length === 3) {
    return (Number(parts[0]) * 3600) + (Number(parts[1]) * 60) + Math.floor(Number(parts[2]));
  }
  return 0;
}
