import React, { useEffect, useRef } from 'react';
import { useStore } from '../../store';
import { imageApi } from '../../utils/api';

interface ImageViewerProps {
  imageId: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ imageId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const { canvasState, currentTool, setCanvasState } = useStore();

  // 加载图片
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      drawCanvas();
    };
    img.onerror = () => {
      console.error('图片加载失败');
    };
    img.src = imageApi.getImageUrl(imageId);

    return () => {
      imageRef.current = null;
    };
  }, [imageId]);

  // 绘制画布
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const img = imageRef.current;

    if (!canvas || !container || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸为容器尺寸
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 保存状态
    ctx.save();

    // 应用缩放和平移
    ctx.translate(canvas.width / 2 + canvasState.panX, canvas.height / 2 + canvasState.panY);
    ctx.scale(canvasState.zoom, canvasState.zoom);
    ctx.translate(-img.width / 2, -img.height / 2);

    // 绘制图片
    ctx.drawImage(img, 0, 0);

    // 恢复状态
    ctx.restore();
  };

  // 重新绘制当画布状态变化时
  useEffect(() => {
    drawCanvas();
  }, [canvasState]);

  // 处理鼠标事件
  const handleMouseDown = (e: React.MouseEvent) => {
    if (currentTool === 'pan') {
      // 开始平移
      const startX = e.clientX;
      const startY = e.clientY;
      const startPanX = canvasState.panX;
      const startPanY = canvasState.panY;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        setCanvasState({ panX: startPanX + dx, panY: startPanY + dy });
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  // 处理鼠标滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
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
        overflow: 'hidden',
        cursor: currentTool === 'pan' ? 'grab' : 'default',
        background: '#1a1a1a',
      }}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          cursor: currentTool === 'pan' ? 'grabbing' : 'default',
        }}
      />
    </div>
  );
};

export default ImageViewer;
