import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database';
import { upload, handleUploadError } from '../middleware/upload';
import * as fs from 'fs';

const router = Router();

// 获取标注的所有附件
router.get('/annotation/:annotationId', (req: Request, res: Response) => {
  try {
    const { annotationId } = req.params;
    const attachments = db.prepare(`
      SELECT * FROM attachments WHERE annotation_id = ?
      ORDER BY created_at DESC
    `).all(annotationId);
    res.json(attachments);
  } catch (error) {
    console.error('获取附件列表失败:', error);
    res.status(500).json({ error: '获取附件列表失败' });
  }
});

// 上传附件
router.post('/upload', upload.single('file'), handleUploadError, (req: Request, res: Response) => {
  try {
    const { annotationId } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: '请选择要上传的文件' });
    }
    
    if (!annotationId) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: '标注ID不能为空' });
    }
    
    // 验证标注存在
    const annotation = db.prepare('SELECT id FROM annotations WHERE id = ?').get(annotationId);
    if (!annotation) {
      fs.unlinkSync(file.path);
      return res.status(404).json({ error: '标注不存在' });
    }
    
    const id = `att-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO attachments (id, annotation_id, filename, original_name, file_path, file_size, mime_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      annotationId,
      file.filename,
      file.originalname,
      file.path,
      file.size,
      file.mimetype,
      now
    );
    
    const attachment = db.prepare('SELECT * FROM attachments WHERE id = ?').get(id);
    res.status(201).json(attachment);
  } catch (error) {
    console.error('上传附件失败:', error);
    res.status(500).json({ error: '上传附件失败' });
  }
});

// 删除附件
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const attachment = db.prepare('SELECT * FROM attachments WHERE id = ?').get(id) as any;
    if (!attachment) {
      return res.status(404).json({ error: '附件不存在' });
    }
    
    // 删除文件
    if (fs.existsSync(attachment.file_path)) {
      fs.unlinkSync(attachment.file_path);
    }
    
    db.prepare('DELETE FROM attachments WHERE id = ?').run(id);
    res.json({ message: '附件删除成功' });
  } catch (error) {
    console.error('删除附件失败:', error);
    res.status(500).json({ error: '删除附件失败' });
  }
});

// 获取附件文件
router.get('/:id/file', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const attachment = db.prepare('SELECT file_path, original_name, mime_type FROM attachments WHERE id = ?').get(id) as any;
    
    if (!attachment) {
      return res.status(404).json({ error: '附件不存在' });
    }
    
    if (!fs.existsSync(attachment.file_path)) {
      return res.status(404).json({ error: '文件不存在' });
    }
    
    res.setHeader('Content-Type', attachment.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(attachment.original_name)}"`);
    const fileStream = fs.createReadStream(attachment.file_path);
    fileStream.pipe(res);
  } catch (error) {
    console.error('获取附件文件失败:', error);
    res.status(500).json({ error: '获取附件文件失败' });
  }
});

export default router;
