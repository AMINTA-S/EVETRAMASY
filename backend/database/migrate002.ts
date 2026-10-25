import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(__dirname, '../evetramasy.sqlite');
const SQL_PATH = path.join(__dirname, 'migrations/002_expansion.sql');

const db = new sqlite3.Database(DB_PATH);
const sql = fs.readFileSync(SQL_PATH, 'utf8');

db.serialize(() => {
  // Run each statement separately (SQLite3 doesn't support exec on multi-statement with ALTER)
  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
  let i = 0;
  const next = () => {
    if (i >= statements.length) {
      console.log('Migration 002 complete!');
      db.close();
      return;
    }
    const stmt = statements[i++];
    db.run(stmt, (err: Error | null) => {
      if (err && !err.message.includes('duplicate column name')) {
        if (err.message.includes('no such table') || err.message.includes('already exists')) {
          // skip
        } else {
          console.warn('Warning on:', stmt.slice(0, 60), '-', err.message);
        }
      }
      next();
    });
  };
  next();
});
