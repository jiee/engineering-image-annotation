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
const PORT: number = parseInt(process.env.PORT || '8080', 10);

// 中间件
app.use(cors({
  origin: true, // 允许所有来源，在生产环境中建议设置具体的域名
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 确保必要目录存在
const uploadDir = process.env.UPLOAD_DIR || '/app/uploads';
const dataDir = path.dirname(process.env.DB_PATH || '/app/data/annotations.db');

console.log('=== 启动配置 ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', PORT);
console.log('UPLOAD_DIR:', uploadDir);
console.log('DB_PATH:', process.env.DB_PATH);

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('创建上传目录:', uploadDir);
  }
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('创建数据目录:', dataDir);
  }
} catch (err) {
  console.error('创建目录失败:', err);
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
const publicPath = '/app/public';
console.log('静态文件目录:', publicPath);
console.log('静态文件目录是否存在:', fs.existsSync(publicPath));

if (fs.existsSync(publicPath)) {
  const files = fs.readdirSync(publicPath);
  console.log('静态文件目录内容:', files);
  console.log('index.html 是否存在:', files.includes('index.html'));
  
  app.use(express.static(publicPath));
  
  // SPA 回退
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    const indexPath = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: 'index.html not found', path: indexPath });
    }
  });
} else {
  console.error('静态文件目录不存在:', publicPath);
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return;
    }
    res.status(404).json({ error: '前端文件未部署', publicPath });
  });
}

// 错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误', message: err.message });
});

// 初始化数据库
try {
  initializeDatabase();
  console.log('数据库初始化成功');
} catch (err) {
  console.error('数据库初始化失败:', err);
}

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
