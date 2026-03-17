import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { signAccessToken } from '../utils/jwt.js';
import { env } from '../utils/env.js';

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(6).max(200),
});

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(200),
});

export function createAuthRouter({ db }) {
  const router = express.Router();

  router.post('/register', (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const role =
      env.adminEmail && normalizedEmail === env.adminEmail ? 'admin' : 'user';

    const password_hash = bcrypt.hashSync(password, 10);
    const info = db
      .prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
      .run(name, normalizedEmail, password_hash, role);

    const user = { id: info.lastInsertRowid, name, email: normalizedEmail, role };
    const token = signAccessToken({ userId: user.id, role: user.role });

    return res.status(201).json({ token, user });
  });

  router.post('/login', (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const row = db
      .prepare('SELECT id, name, email, password_hash, role FROM users WHERE email = ?')
      .get(normalizedEmail);

    if (!row) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const ok = bcrypt.compareSync(password, row.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = { id: row.id, name: row.name, email: row.email, role: row.role };
    const token = signAccessToken({ userId: user.id, role: user.role });

    return res.json({ token, user });
  });

  return router;
}

