import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database';
import { upload, handleUploadError } from '../middleware/upload';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

// 获取项目的所有影像
router.get('/project/:projectId', (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const images = db.prepare(`
      SELECT i.*, 
             COUNT(a.id) as annotation_count
      FROM images i
      LEFT JOIN annotations a ON a.image_id = i.id
      WHERE i.project_id = ?
      GROUP BY i.id
      ORDER BY i.created_at DESC
    `).all(projectId);
    res.json(images);
  } catch (error) {
    console.error('获取影像列表失败:', error);
    res.status(500).json({ error: '获取影像列表失败' });
  }
});

// 获取单个影像
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const image = db.prepare('SELECT * FROM images WHERE id = ?').get(id);
    
    if (!image) {
      return res.status(404).json({ error: '影像不存在' });
    }
    
    res.json(image);
  } catch (error) {
    console.error('获取影像详情失败:', error);
    res.status(500).json({ error: '获取影像详情失败' });
  }
});

// 上传影像
router.post('/upload', upload.single('file'), handleUploadError, (req: Request, res: Response) => {
  try {
    const { projectId } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: '请选择要上传的文件' });
    }
    
    if (!projectId) {
      // 删除已上传的文件
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: '项目ID不能为空' });
    }
    
    // 验证项目存在
    const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(projectId);
    if (!project) {
      fs.unlinkSync(file.path);
      return res.status(404).json({ error: '项目不存在' });
    }
    
    const id = `img-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO images (id, project_id, filename, original_name, file_path, file_size, mime_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      projectId,
      file.filename,
      file.originalname,
      file.path,
      file.size,
      file.mimetype,
      now
    );
    
    const image = db.prepare('SELECT * FROM images WHERE id = ?').get(id);
    res.status(201).json(image);
  } catch (error) {
    console.error('上传影像失败:', error);
    res.status(500).json({ error: '上传影像失败' });
  }
});

// 更新影像元数据
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { width, height, metadata } = req.body;
    
    const existing = db.prepare('SELECT * FROM images WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: '影像不存在' });
    }
    
    db.prepare(`
      UPDATE images 
      SET width = COALESCE(?, width),
          height = COALESCE(?, height),
          metadata = COALESCE(?, metadata)
      WHERE id = ?
    `).run(width, height, metadata ? JSON.stringify(metadata) : null, id);
    
    const image = db.prepare('SELECT * FROM images WHERE id = ?').get(id);
    res.json(image);
  } catch (error) {
    console.error('更新影像失败:', error);
    res.status(500).json({ error: '更新影像失败' });
  }
});

// 删除影像
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const image = db.prepare('SELECT * FROM images WHERE id = ?').get(id) as any;
    if (!image) {
      return res.status(404).json({ error: '影像不存在' });
    }
    
    // 删除文件
    if (fs.existsSync(image.file_path)) {
      fs.unlinkSync(image.file_path);
    }
    
    db.prepare('DELETE FROM images WHERE id = ?').run(id);
    res.json({ message: '影像删除成功' });
  } catch (error) {
    console.error('删除影像失败:', error);
    res.status(500).json({ error: '删除影像失败' });
  }
});

// 获取影像文件（用于图片显示）
router.get('/:id/file', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const image = db.prepare('SELECT file_path, mime_type FROM images WHERE id = ?').get(id) as any;
    
    if (!image) {
      return res.status(404).json({ error: '影像不存在' });
    }
    
    if (!fs.existsSync(image.file_path)) {
      return res.status(404).json({ error: '文件不存在' });
    }
    
    res.setHeader('Content-Type', image.mime_type);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    const fileStream = fs.createReadStream(image.file_path);
    fileStream.pipe(res);
  } catch (error) {
    console.error('获取影像文件失败:', error);
    res.status(500).json({ error: '获取影像文件失败' });
  }
});

export default router;
