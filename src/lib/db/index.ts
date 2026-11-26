import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import fs from 'fs'
import path from 'path'
import * as schema from './schema'

const DATA_DIR = process.env.WOM_DATA_DIR || path.join(process.cwd(), 'data')
const DB_PATH = process.env.WOM_DB_PATH || path.join(DATA_DIR, 'word-of-mouth.db')

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null
let _sqlite: Database.Database | null = null

function hasColumn(sqlite: Database.Database, table: string, column: string): boolean {
  const rows = sqlite.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>
  return rows.some((r) => r.name === column)
}

function ensureSchema(sqlite: Database.Database) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS feeds (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      query TEXT NOT NULL,
      keywords TEXT NOT NULL,
      topics TEXT NOT NULL,
      exclude_keywords TEXT NOT NULL DEFAULT '[]',
      relevance_threshold REAL NOT NULL DEFAULT 0.2,
      refresh_interval_min INTEGER NOT NULL DEFAULT 30,
      is_demo INTEGER NOT NULL DEFAULT 0,
      share_token TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sources (
      id TEXT PRIMARY KEY,
      feed_id TEXT NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
      kind TEXT NOT NULL,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      last_fetched_at TEXT,
      last_error TEXT,
      last_success_at TEXT,
      fetch_count INTEGER NOT NULL DEFAULT 0,
      consecutive_failures INTEGER NOT NULL DEFAULT 0,
      last_duration_ms INTEGER,
      last_item_count INTEGER,
      adapter_id TEXT,
      enabled INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      canonical_url TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      summary_attribution TEXT,
      content_text TEXT NOT NULL,
      published_at TEXT,
      author TEXT,
      source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
      source_title TEXT NOT NULL,
      is_demo INTEGER NOT NULL DEFAULT 0,
      cluster_id TEXT
    );
    CREATE TABLE IF NOT EXISTS feed_items (
      id TEXT PRIMARY KEY,
      feed_id TEXT NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
      article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      score REAL NOT NULL,
      reasons TEXT NOT NULL,
      feedback TEXT,
      seen_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_sources_feed ON sources(feed_id);
    CREATE INDEX IF NOT EXISTS idx_feed_items_feed ON feed_items(feed_id);
    CREATE INDEX IF NOT EXISTS idx_articles_url ON articles(canonical_url);
    CREATE INDEX IF NOT EXISTS idx_articles_cluster ON articles(cluster_id);
  `)

  // Additive migrations for existing DBs (ingestion diagnostics + intelligence columns).
  const sourceCols = new Set(
    sqlite.prepare(`PRAGMA table_info(sources)`).all().map((r) => (r as { name: string }).name),
  )
  const alterIfMissing = (name: string, ddl: string) => {
    if (!sourceCols.has(name)) sqlite.exec(`ALTER TABLE sources ADD COLUMN ${ddl}`)
  }
  alterIfMissing('last_success_at', 'last_success_at TEXT')
  alterIfMissing('fetch_count', 'fetch_count INTEGER NOT NULL DEFAULT 0')
  alterIfMissing('consecutive_failures', 'consecutive_failures INTEGER NOT NULL DEFAULT 0')
  alterIfMissing('last_duration_ms', 'last_duration_ms INTEGER')
  alterIfMissing('last_item_count', 'last_item_count INTEGER')
  alterIfMissing('adapter_id', 'adapter_id TEXT')
  alterIfMissing('enabled', 'enabled INTEGER NOT NULL DEFAULT 1')

  if (!hasColumn(sqlite, 'feeds', 'exclude_keywords')) {
    sqlite.exec(`ALTER TABLE feeds ADD COLUMN exclude_keywords TEXT NOT NULL DEFAULT '[]'`)
  }
  if (!hasColumn(sqlite, 'articles', 'summary_attribution')) {
    sqlite.exec(`ALTER TABLE articles ADD COLUMN summary_attribution TEXT`)
  }
}

export function getSqlite() {
  if (_sqlite) return _sqlite
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
  _sqlite = new Database(DB_PATH)
  _sqlite.pragma('journal_mode = WAL')
  _sqlite.pragma('foreign_keys = ON')
  ensureSchema(_sqlite)
  return _sqlite
}

export function getDb() {
  if (_db) return _db
  _db = drizzle(getSqlite(), { schema })
  return _db
}

export function resetDbForTests() {
  if (_sqlite) {
    _sqlite.close()
    _sqlite = null
    _db = null
  }
  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH)
}

export { schema }
