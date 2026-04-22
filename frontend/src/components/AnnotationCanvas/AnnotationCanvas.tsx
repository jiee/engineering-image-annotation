import React, { useEffect, useRef, useState, useCallback } from 'react';
import { message } from 'antd';
import { useStore } from '../../store';
import { imageApi, annotationApi } from '../../utils/api';
import { Point, Annotation, AnnotationType } from '../../types';
import { getAnnotationColor, getBoundingBox } from '../../utils/helpers';

interface AnnotationCanvasProps {
  imageId: string;
}

const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({ imageId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  const {
    annotations,
    selectedAnnotation,
    setSelectedAnnotation,
    addAnnotation,
    updateAnnotation,
    currentTool,
    canvasState,
    currentProject,
  } = useStore();

  // 加载图片
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setImageSize({ width: img.width, height: img.height });
      setImageLoaded(true);
    };
    img.src = imageApi.getImageUrl(imageId);

    return () => {
      imageRef.current = null;
      setImageLoaded(false);
    };
  }, [imageId]);

  // 绘制覆盖层
  const drawOverlay = useCallback(() => {
    const canvas = overlayRef.current;
    const container = containerRef.current;
    const img = imageRef.current;

    if (!canvas || !container || !img || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 计算变换参数
    const scale = Math.min(
      canvas.width / img.width,
      canvas.height / img.height
    ) * canvasState.zoom;
    
    const offsetX = (canvas.width - img.width * scale) / 2 + canvasState.panX;
    const offsetY = (canvas.height - img.height * scale) / 2 + canvasState.panY;

    // 绘制所有标注
    annotations.forEach((annotation) => {
      const isSelected = selectedAnnotation?.id === annotation.id;
      const color = getAnnotationColor(annotation.type, isSelected);

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = isSelected ? 3 : 2;

      if (annotation.type === 'point') {
        const points = annotation.coordinates as Point[];
        points.forEach((point) => {
          const x = point.x * scale + offsetX;
          const y = point.y * scale + offsetY;
          
          ctx.beginPath();
          ctx.arc(x, y, isSelected ? 10 : 8, 0, Math.PI * 2);
          ctx.fill();
          
          // 绘制选中时的十字
          if (isSelected) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x - 6, y);
            ctx.lineTo(x + 6, y);
            ctx.moveTo(x, y - 6);
            ctx.lineTo(x, y + 6);
            ctx.stroke();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
          }
        });
      } else if (annotation.type === 'rectangle') {
        const points = annotation.coordinates as Point[];
        if (points.length >= 2) {
          const bbox = getBoundingBox(points);
          const x = bbox.x * scale + offsetX;
          const y = bbox.y * scale + offsetY;
          const width = bbox.width * scale;
          const height = bbox.height * scale;

          ctx.strokeRect(x, y, width, height);

          // 绘制填充（半透明）
          ctx.fillStyle = color + '20';
          ctx.fillRect(x, y, width, height);

          // 绘制调整手柄（选中时）
          if (isSelected) {
            const handleSize = 8;
            const handles = [
              { x: x - handleSize / 2, y: y - handleSize / 2 },
              { x: x + width - handleSize / 2, y: y - handleSize / 2 },
              { x: x - handleSize / 2, y: y + height - handleSize / 2 },
              { x: x + width - handleSize / 2, y: y + height - handleSize / 2 },
            ];
            ctx.fillStyle = '#fff';
            handles.forEach((handle) => {
              ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
              ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
            });
          }
        }
      } else if (annotation.type === 'polygon') {
        const points = annotation.coordinates as Point[];
        if (points.length > 1) {
          ctx.beginPath();
          const firstPoint = points[0];
          ctx.moveTo(firstPoint.x * scale + offsetX, firstPoint.y * scale + offsetY);
          
          points.slice(1).forEach((point) => {
            ctx.lineTo(point.x * scale + offsetY, point.y * scale + offsetY);
          });
          
          if (points.length > 2) {
            ctx.closePath();
          }
          
          ctx.stroke();
          ctx.fillStyle = color + '20';
          ctx.fill();
        }
      }
    });

    // 绘制正在创建的标注
    if (isDrawing && currentPoints.length > 0) {
      ctx.strokeStyle = '#1890ff';
      ctx.fillStyle = '#1890ff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      if (currentTool === 'point' && startPoint) {
        const x = startPoint.x * scale + offsetX;
        const y = startPoint.y * scale + offsetY;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (currentTool === 'rectangle' && startPoint && currentPoints.length > 0) {
        const lastPoint = currentPoints[currentPoints.length - 1];
        const x = Math.min(startPoint.x, lastPoint.x) * scale + offsetX;
        const y = Math.min(startPoint.y, lastPoint.y) * scale + offsetY;
        const width = Math.abs(lastPoint.x - startPoint.x) * scale;
        const height = Math.abs(lastPoint.y - startPoint.y) * scale;
        ctx.strokeRect(x, y, width, height);
        ctx.fillStyle = '#1890ff20';
        ctx.fillRect(x, y, width, height);
      } else if (currentTool === 'polygon') {
        ctx.beginPath();
        const firstPoint = currentPoints[0];
        ctx.moveTo(firstPoint.x * scale + offsetX, firstPoint.y * scale + offsetY);
        
        currentPoints.slice(1).forEach((point) => {
          ctx.lineTo(point.x * scale + offsetX, point.y * scale + offsetY);
        });
        
        if (startPoint) {
          const lastPoint = currentPoints[currentPoints.length - 1];
          ctx.lineTo(lastPoint.x * scale + offsetX, lastPoint.y * scale + offsetY);
        }
        ctx.stroke();

        // 绘制顶点
        currentPoints.forEach((point) => {
          const x = point.x * scale + offsetX;
          const y = point.y * scale + offsetY;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      ctx.setLineDash([]);
    }
  }, [annotations, selectedAnnotation, isDrawing, startPoint, currentPoints, currentTool, canvasState, imageLoaded]);

  // 重新绘制
  useEffect(() => {
    if (imageLoaded) {
      drawOverlay();
    }
  }, [imageLoaded, drawOverlay]);

  // 获取鼠标在图片上的位置
  const getImagePoint = (e: React.MouseEvent): Point | null => {
    const canvas = overlayRef.current;
    const container = containerRef.current;
    const img = imageRef.current;

    if (!canvas || !container || !img) return null;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scale = Math.min(
      canvas.width / img.width,
      canvas.height / img.height
    ) * canvasState.zoom;
    
    const offsetX = (canvas.width - img.width * scale) / 2 + canvasState.panX;
    const offsetY = (canvas.height - img.height * scale) / 2 + canvasState.panY;

    const imgX = (mouseX - offsetX) / scale;
    const imgY = (mouseY - offsetY) / scale;

    // 检查是否在图片范围内
    if (imgX < 0 || imgX > img.width || imgY < 0 || imgY > img.height) {
      return null;
    }

    return { x: Math.round(imgX), y: Math.round(imgY) };
  };

  // 查找点击的标注
  const findAnnotationAtPoint = (point: Point): Annotation | null => {
    const scale = Math.min(
      overlayRef.current!.width / imageSize.width,
      overlayRef.current!.height / imageSize.height
    ) * canvasState.zoom;

    // 优先检查后创建的标注（顶层）
    for (let i = annotations.length - 1; i >= 0; i--) {
      const ann = annotations[i];
      
      if (ann.type === 'point') {
        const points = ann.coordinates as Point[];
        for (const p of points) {
          const dx = (p.x - point.x) * scale;
          const dy = (p.y - point.y) * scale;
          if (Math.sqrt(dx * dx + dy * dy) < 15) {
            return ann;
          }
        }
      } else if (ann.type === 'rectangle') {
        const points = ann.coordinates as Point[];
        if (points.length >= 2) {
          const bbox = getBoundingBox(points);
          const tolerance = 10;
          if (
            point.x >= bbox.x - tolerance &&
            point.x <= bbox.x + bbox.width + tolerance &&
            point.y >= bbox.y - tolerance &&
            point.y <= bbox.y + bbox.height + tolerance
          ) {
            return ann;
          }
        }
      }
    }
    return null;
  };

  // 鼠标按下处理
  const handleMouseDown = async (e: React.MouseEvent) => {
    if (!imageLoaded) return;

    const point = getImagePoint(e);
    if (!point) return;

    if (currentTool === 'select') {
      const annotation = findAnnotationAtPoint(point);
      setSelectedAnnotation(annotation);
    } else if (currentTool === 'point') {
      // 创建点标注
      try {
        const newAnnotation = await annotationApi.createAnnotation({
          projectId: currentProject?.id || '',
          imageId,
          type: 'point',
          coordinates: [point],
          properties: {
            name: `标注点 ${annotations.length + 1}`,
            description: '',
            status: '待处理',
          },
        });
        addAnnotation(newAnnotation.data);
        setSelectedAnnotation(newAnnotation.data);
        message.success('点标注已创建');
      } catch (error) {
        message.error('创建标注失败');
      }
    } else if (currentTool === 'rectangle' || currentTool === 'polygon') {
      setIsDrawing(true);
      setStartPoint(point);
      setCurrentPoints([point]);
    }
  };

  // 鼠标移动处理
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint) return;

    const point = getImagePoint(e);
    if (!point) return;

    if (currentTool === 'rectangle') {
      setCurrentPoints([point]);
    } else if (currentTool === 'polygon') {
      // 多边形绘制 - 实时更新最后一个点
      setCurrentPoints((prev) => {
        if (prev.length === 0) return [startPoint!, point];
        return [...prev.slice(0, -1), point];
      });
    }
  };

  // 鼠标松开处理
  const handleMouseUp = async (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint) return;

    const point = getImagePoint(e);
    if (!point) {
      setIsDrawing(false);
      setStartPoint(null);
      setCurrentPoints([]);
      return;
    }

    if (currentTool === 'rectangle') {
      // 创建矩形标注
      try {
        const coordinates = [
          { x: Math.min(startPoint.x, point.x), y: Math.min(startPoint.y, point.y) },
          { x: Math.max(startPoint.x, point.x), y: Math.max(startPoint.y, point.y) },
        ];
        
        const newAnnotation = await annotationApi.createAnnotation({
          projectId: currentProject?.id || '',
          imageId,
          type: 'rectangle',
          coordinates,
          properties: {
            name: `标注区域 ${annotations.length + 1}`,
            description: '',
            status: '待处理',
          },
        });
        addAnnotation(newAnnotation.data);
        setSelectedAnnotation(newAnnotation.data);
        message.success('矩形标注已创建');
      } catch (error) {
        message.error('创建标注失败');
      }
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoints([]);
  };

  // 双击完成多边形
  const handleDoubleClick = async () => {
    if (currentTool === 'polygon' && currentPoints.length > 2) {
      try {
        const newAnnotation = await annotationApi.createAnnotation({
          projectId: currentProject?.id || '',
          imageId,
          type: 'polygon',
          coordinates: currentPoints,
          properties: {
            name: `标注区域 ${annotations.length + 1}`,
            description: '',
            status: '待处理',
          },
        });
        addAnnotation(newAnnotation.data);
        setSelectedAnnotation(newAnnotation.data);
        message.success('多边形标注已创建');
      } catch (error) {
        message.error('创建标注失败');
      }
    }
    
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoints([]);
  };

  // 滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const { setCanvasState } = useStore.getState();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(10, canvasState.zoom * delta));
    setCanvasState({ zoom: newZoom });
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: '#1a1a1a',
        overflow: 'hidden',
      }}
    >
      {/* 图片层 */}
      <img
        src={imageApi.getImageUrl(imageId)}
        alt=""
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) translate(${canvasState.panX}px, ${canvasState.panY}px) scale(${canvasState.zoom})`,
          transformOrigin: 'center center',
          maxWidth: '100%',
          maxHeight: '100%',
          pointerEvents: 'none',
        }}
        draggable={false}
      />
      
      {/* 标注层 */}
      <canvas
        ref={overlayRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          cursor: currentTool === 'select' ? 'default' : 'crosshair',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
      />
    </div>
  );
};

export default AnnotationCanvas;
