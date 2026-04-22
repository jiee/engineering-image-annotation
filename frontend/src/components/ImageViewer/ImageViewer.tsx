import React, { useEffect, useRef } from 'react';
import { useStore } from '../../store/index';

interface ImageViewerProps {
  imageId?: string;
  children?: React.ReactNode;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ imageId, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { canvasState, setCanvasState } = useStore();

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
        background: '#1a1a1a',
        position: 'relative',
      }}
      onWheel={handleWheel}
    >
      {!imageId && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#999',
            textAlign: 'center',
          }}
        >
          <p>请选择一张图片</p>
        </div>
      )}
      {children}
    </div>
  );
};

export default ImageViewer;
