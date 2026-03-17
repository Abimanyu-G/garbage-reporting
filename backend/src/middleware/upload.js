import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { env } from '../utils/env.js';

const uploadsDir = path.resolve(process.cwd(), env.uploadDir);
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname || '').slice(0, 10).toLowerCase();
    const safeExt = ext && ext.length <= 6 ? ext : '';
    const name = `complaint-${Date.now()}-${Math.random().toString(16).slice(2)}${safeExt}`;
    cb(null, name);
  },
});

function fileFilter(req, file, cb) {
  if (!file.mimetype?.startsWith('image/')) {
    return cb(new Error('Only image uploads are allowed'));
  }
  return cb(null, true);
}

export const uploadComplaintImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('image');

