import React from 'react';
import { Tooltip, Button, ButtonGroup } from 'antd';
import {
  SelectOutlined,
  DragOutlined,
  AimOutlined,
  BorderOutlined,
  GatewayOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ExpandOutlined,
  UndoOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import { ToolType } from '../../types';
import { useStore } from '../../store';

const Toolbar: React.FC = () => {
  const { currentTool, setCurrentTool, canvasState, setCanvasState, resetCanvasState } = useStore();

  const tools: { key: ToolType; icon: React.ReactNode; title: string }[] = [
    { key: 'select', icon: <SelectOutlined />, title: '选择工具 (V)' },
    { key: 'pan', icon: <DragOutlined />, title: '平移工具 (H)' },
    { key: 'point', icon: <AimOutlined />, title: '点标注 (P)' },
    { key: 'rectangle', icon: <BorderOutlined />, title: '矩形标注 (R)' },
    { key: 'polygon', icon: <GatewayOutlined />, title: '多边形标注 (G)' },
  ];

  const handleZoomIn = () => {
    setCanvasState({ zoom: Math.min(canvasState.zoom * 1.2, 10) });
  };

  const handleZoomOut = () => {
    setCanvasState({ zoom: Math.max(canvasState.zoom / 1.2, 0.1) });
  };

  const handleReset = () => {
    resetCanvasState();
  };

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '8px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* 工具选择 */}
      <div>
        <div style={{ fontSize: '10px', color: '#999', marginBottom: '4px', textAlign: 'center' }}>
          工具
        </div>
        <ButtonGroup>
          {tools.map((tool) => (
            <Tooltip key={tool.key} title={tool.title} placement="right">
              <Button
                type={currentTool === tool.key ? 'primary' : 'default'}
                icon={tool.icon}
                onClick={() => setCurrentTool(tool.key)}
                style={{ width: '36px', height: '36px' }}
              />
            </Tooltip>
          ))}
        </ButtonGroup>
      </div>

      {/* 分隔线 */}
      <div style={{ height: '1px', background: '#e8e8e8', margin: '4px 0' }} />

      {/* 缩放控制 */}
      <div>
        <div style={{ fontSize: '10px', color: '#999', marginBottom: '4px', textAlign: 'center' }}>
          缩放 {Math.round(canvasState.zoom * 100)}%
        </div>
        <ButtonGroup>
          <Tooltip title="放大" placement="right">
            <Button
              icon={<ZoomInOutlined />}
              onClick={handleZoomIn}
              style={{ width: '36px', height: '36px' }}
            />
          </Tooltip>
          <Tooltip title="缩小" placement="right">
            <Button
              icon={<ZoomOutOutlined />}
              onClick={handleZoomOut}
              style={{ width: '36px', height: '36px' }}
            />
          </Tooltip>
          <Tooltip title="重置视图" placement="right">
            <Button
              icon={<ExpandOutlined />}
              onClick={handleReset}
              style={{ width: '36px', height: '36px' }}
            />
          </Tooltip>
        </ButtonGroup>
      </div>
    </div>
  );
};

export default Toolbar;
