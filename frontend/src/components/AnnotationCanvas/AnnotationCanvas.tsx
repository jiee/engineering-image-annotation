import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../../store/index';

interface AnnotationCanvasProps {
  activeTool: string;
}

const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({ activeTool }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { annotations, selectedAnnotation, setSelectedAnnotation, addAnnotation } = useStore();
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制所有标注
    annotations.forEach((annotation) => {
      ctx.strokeStyle = selectedAnnotation?.id === annotation.id ? '#1890ff' : '#52c41a';
      ctx.lineWidth = 2;

      if (annotation.type === 'point') {
        const point = annotation.coordinates[0];
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (annotation.type === 'rectangle') {
        const [p1, p2] = annotation.coordinates;
        ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      } else if (annotation.type === 'polygon') {
        ctx.beginPath();
        annotation.coordinates.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.closePath();
        ctx.stroke();
      }
    });
  }, [annotations, selectedAnnotation]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'point' && addAnnotation) {
      addAnnotation({
        id: `P-${Date.now()}`,
        type: 'point',
        coordinates: [{ x, y }],
        properties: { name: '', description: '', status: 'pending' },
      });
    } else if (activeTool === 'select') {
      // 查找点击的标注
      const clicked = annotations.find((annotation) => {
        if (annotation.type === 'point') {
          const point = annotation.coordinates[0];
          const distance = Math.sqrt(
            Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
          );
          return distance < 10;
        }
        return false;
      });
      if (setSelectedAnnotation) {
        setSelectedAnnotation(clicked || null);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'rectangle') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    setStartPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsDrawing(true);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool !== 'rectangle' || !addAnnotation) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const endPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    addAnnotation({
      id: `R-${Date.now()}`,
      type: 'rectangle',
      coordinates: [startPos, endPos],
      properties: { name: '', description: '', status: 'pending' },
    });

    setIsDrawing(false);
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ position: 'absolute', top: 0, left: 0, cursor: 'crosshair' }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    />
  );
};

export default AnnotationCanvas;
