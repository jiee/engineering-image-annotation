// 项目类型
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  image_count?: number;
  annotation_count?: number;
}

// 影像类型
export interface Image {
  id: string;
  project_id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size?: number;
  width?: number;
  height?: number;
  mime_type?: string;
  metadata?: Record<string, any>;
  created_at: string;
  annotation_count?: number;
}

// 坐标点
export interface Point {
  x: number;
  y: number;
}

// 标注类型
export type AnnotationType = 'point' | 'rectangle' | 'polygon';

// 标注属性
export interface AnnotationProperties {
  name?: string;
  description?: string;
  status?: string;
  [key: string]: any;
}

// 标注类型定义
export interface Annotation {
  id: string;
  project_id: string;
  image_id: string;
  type: AnnotationType;
  coordinates: Point[] | Point[][];
  properties?: AnnotationProperties;
  attachments?: string[];
  created_at?: string;
  updated_at?: string;
  attachment_count?: number;
  image_name?: string;
}

// 附件类型
export interface Attachment {
  id: string;
  annotation_id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
}

// 工具类型
export type ToolType = 'select' | 'pan' | 'point' | 'rectangle' | 'polygon';

// 画布状态
export interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
}
