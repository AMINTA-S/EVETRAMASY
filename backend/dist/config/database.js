"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollbackTransaction = exports.commitTransaction = exports.beginTransaction = exports.getClient = exports.query = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const DB_PATH = path_1.default.join(__dirname, '../../evetramasy.sqlite');
const db = new sqlite3_1.default.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Could not connect to database:', err.message);
        process.exit(1);
    }
    else {
        console.log('✅ Connected to SQLite database at', DB_PATH);
        db.run('PRAGMA journal_mode=WAL');
        db.run('PRAGMA foreign_keys=ON');
    }
});
/**
 * Executes a SQL query, converting PostgreSQL-style $1,$2 params to SQLite ?
 * Returns a pg-compatible result: { rows: any[], rowCount: number }
 */
const query = (text, params) => {
    return new Promise((resolve, reject) => {
        // Convert $1, $2... placeholders to ?
        const sqliteSQL = text.replace(/\$\d+/g, '?');
        // Strip RETURNING clause (not supported by SQLite)
        const hasReturning = /returning/i.test(sqliteSQL);
        const cleanSQL = sqliteSQL.replace(/\s*returning\s+[\w\s,.*]+$/i, '').trim();
        const isSelect = /^\s*select/i.test(cleanSQL);
        if (isSelect) {
            db.all(cleanSQL, params || [], (err, rows) => {
                if (err)
                    return reject(err);
                resolve({ rows: rows, rowCount: rows.length });
            });
        }
        else if (hasReturning) {
            // INSERT/UPDATE with RETURNING: run the mutation, then fetch the last inserted row
            db.run(cleanSQL, params || [], function (err) {
                if (err)
                    return reject(err);
                const lastID = this.lastID;
                // Determine table name from SQL to fetch back the row
                const tableMatch = cleanSQL.match(/(?:insert\s+into|update)\s+(\w+)/i);
                if (tableMatch) {
                    db.all(`SELECT * FROM ${tableMatch[1]} WHERE rowid = ?`, [lastID], (err2, rows) => {
                        if (err2)
                            return reject(err2);
                        resolve({ rows: rows, rowCount: rows.length });
                    });
                }
                else {
                    resolve({ rows: [], rowCount: this.changes });
                }
            });
        }
        else {
            db.run(cleanSQL, params || [], function (err) {
                if (err)
                    return reject(err);
                resolve({ rows: [], rowCount: this.changes });
            });
        }
    });
};
exports.query = query;
const getClient = async () => ({
    query: exports.query,
    release: () => { },
});
exports.getClient = getClient;
// For transaction support (used by parkingService)
const beginTransaction = () => new Promise((resolve, reject) => db.run('BEGIN', err => (err ? reject(err) : resolve())));
exports.beginTransaction = beginTransaction;
const commitTransaction = () => new Promise((resolve, reject) => db.run('COMMIT', err => (err ? reject(err) : resolve())));
exports.commitTransaction = commitTransaction;
const rollbackTransaction = () => new Promise((resolve, reject) => db.run('ROLLBACK', err => (err ? reject(err) : resolve())));
exports.rollbackTransaction = rollbackTransaction;
const pool = { query: exports.query, connect: exports.getClient, on: () => { } };
exports.default = pool;
//# sourceMappingURL=database.js.map