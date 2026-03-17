import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { env } from '../utils/env.js';

function ensureParentDir(filePath) {
  const dir = path.dirname(path.resolve(filePath));
  fs.mkdirSync(dir, { recursive: true });
}

export function openDb() {
  ensureParentDir(env.dbPath);
  const db = new Database(env.dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export function initDb(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'admin')) DEFAULT 'user',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      location TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending', 'in-process', 'cleaned', 'in_progress', 'resolved')) DEFAULT 'pending',
      image_path TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Normalize legacy statuses to frontend-friendly values
    UPDATE complaints SET status = 'in-process' WHERE status = 'in_progress';
    UPDATE complaints SET status = 'cleaned' WHERE status = 'resolved';

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);
    CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);

    CREATE TRIGGER IF NOT EXISTS trg_complaints_updated_at
    AFTER UPDATE ON complaints
    FOR EACH ROW
    BEGIN
      UPDATE complaints SET updated_at = datetime('now') WHERE id = NEW.id;
    END;
  `);

  // Add image_path column for existing DBs created before this feature.
  const columns = db.prepare(`PRAGMA table_info(complaints)`).all();
  const hasImagePath = columns.some((c) => c.name === 'image_path');
  if (!hasImagePath) {
    db.exec(`ALTER TABLE complaints ADD COLUMN image_path TEXT;`);
  }
}

