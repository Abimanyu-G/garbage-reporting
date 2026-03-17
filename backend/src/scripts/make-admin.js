import Database from 'better-sqlite3';
import { env } from '../utils/env.js';

const emailArg = process.argv[2];
const email = (emailArg ?? '').trim().toLowerCase();

if (!email) {
  // eslint-disable-next-line no-console
  console.error('Usage: npm run make-admin -- <email>');
  process.exit(1);
}

const db = new Database(env.dbPath);

const existing = db.prepare('SELECT id, email, role FROM users WHERE email = ?').get(email);
if (!existing) {
  // eslint-disable-next-line no-console
  console.error(`User not found: ${email}`);
  process.exit(1);
}

db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(email);

const updated = db.prepare('SELECT id, email, role FROM users WHERE email = ?').get(email);
// eslint-disable-next-line no-console
console.log('Updated:', updated);

