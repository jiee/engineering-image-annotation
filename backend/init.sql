-- 工程现场影像智能标注与关联系统 - 数据库初始化脚本
-- SQLite 数据库

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

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_images_project_id ON images(project_id);
CREATE INDEX IF NOT EXISTS idx_annotations_project_id ON annotations(project_id);
CREATE INDEX IF NOT EXISTS idx_annotations_image_id ON annotations(image_id);
CREATE INDEX IF NOT EXISTS idx_attachments_annotation_id ON attachments(annotation_id);

-- 插入示例数据
INSERT INTO projects (id, name, description, status) VALUES 
    ('proj-001', '城市综合体建设项目', '位于市中心的大型商业综合体项目，占地面积约50000平方米', 'active'),
    ('proj-002', '地铁站点工程', '地铁3号线沿线站点建设工程，包含5个地下车站', 'active');

-- 插入示例影像
INSERT INTO images (id, project_id, filename, original_name, file_path, file_size, width, height, mime_type) VALUES 
    ('img-001', 'proj-001', 'aerial_view_001.jpg', '航拍全景图001.jpg', 'uploads/aerial_view_001.jpg', 2048000, 1920, 1080, 'image/jpeg'),
    ('img-002', 'proj-001', 'site_photo_001.jpg', '现场照片001.jpg', 'uploads/site_photo_001.jpg', 1024000, 1280, 960, 'image/jpeg'),
    ('img-003', 'proj-002', 'subway_aerial.jpg', '地铁航拍图.jpg', 'uploads/subway_aerial.jpg', 3072000, 2560, 1440, 'image/jpeg');

-- 插入示例标注
INSERT INTO annotations (id, project_id, image_id, type, coordinates, properties) VALUES 
    ('ann-001', 'proj-001', 'img-001', 'rectangle', '[{"x":150,"y":120},{"x":450,"y":120},{"x":450,"y":350},{"x":150,"y":350}]', '{"name":"施工区域A","description":"主体结构施工区域","status":"进行中"}'),
    ('ann-002', 'proj-001', 'img-001', 'point', '[{"x":600,"y":200}]', '{"name":"塔吊位置","description":"3号塔吊","status":"正常"}'),
    ('ann-003', 'proj-001', 'img-002', 'rectangle', '[{"x":200,"y":150},{"x":500,"y":150},{"x":500,"y":400},{"x":200,"y":400}]', '{"name":"钢筋加工区","description":"现场钢筋加工存放区域","status":"已完成"}'),
    ('ann-004', 'proj-001', 'img-001', 'point', '[{"x":300,"y":500}]', '{"name":"项目部位置","description":"项目经理办公区","status":"正常"}');
