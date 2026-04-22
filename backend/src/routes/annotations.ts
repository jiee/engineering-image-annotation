import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database';

const router = Router();

// 获取影像的所有标注
router.get('/image/:imageId', (req: Request, res: Response) => {
  try {
    const { imageId } = req.params;
    const annotations = db.prepare(`
      SELECT a.*, 
             COUNT(at.id) as attachment_count
      FROM annotations a
      LEFT JOIN attachments at ON at.annotation_id = a.id
      WHERE a.image_id = ?
      GROUP BY a.id
      ORDER BY a.created_at ASC
    `).all(imageId);
    
    // 解析 JSON 字段
    const parsed = annotations.map((ann: any) => ({
      ...ann,
      coordinates: JSON.parse(ann.coordinates),
      properties: ann.properties ? JSON.parse(ann.properties) : null
    }));
    
    res.json(parsed);
  } catch (error) {
    console.error('获取标注列表失败:', error);
    res.status(500).json({ error: '获取标注列表失败' });
  }
});

// 获取项目的所有标注
router.get('/project/:projectId', (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const annotations = db.prepare(`
      SELECT a.*, i.original_name as image_name,
             COUNT(at.id) as attachment_count
      FROM annotations a
      LEFT JOIN images i ON i.id = a.image_id
      LEFT JOIN attachments at ON at.annotation_id = a.id
      WHERE a.project_id = ?
      GROUP BY a.id
      ORDER BY a.created_at ASC
    `).all(projectId);
    
    // 解析 JSON 字段
    const parsed = annotations.map((ann: any) => ({
      ...ann,
      coordinates: JSON.parse(ann.coordinates),
      properties: ann.properties ? JSON.parse(ann.properties) : null
    }));
    
    res.json(parsed);
  } catch (error) {
    console.error('获取项目标注列表失败:', error);
    res.status(500).json({ error: '获取项目标注列表失败' });
  }
});

// 获取单个标注
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const annotation = db.prepare('SELECT * FROM annotations WHERE id = ?').get(id) as any;
    
    if (!annotation) {
      return res.status(404).json({ error: '标注不存在' });
    }
    
    res.json({
      ...annotation,
      coordinates: JSON.parse(annotation.coordinates),
      properties: annotation.properties ? JSON.parse(annotation.properties) : null
    });
  } catch (error) {
    console.error('获取标注详情失败:', error);
    res.status(500).json({ error: '获取标注详情失败' });
  }
});

// 创建标注
router.post('/', (req: Request, res: Response) => {
  try {
    const { projectId, imageId, type, coordinates, properties } = req.body;
    
    if (!projectId || !imageId || !type || !coordinates) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 验证项目和影像存在
    const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(projectId);
    const image = db.prepare('SELECT id FROM images WHERE id = ?').get(imageId);
    
    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }
    if (!image) {
      return res.status(404).json({ error: '影像不存在' });
    }
    
    // 验证标注类型
    if (!['point', 'rectangle', 'polygon'].includes(type)) {
      return res.status(400).json({ error: '无效的标注类型' });
    }
    
    const id = `ann-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO annotations (id, project_id, image_id, type, coordinates, properties, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      projectId,
      imageId,
      type,
      JSON.stringify(coordinates),
      properties ? JSON.stringify(properties) : null,
      now,
      now
    );
    
    const annotation = db.prepare('SELECT * FROM annotations WHERE id = ?').get(id) as any;
    res.status(201).json({
      ...annotation,
      coordinates: JSON.parse(annotation.coordinates),
      properties: annotation.properties ? JSON.parse(annotation.properties) : null
    });
  } catch (error) {
    console.error('创建标注失败:', error);
    res.status(500).json({ error: '创建标注失败' });
  }
});

// 更新标注
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { coordinates, properties } = req.body;
    
    const existing = db.prepare('SELECT * FROM annotations WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: '标注不存在' });
    }
    
    const now = new Date().toISOString();
    
    db.prepare(`
      UPDATE annotations 
      SET coordinates = COALESCE(?, coordinates),
          properties = COALESCE(?, properties),
          updated_at = ?
      WHERE id = ?
    `).run(
      coordinates ? JSON.stringify(coordinates) : null,
      properties ? JSON.stringify(properties) : null,
      now,
      id
    );
    
    const annotation = db.prepare('SELECT * FROM annotations WHERE id = ?').get(id) as any;
    res.json({
      ...annotation,
      coordinates: JSON.parse(annotation.coordinates),
      properties: annotation.properties ? JSON.parse(annotation.properties) : null
    });
  } catch (error) {
    console.error('更新标注失败:', error);
    res.status(500).json({ error: '更新标注失败' });
  }
});

// 删除标注
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const existing = db.prepare('SELECT * FROM annotations WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: '标注不存在' });
    }
    
    db.prepare('DELETE FROM annotations WHERE id = ?').run(id);
    res.json({ message: '标注删除成功' });
  } catch (error) {
    console.error('删除标注失败:', error);
    res.status(500).json({ error: '删除标注失败' });
  }
});

export default router;
