import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// 确保数据目录存在
const dbDir = path.dirname(process.env.DB_PATH || './data/annotations.db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 创建数据库连接
const db: Database.Database = new Database(process.env.DB_PATH || './data/annotations.db');

// 启用外键约束
db.pragma('foreign_keys = ON');

// 初始化数据库表结构
export function initializeDatabase(): void {
  const schema = `
    -- 创建项目表
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT (datetime('now', '+8 hours')),
        updated_at TEXT DEFAULT (datetime('now', '+8 hours'))
    );

    -- 创建影像表
    CREATE TABLE IF NOT EXISTS images (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER,
        width INTEGER,
        height INTEGER,
        mime_type TEXT,
        metadata TEXT,
        created_at TEXT DEFAULT (datetime('now', '+8 hours')),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    -- 创建标注表
    CREATE TABLE IF NOT EXISTS annotations (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        image_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('point', 'rectangle', 'polygon')),
        coordinates TEXT NOT NULL,
        properties TEXT,
        created_at TEXT DEFAULT (datetime('now', '+8 hours')),
        updated_at TEXT DEFAULT (datetime('now', '+8 hours')),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE
    );

    -- 创建附件表
    CREATE TABLE IF NOT EXISTS attachments (
        id TEXT PRIMARY KEY,
        annotation_id TEXT NOT NULL,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER,
        mime_type TEXT,
        created_at TEXT DEFAULT (datetime('now', '+8 hours')),
        FOREIGN KEY (annotation_id) REFERENCES annotations(id) ON DELETE CASCADE
    );

    -- 创建索引
    CREATE INDEX IF NOT EXISTS idx_images_project_id ON images(project_id);
    CREATE INDEX IF NOT EXISTS idx_annotations_project_id ON annotations(project_id);
    CREATE INDEX IF NOT EXISTS idx_annotations_image_id ON annotations(image_id);
    CREATE INDEX IF NOT EXISTS idx_attachments_annotation_id ON attachments(annotation_id);
  `;

  // 执行建表语句
  db.exec(schema);
  console.log('✅ 数据库初始化完成');
}

export default db;
