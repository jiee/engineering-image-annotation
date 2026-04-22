import React from 'react';
import { Button, Space, Tooltip } from 'antd';
import {
  AimOutlined,
  BorderOutlined,
  HighlightOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

interface ToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onToolChange }) => {
  const tools = [
    { key: 'select', icon: <AimOutlined />, label: '选择' },
    { key: 'point', icon: <AimOutlined />, label: '点标注' },
    { key: 'rectangle', icon: <BorderOutlined />, label: '矩形' },
    { key: 'polygon', icon: <HighlightOutlined />, label: '多边形' },
    { key: 'text', icon: <EditOutlined />, label: '文字' },
  ];

  return (
    <div style={{ padding: '8px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
      <Space>
        {tools.map((tool) => (
          <Tooltip key={tool.key} title={tool.label}>
            <Button
              type={activeTool === tool.key ? 'primary' : 'default'}
              icon={tool.icon}
              onClick={() => onToolChange(tool.key)}
            />
          </Tooltip>
        ))}
        <Tooltip title="删除选中">
          <Button icon={<DeleteOutlined />} danger />
        </Tooltip>
      </Space>
    </div>
  );
};

export default Toolbar;
