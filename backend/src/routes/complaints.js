import express from 'express';
import { z } from 'zod';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { uploadComplaintImage } from '../middleware/upload.js';

const createSchema = z.object({
  location: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
});

const statusSchema = z.object({
  status: z.enum(['pending', 'in-process', 'cleaned']),
});

export function createComplaintsRouter({ db }) {
  const router = express.Router();

  const statusExpr = `
    CASE c.status
      WHEN 'in_progress' THEN 'in-process'
      WHEN 'resolved' THEN 'cleaned'
      ELSE c.status
    END
  `;

  function toImageUrl(req, imagePath) {
    if (!imagePath) return null;
    return `${req.protocol}://${req.get('host')}${imagePath}`;
  }

  function mapComplaint(req, row) {
    if (!row) return row;
    return {
      ...row,
      image: toImageUrl(req, row.imagePath),
      imagePath: undefined,
    };
  }

  // Create complaint (logged-in user)
  router.post('/', requireAuth, (req, res) => {
    uploadComplaintImage(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message || 'Upload failed' });
      }

      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });
      }

      const { location, description } = parsed.data;
      const userId = req.user.userId;
      const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

      const info = db
        .prepare(
          'INSERT INTO complaints (user_id, location, description, image_path) VALUES (?, ?, ?, ?)'
        )
        .run(userId, location, description, imagePath);

      const complaint = db
        .prepare(
          `SELECT
             c.id,
             c.location,
             c.description,
             ${statusExpr} as status,
             c.image_path as imagePath,
             c.created_at as createdAt,
             c.updated_at as updatedAt,
             u.name as userName,
             u.email as userEmail
           FROM complaints c
           JOIN users u ON u.id = c.user_id
           WHERE c.id = ?`
        )
        .get(info.lastInsertRowid);

      return res.status(201).json({ complaint: mapComplaint(req, complaint) });
    });
  });

  // User's complaints
  router.get('/user', requireAuth, (req, res) => {
    const userId = req.user.userId;

    const complaints = db
      .prepare(
        `SELECT
           c.id,
           c.location,
           c.description,
           ${statusExpr} as status,
           c.image_path as imagePath,
           c.created_at as createdAt,
           c.updated_at as updatedAt
         FROM complaints c
         WHERE c.user_id = ?
         ORDER BY datetime(c.created_at) DESC`
      )
      .all(userId);

    return res.json({ complaints: complaints.map((c) => mapComplaint(req, c)) });
  });

  // All complaints (admin)
  router.get('/', requireAuth, requireAdmin, (req, res) => {
    const complaints = db
      .prepare(
        `SELECT
           c.id,
           c.location,
           c.description,
           ${statusExpr} as status,
           c.image_path as imagePath,
           c.created_at as createdAt,
           c.updated_at as updatedAt,
           u.name as userName,
           u.email as userEmail
         FROM complaints c
         JOIN users u ON u.id = c.user_id
         ORDER BY datetime(c.created_at) DESC`
      )
      .all();

    return res.json({ complaints: complaints.map((c) => mapComplaint(req, c)) });
  });

  // Update complaint status (admin)
  router.patch('/:id/status', requireAuth, requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: 'Invalid complaint id' });
    }

    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });
    }

    const { status } = parsed.data;

    const existing = db.prepare('SELECT id FROM complaints WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    db.prepare('UPDATE complaints SET status = ? WHERE id = ?').run(status, id);

    const complaint = db
      .prepare(
        `SELECT
           c.id,
           c.location,
           c.description,
           ${statusExpr} as status,
           c.image_path as imagePath,
           c.created_at as createdAt,
           c.updated_at as updatedAt,
           u.name as userName,
           u.email as userEmail
         FROM complaints c
         JOIN users u ON u.id = c.user_id
         WHERE c.id = ?`
      )
      .get(id);

    return res.json({ complaint: mapComplaint(req, complaint) });
  });

  return router;
}

