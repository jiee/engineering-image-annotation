import { create } from 'zustand';
import { Project, Image, Annotation, ToolType, CanvasState } from '../types';

interface AppState {
  // 当前项目
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  
  // 当前影像
  currentImage: Image | null;
  setCurrentImage: (image: Image | null) => void;
  
  // 标注列表
  annotations: Annotation[];
  setAnnotations: (annotations: Annotation[]) => void;
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (id: string, annotation: Partial<Annotation>) => void;
  deleteAnnotation: (id: string) => void;
  
  // 选中标注
  selectedAnnotation: Annotation | null;
  setSelectedAnnotation: (annotation: Annotation | null) => void;
  
  // 当前工具
  currentTool: ToolType;
  setCurrentTool: (tool: ToolType) => void;
  
  // 画布状态
  canvasState: CanvasState;
  setCanvasState: (state: Partial<CanvasState>) => void;
  resetCanvasState: () => void;
  
  // 面板显示状态
  showPropertyPanel: boolean;
  setShowPropertyPanel: (show: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  // 当前项目
  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project }),
  
  // 当前影像
  currentImage: null,
  setCurrentImage: (image) => set({ currentImage: image }),
  
  // 标注列表
  annotations: [],
  setAnnotations: (annotations) => set({ annotations }),
  addAnnotation: (annotation) => 
    set((state) => ({ annotations: [...state.annotations, annotation] })),
  updateAnnotation: (id, updates) =>
    set((state) => ({
      annotations: state.annotations.map((ann) =>
        ann.id === id ? { ...ann, ...updates } : ann
      ),
      selectedAnnotation: state.selectedAnnotation?.id === id
        ? { ...state.selectedAnnotation, ...updates }
        : state.selectedAnnotation,
    })),
  deleteAnnotation: (id) =>
    set((state) => ({
      annotations: state.annotations.filter((ann) => ann.id !== id),
      selectedAnnotation: state.selectedAnnotation?.id === id
        ? null
        : state.selectedAnnotation,
    })),
  
  // 选中标注
  selectedAnnotation: null,
  setSelectedAnnotation: (annotation) => set({ selectedAnnotation: annotation }),
  
  // 当前工具
  currentTool: 'select',
  setCurrentTool: (tool) => set({ currentTool: tool }),
  
  // 画布状态
  canvasState: {
    zoom: 1,
    panX: 0,
    panY: 0,
  },
  setCanvasState: (state) =>
    set((prev) => ({
      canvasState: { ...prev.canvasState, ...state },
    })),
  resetCanvasState: () =>
    set({
      canvasState: { zoom: 1, panX: 0, panY: 0 },
    }),
  
  // 面板显示状态
  showPropertyPanel: true,
  setShowPropertyPanel: (show) => set({ showPropertyPanel: show }),
}));
