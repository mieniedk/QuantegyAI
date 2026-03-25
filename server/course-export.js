import { v4 as uuidv4 } from 'uuid';

export function createCourseExportRouter(express, db, requireTeacher) {
  const router = express.Router();

  router.get('/:classId/export', requireTeacher, (req, res) => {
    try {
      const classId = req.params.classId;

      const classRow = db.prepare('SELECT * FROM classes WHERE id = ?').get(classId);
      if (!classRow) return res.status(404).json({ success: false, error: 'Class not found.' });

      const classData = JSON.parse(classRow.data || '{}');
      const modules = db.prepare('SELECT * FROM modules WHERE classId = ?').all(classId).map(r => JSON.parse(r.data || '{}'));
      const assignments = db.prepare('SELECT * FROM assignments WHERE classId = ?').all(classId).map(r => JSON.parse(r.data || '{}'));
      const announcements = db.prepare('SELECT * FROM announcements WHERE classId = ?').all(classId).map(r => JSON.parse(r.data || '{}'));
      const discussions = db.prepare('SELECT * FROM discussions WHERE classId = ?').all(classId).map(r => JSON.parse(r.data || '{}'));
      const wikiPages = db.prepare('SELECT * FROM wiki_pages WHERE classId = ?').all(classId);
      const assessments = db.prepare('SELECT * FROM assessments WHERE teacher = ?').all(req.user.username)
        .map(r => JSON.parse(r.data || '{}'))
        .filter(a => a.classId === classId);

      const manifest = buildIMSManifest({
        classData, modules, assignments, announcements, discussions, wikiPages, assessments, classId,
      });

      const resources = {
        format: 'imscc',
        version: '1.3.0',
        exportedAt: new Date().toISOString(),
        exportedBy: req.user.username,
        classId,
        classData,
        modules,
        assignments,
        announcements,
        discussions,
        wikiPages: wikiPages.map(p => ({ id: p.id, title: p.title, body: p.body, createdBy: p.createdBy })),
        assessments,
        manifest,
      };

      res.setHeader('Content-Disposition', `attachment; filename="${(classData.name || classId).replace(/[^a-z0-9]/gi, '_')}_export.imscc.json"`);
      res.setHeader('Content-Type', 'application/json');
      res.json(resources);
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  router.post('/import', requireTeacher, (req, res) => {
    try {
      const { coursePackage } = req.body;
      if (!coursePackage || coursePackage.format !== 'imscc') {
        return res.json({ success: false, error: 'Invalid IMS CC package.' });
      }

      const newClassId = uuidv4();
      const classData = { ...coursePackage.classData, id: newClassId, name: `${coursePackage.classData?.name || 'Imported'} (Copy)` };

      db.prepare('INSERT INTO classes (id, teacher, data) VALUES (?,?,?)')
        .run(newClassId, req.user.username, JSON.stringify(classData));

      const importTransaction = db.transaction(() => {
        for (const mod of (coursePackage.modules || [])) {
          const modId = uuidv4();
          db.prepare('INSERT INTO modules (id, classId, data) VALUES (?,?,?)')
            .run(modId, newClassId, JSON.stringify({ ...mod, id: modId, classId: newClassId }));
        }

        for (const a of (coursePackage.assignments || [])) {
          const aId = uuidv4();
          db.prepare('INSERT INTO assignments (id, classId, data) VALUES (?,?,?)')
            .run(aId, newClassId, JSON.stringify({ ...a, id: aId, classId: newClassId }));
        }

        for (const ann of (coursePackage.announcements || [])) {
          const annId = uuidv4();
          db.prepare('INSERT INTO announcements (id, classId, data) VALUES (?,?,?)')
            .run(annId, newClassId, JSON.stringify({ ...ann, id: annId, classId: newClassId }));
        }

        for (const disc of (coursePackage.discussions || [])) {
          const discId = uuidv4();
          db.prepare('INSERT INTO discussions (id, classId, data) VALUES (?,?,?)')
            .run(discId, newClassId, JSON.stringify({ ...disc, id: discId, classId: newClassId }));
        }

        for (const page of (coursePackage.wikiPages || [])) {
          const pageId = uuidv4();
          const now = new Date().toISOString();
          db.prepare('INSERT INTO wiki_pages (id, classId, title, body, createdBy, updatedBy, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?)')
            .run(pageId, newClassId, page.title || 'Imported Page', page.body || '', req.user.username, req.user.username, now, now);
        }

        for (const assess of (coursePackage.assessments || [])) {
          const assessId = uuidv4();
          db.prepare('INSERT INTO assessments (id, teacher, data) VALUES (?,?,?)')
            .run(assessId, req.user.username, JSON.stringify({ ...assess, id: assessId, classId: newClassId }));
        }
      });

      importTransaction();

      res.json({ success: true, classId: newClassId, className: classData.name });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  return router;
}

function buildIMSManifest({ classData, modules, assignments, announcements, discussions, wikiPages, assessments, classId }) {
  const items = [];
  let resIdx = 1;

  for (const mod of modules) {
    items.push(`    <item identifier="MOD_${resIdx}" identifierref="RES_${resIdx}"><title>${escXml(mod.name || mod.title || 'Module')}</title></item>`);
    resIdx++;
  }
  for (const a of assignments) {
    items.push(`    <item identifier="ASSIGN_${resIdx}" identifierref="RES_${resIdx}"><title>${escXml(a.title || 'Assignment')}</title></item>`);
    resIdx++;
  }
  for (const p of wikiPages) {
    items.push(`    <item identifier="PAGE_${resIdx}" identifierref="RES_${resIdx}"><title>${escXml(p.title || 'Page')}</title></item>`);
    resIdx++;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${classId}" xmlns="http://www.imsglobal.org/xsd/imsccv1p3/imscp_v1p1">
  <metadata>
    <schema>IMS Common Cartridge</schema>
    <schemaversion>1.3.0</schemaversion>
  </metadata>
  <organizations>
    <organization identifier="ORG_1" structure="rooted-hierarchy">
      <item identifier="ROOT">
        <title>${escXml(classData?.name || 'Course')}</title>
${items.join('\n')}
      </item>
    </organization>
  </organizations>
</manifest>`;
}

function escXml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
