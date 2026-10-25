-- Géomancie / Poids Mystique
-- Database target: Turso (SQLite/libSQL)
-- No secrets are stored in this repository.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS app_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS geomancy_figures (
  id INTEGER PRIMARY KEY,
  canonical_name TEXT NOT NULL,
  latin_name TEXT,
  aliases_json TEXT NOT NULL DEFAULT '[]',
  element TEXT,
  movement TEXT,
  valence TEXT,
  source TEXT NOT NULL DEFAULT 'BodeDiop',
  source_url TEXT,
  verified INTEGER NOT NULL DEFAULT 0 CHECK (verified IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS geomancy_houses (
  id INTEGER PRIMARY KEY,
  canonical_name TEXT NOT NULL,
  description TEXT,
  element TEXT,
  movement TEXT,
  source TEXT NOT NULL DEFAULT 'BodeDiop',
  source_url TEXT,
  verified INTEGER NOT NULL DEFAULT 0 CHECK (verified IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS figure_house_interpretations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  figure_id INTEGER NOT NULL,
  house_id INTEGER NOT NULL,
  source_text TEXT,
  normalized_concepts_json TEXT NOT NULL DEFAULT '[]',
  source TEXT NOT NULL DEFAULT 'BodeDiop',
  source_url TEXT,
  confidence TEXT NOT NULL DEFAULT 'unverified',
  verified INTEGER NOT NULL DEFAULT 0 CHECK (verified IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (figure_id, house_id),
  FOREIGN KEY (figure_id) REFERENCES geomancy_figures(id),
  FOREIGN KEY (house_id) REFERENCES geomancy_houses(id)
);

CREATE TABLE IF NOT EXISTS themes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  mothers_json TEXT NOT NULL,
  theme_json TEXT NOT NULL,
  shadow_json TEXT,
  abjad_json TEXT,
  interactions_json TEXT,
  engine_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS interpretations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  theme_id INTEGER NOT NULL,
  result_json TEXT NOT NULL,
  model TEXT,
  prompt_version TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS knowledge_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT,
  source_type TEXT NOT NULL,
  verified INTEGER NOT NULL DEFAULT 0 CHECK (verified IN (0,1)),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO app_metadata(key, value) VALUES
  ('application', 'Géomancie / Poids Mystique'),
  ('database', 'Turso'),
  ('canonical_source', 'BodeDiop'),
  ('engine_policy', 'deterministic'),
  ('schema_version', '1.0.0');
