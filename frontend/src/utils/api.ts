import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
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
  getProjects: () => api.get('/projects'),
  getProject: (id: string) => api.get(`/projects/${id}`),
  createProject: (data: { name: string; description?: string }) => api.post('/projects', data),
  updateProject: (id: string, data: Partial<{ name: string; description: string; status: string }>) => api.put(`/projects/${id}`, data),
  deleteProject: (id: string) => api.delete(`/projects/${id}`),
};

// ============ 影像 API ============
export const imageApi = {
  getImagesByProject: (projectId: string) => api.get(`/images/project/${projectId}`),
  getImage: (id: string) => api.get(`/images/${id}`),
  uploadImage: (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('file', file);
    return api.post('/images/upload', formData);
  },
  updateImage: (id: string, data: Partial<{ width: number; height: number; metadata: unknown }>) => api.put(`/images/${id}`, data),
  deleteImage: (id: string) => api.delete(`/images/${id}`),
  getImageUrl: (id: string) => `/api/images/${id}/file`,
};

// ============ 标注 API ============
export const annotationApi = {
  getAnnotationsByImage: (imageId: string) => api.get(`/annotations/image/${imageId}`),
  getAnnotationsByProject: (projectId: string) => api.get(`/annotations/project/${projectId}`),
  getAnnotation: (id: string) => api.get(`/annotations/${id}`),
  createAnnotation: (data: {
    projectId: string;
    imageId: string;
    type: 'point' | 'rectangle' | 'polygon';
    coordinates: unknown[];
    properties?: unknown;
  }) => api.post('/annotations', data),
  updateAnnotation: (id: string, data: Partial<{ coordinates: unknown; properties: unknown }>) => api.put(`/annotations/${id}`, data),
  deleteAnnotation: (id: string) => api.delete(`/annotations/${id}`),
};

// ============ 附件 API ============
export const attachmentApi = {
  getAttachments: (annotationId: string) => api.get(`/attachments/annotation/${annotationId}`),
  uploadAttachment: (annotationId: string, file: File) => {
    const formData = new FormData();
    formData.append('annotationId', annotationId);
    formData.append('file', file);
    return api.post('/attachments/upload', formData);
  },
  deleteAttachment: (id: string) => api.delete(`/attachments/${id}`),
  getAttachmentUrl: (id: string) => `/api/attachments/${id}/file`,
};

export default api;
