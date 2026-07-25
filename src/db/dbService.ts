import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('drukstech.db');
    await initTables(db);
  }
  return db;
}

async function initTables(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS modules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      prompt TEXT,
      data TEXT NOT NULL,
      version TEXT DEFAULT '1.0.0',
      created_at INTEGER DEFAULT (strftime('%s','now') * 1000),
      updated_at INTEGER DEFAULT (strftime('%s','now') * 1000)
    );

    CREATE TABLE IF NOT EXISTS rag_docs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      properties TEXT,
      example TEXT,
      embedding BLOB,
      created_at INTEGER DEFAULT (strftime('%s','now') * 1000)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER DEFAULT (strftime('%s','now') * 1000)
    );
  `);
}

export async function getSettingsKey(key: string): Promise<string | null> {
  const database = await openDatabase();
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [key]
  );
  return row?.value ?? null;
}

export async function setSettingsKey(key: string, value: string): Promise<void> {
  const database = await openDatabase();
  await database.runAsync(
    'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)',
    [key, value, Date.now()]
  );
}

export async function getAllSettingsKeys(): Promise<Record<string, string>> {
  const database = await openDatabase();
  const rows = await database.getAllAsync<{ key: string; value: string }>(
    'SELECT key, value FROM settings'
  );
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
