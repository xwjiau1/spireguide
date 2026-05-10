import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/**
 * 数据库连接管理
 * 使用 better-sqlite3 同步驱动，适合读密集型查询
 */

const DB_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DB_DIR, 'spireguide.db');

// 确保数据目录存在
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// 启用外键约束
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 初始化Schema
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);

export default db;
