import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

import { initializeDatabase } from './models/database';
import projectsRouter from './routes/projects';
import imagesRouter from './routes/images';
import annotationsRouter from './routes/annotations';
import attachmentsRouter from './routes/attachments';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 确保必要目录存在
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const dataDir = path.dirname(process.env.DB_PATH || './data/annotations.db');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 静态文件服务 - 用于图片访问
app.use('/uploads', express.static(path.resolve(uploadDir)));

// 初始化数据库
initializeDatabase();

// API 路由
app.use('/api/projects', projectsRouter);
app.use('/api/images', imagesRouter);
app.use('/api/annotations', annotationsRouter);
app.use('/api/attachments', attachmentsRouter);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║     工程现场影像智能标注与关联系统 - 后端服务              ║
╠══════════════════════════════════════════════════════════╣
║  🚀 服务器已启动                                          ║
║  📍 端口: ${PORT}                                          ║
║  🌐 API地址: http://localhost:${PORT}/api                  ║
║  📁 上传目录: ${uploadDir}                       ║
╚══════════════════════════════════════════════════════════╝
  `);
});

export default app;
