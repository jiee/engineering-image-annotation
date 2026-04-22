import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============ 项目 API ============
export const projectApi = {
  // 获取所有项目
  getProjects: () => api.get('/projects'),
  
  // 获取单个项目
  getProject: (id: string) => api.get(`/projects/${id}`),
  
  // 创建项目
  createProject: (data: { name: string; description?: string }) =>
    api.post('/projects', data),
  
  // 更新项目
  updateProject: (id: string, data: Partial<{ name: string; description: string; status: string }>) =>
    api.put(`/projects/${id}`, data),
  
  // 删除项目
  deleteProject: (id: string) => api.delete(`/projects/${id}`),
};

// ============ 影像 API ============
export const imageApi = {
  // 获取项目的所有影像
  getImages: (projectId: string) => api.get(`/images/project/${projectId}`),
  
  // 获取单个影像
  getImage: (id: string) => api.get(`/images/${id}`),
  
  // 上传影像
  uploadImage: (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('file', file);
    return api.post('/images/upload', formData);
  },
  
  // 更新影像
  updateImage: (id: string, data: Partial<{ width: number; height: number; metadata: any }>) =>
    api.put(`/images/${id}`, data),
  
  // 删除影像
  deleteImage: (id: string) => api.delete(`/images/${id}`),
  
  // 获取影像文件URL
  getImageUrl: (id: string) => `/images/${id}/file`,
};

// ============ 标注 API ============
export const annotationApi = {
  // 获取影像的所有标注
  getAnnotationsByImage: (imageId: string) => api.get(`/annotations/image/${imageId}`),
  
  // 获取项目的所有标注
  getAnnotationsByProject: (projectId: string) => api.get(`/annotations/project/${projectId}`),
  
  // 获取单个标注
  getAnnotation: (id: string) => api.get(`/annotations/${id}`),
  
  // 创建标注
  createAnnotation: (data: {
    projectId: string;
    imageId: string;
    type: 'point' | 'rectangle' | 'polygon';
    coordinates: any[];
    properties?: any;
  }) => api.post('/annotations', data),
  
  // 更新标注
  updateAnnotation: (id: string, data: Partial<{ coordinates: any; properties: any }>) =>
    api.put(`/annotations/${id}`, data),
  
  // 删除标注
  deleteAnnotation: (id: string) => api.delete(`/annotations/${id}`),
};

// ============ 附件 API ============
export const attachmentApi = {
  // 获取标注的所有附件
  getAttachments: (annotationId: string) => api.get(`/attachments/annotation/${annotationId}`),
  
  // 上传附件
  uploadAttachment: (annotationId: string, file: File) => {
    const formData = new FormData();
    formData.append('annotationId', annotationId);
    formData.append('file', file);
    return api.post('/attachments/upload', formData);
  },
  
  // 删除附件
  deleteAttachment: (id: string) => api.delete(`/attachments/${id}`),
  
  // 获取附件文件URL
  getAttachmentUrl: (id: string) => `/attachments/${id}/file`,
};

export default api;
