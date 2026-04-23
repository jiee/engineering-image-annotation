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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 确保必要目录存在
const uploadDir = process.env.UPLOAD_DIR || '/app/uploads';
const dataDir = path.dirname(process.env.DB_PATH || '/app/data/annotations.db');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 静态文件服务 - 上传的文件
app.use('/uploads', express.static(uploadDir));

// API 路由
app.use('/api/projects', projectsRouter);
app.use('/api/images', imagesRouter);
app.use('/api/annotations', annotationsRouter);
app.use('/api/attachments', attachmentsRouter);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 生产环境 - 服务前端静态文件
if (process.env.NODE_ENV === 'production') {
  // public 目录在 /app/public
  const publicPath = '/app/public';
  
  console.log('静态文件目录:', publicPath);
  console.log('目录内容:', fs.existsSync(publicPath) ? fs.readdirSync(publicPath) : '目录不存在');
  
  app.use(express.static(publicPath));
  
  // SPA 回退 - 所有非 API 路由返回 index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      const indexPath = path.join(publicPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({ error: 'index.html not found' });
      }
    }
  });
}

// 错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误', message: err.message });
});

// 初始化数据库并启动服务器
initializeDatabase();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║     工程现场影像智能标注与关联系统                        ║
╠══════════════════════════════════════════════════════════╣
║  🚀 服务已启动                                            ║
║  📍 端口: ${PORT}                                          ║
║  🌐 访问地址: http://localhost:${PORT}                     ║
║  📁 上传目录: ${uploadDir}                                 ║
╚══════════════════════════════════════════════════════════╝
  `);
});

export default app;
