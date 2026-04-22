import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database';

const router = Router();

// 获取所有项目
router.get('/', (req: Request, res: Response) => {
  try {
    const projects = db.prepare(`
      SELECT p.*, 
             COUNT(DISTINCT i.id) as image_count,
             COUNT(DISTINCT a.id) as annotation_count
      FROM projects p
      LEFT JOIN images i ON i.project_id = p.id
      LEFT JOIN annotations a ON a.project_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `).all();
    res.json(projects);
  } catch (error) {
    console.error('获取项目列表失败:', error);
    res.status(500).json({ error: '获取项目列表失败' });
  }
});

// 获取单个项目
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    
    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }
    
    // 获取关联的影像和标注数量
    const stats = db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM images WHERE project_id = ?) as image_count,
        (SELECT COUNT(*) FROM annotations WHERE project_id = ?) as annotation_count
    `).get(id) as { image_count: number; annotation_count: number };
    
    res.json({ ...project, ...stats });
  } catch (error) {
    console.error('获取项目详情失败:', error);
    res.status(500).json({ error: '获取项目详情失败' });
  }
});

// 创建项目
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: '项目名称不能为空' });
    }
    
    const id = `proj-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO projects (id, name, description, status, created_at, updated_at)
      VALUES (?, ?, ?, 'active', ?, ?)
    `).run(id, name, description || '', now, now);
    
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    res.status(201).json(project);
  } catch (error) {
    console.error('创建项目失败:', error);
    res.status(500).json({ error: '创建项目失败' });
  }
});

// 更新项目
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    
    const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: '项目不存在' });
    }
    
    const now = new Date().toISOString();
    
    db.prepare(`
      UPDATE projects 
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          status = COALESCE(?, status),
          updated_at = ?
      WHERE id = ?
    `).run(name, description, status, now, id);
    
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    res.json(project);
  } catch (error) {
    console.error('更新项目失败:', error);
    res.status(500).json({ error: '更新项目失败' });
  }
});

// 删除项目
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: '项目不存在' });
    }
    
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    res.json({ message: '项目删除成功' });
  } catch (error) {
    console.error('删除项目失败:', error);
    res.status(500).json({ error: '删除项目失败' });
  }
});

export default router;
