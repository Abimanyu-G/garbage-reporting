import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import { env } from '../utils/env.js';

const emailArg = process.argv[2];
const passwordArg = process.argv[3];

const email = (emailArg ?? '').trim().toLowerCase();
const password = (passwordArg ?? '').trim();

if (!email || !password) {
  // eslint-disable-next-line no-console
  console.error('Usage: npm run set-password -- <email> <newPassword>');
  process.exit(1);
}

if (password.length < 6) {
  // eslint-disable-next-line no-console
  console.error('Password must be at least 6 characters');
  process.exit(1);
}

const db = new Database(env.dbPath);

const existing = db.prepare('SELECT id, email, role FROM users WHERE email = ?').get(email);
if (!existing) {
  // eslint-disable-next-line no-console
  console.error(`User not found: ${email}`);
  process.exit(1);
}

const passwordHash = bcrypt.hashSync(password, 10);
db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(passwordHash, email);

// eslint-disable-next-line no-console
console.log('Password updated for:', { id: existing.id, email: existing.email, role: existing.role });

