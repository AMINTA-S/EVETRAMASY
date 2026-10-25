import sqlite3 from 'sqlite3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const DB_PATH = path.join(__dirname, '../../evetramasy.sqlite');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Could not connect to database:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connected to SQLite database at', DB_PATH);
    db.run('PRAGMA journal_mode=WAL');
    db.run('PRAGMA foreign_keys=ON');
  }
});

/**
 * Executes a SQL query, converting PostgreSQL-style $1,$2 params to SQLite ?
 * Returns a pg-compatible result: { rows: any[], rowCount: number }
 */
export const query = (text: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }> => {
  return new Promise((resolve, reject) => {
    // Convert $1, $2... placeholders to ?
    const sqliteSQL = text.replace(/\$\d+/g, '?');

    // Strip RETURNING clause (not supported by SQLite)
    const hasReturning = /returning/i.test(sqliteSQL);
    const cleanSQL = sqliteSQL.replace(/\s*returning\s+[\w\s,.*]+$/i, '').trim();

    const isSelect = /^\s*select/i.test(cleanSQL);

    if (isSelect) {
      db.all(cleanSQL, params || [], (err, rows) => {
        if (err) return reject(err);
        resolve({ rows: rows as any[], rowCount: rows.length });
      });
    } else if (hasReturning) {
      // INSERT/UPDATE with RETURNING: run the mutation, then fetch the last inserted row
      db.run(cleanSQL, params || [], function (err) {
        if (err) return reject(err);
        const lastID = this.lastID;
        // Determine table name from SQL to fetch back the row
        const tableMatch = cleanSQL.match(/(?:insert\s+into|update)\s+(\w+)/i);
        if (tableMatch) {
          db.all(`SELECT * FROM ${tableMatch[1]} WHERE rowid = ?`, [lastID], (err2, rows) => {
            if (err2) return reject(err2);
            resolve({ rows: rows as any[], rowCount: rows.length });
          });
        } else {
          resolve({ rows: [], rowCount: this.changes });
        }
      });
    } else {
      db.run(cleanSQL, params || [], function (err) {
        if (err) return reject(err);
        resolve({ rows: [], rowCount: this.changes });
      });
    }
  });
};

export const getClient = async () => ({
  query,
  release: () => {},
});

// For transaction support (used by parkingService)
export const beginTransaction = (): Promise<void> =>
  new Promise((resolve, reject) => db.run('BEGIN', err => (err ? reject(err) : resolve())));

export const commitTransaction = (): Promise<void> =>
  new Promise((resolve, reject) => db.run('COMMIT', err => (err ? reject(err) : resolve())));

export const rollbackTransaction = (): Promise<void> =>
  new Promise((resolve, reject) => db.run('ROLLBACK', err => (err ? reject(err) : resolve())));

const pool = { query, connect: getClient, on: () => {} };
export default pool;
