import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs-extra';

const dataDir = path.join(__dirname, '..', 'data');
fs.ensureDirSync(dataDir);
const dbPath = path.join(dataDir, 'app.db');

const db = new Database(dbPath);
export function exec(sql: string) { return db.exec(sql); }
export function prepare(sql: string) { return db.prepare(sql); }
export default db;
