import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export type AtlasDb = Database.Database;

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "atlas.db");

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS drafts (
  id            TEXT PRIMARY KEY,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL,

  topic         TEXT    NOT NULL,
  audience      TEXT,
  tone          TEXT,
  length_tier   TEXT,
  platforms     TEXT    NOT NULL,

  outputs       TEXT,
  hooks         TEXT,
  hashtag_packs TEXT,
  meta          TEXT
);

CREATE INDEX IF NOT EXISTS idx_drafts_updated_at
  ON drafts(updated_at DESC);

CREATE TABLE IF NOT EXISTS settings (
  id                   INTEGER PRIMARY KEY CHECK (id = 1),
  created_at           INTEGER NOT NULL,
  updated_at           INTEGER NOT NULL,
  default_platforms    TEXT    NOT NULL,
  default_tone         TEXT,
  default_audience     TEXT,
  default_length_tier  TEXT,
  llm_provider         TEXT,
  llm_base_url         TEXT,
  llm_model            TEXT
);
`;

declare global {
  // Prevent multiple DB instances during dev hot reload
  var __atlasDb: AtlasDb | undefined;
}

function ensureDataDirExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function initDb(db: AtlasDb) {
  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = WAL");

  db.exec(SCHEMA_SQL);

  // Migrations for existing installs — silently skip if column already exists
  for (const sql of [
    "ALTER TABLE settings ADD COLUMN llm_provider TEXT",
    "ALTER TABLE settings ADD COLUMN llm_base_url TEXT",
    "ALTER TABLE settings ADD COLUMN llm_model TEXT",
  ]) {
    try { db.exec(sql); } catch { /* column already exists */ }
  }

  const now = Date.now();
  const row = db.prepare("SELECT id FROM settings WHERE id = 1").get();

  if (!row) {
    db.prepare(
      `INSERT INTO settings
        (id, created_at, updated_at, default_platforms)
       VALUES
        (1, ?, ?, ?)`
    ).run(now, now, "[]");
  }
}

export function getDb(): AtlasDb {
  if (global.__atlasDb) return global.__atlasDb;

  ensureDataDirExists();

  const db = new Database(DB_PATH);
  initDb(db);

  global.__atlasDb = db;
  return db;
}
