import React, { useState } from 'react';
import { Card, Input, Select, Button, Upload, List, message } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useStore } from '../../store/index';
import type { UploadProps } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

const PropertyPanel: React.FC = () => {
  const { selectedAnnotation, updateAnnotation } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');

  React.useEffect(() => {
    if (selectedAnnotation) {
      setName(selectedAnnotation.properties?.name || '');
      setDescription(selectedAnnotation.properties?.description || '');
      setStatus(selectedAnnotation.properties?.status || 'pending');
    }
  }, [selectedAnnotation]);

  const handleUpdate = () => {
    if (selectedAnnotation && updateAnnotation) {
      updateAnnotation(selectedAnnotation.id, {
        properties: { name, description, status },
      });
      message.success('更新成功');
    }
  };

  const uploadProps: UploadProps = {
    showUploadList: false,
    onChange: (info) => {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };

  if (!selectedAnnotation) {
    return (
      <Card title="属性面板" style={{ height: '100%', overflow: 'auto' }}>
        <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
          请选择一个标注
        </div>
      </Card>
    );
  }

  return (
    <Card title="属性面板" style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>编号</label>
        <Input value={selectedAnnotation.id} disabled />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>名称</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>描述</label>
        <TextArea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>状态</label>
        <Select value={status} onChange={setStatus} style={{ width: '100%' }}>
          <Option value="pending">待核查</Option>
          <Option value="issue">已发现问题</Option>
          <Option value="assigned">已派发</Option>
          <Option value="fixing">整改中</Option>
          <Option value="reviewed">已复查</Option>
          <Option value="closed">已关闭</Option>
        </Select>
      </div>

      <Button type="primary" onClick={handleUpdate} style={{ width: '100%', marginBottom: '16px' }}>
        保存修改
      </Button>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>附件</label>
        <Upload {...uploadProps}>
          <Button style={{ width: '100%' }}>上传附件</Button>
        </Upload>
      </div>

      <List
        size="small"
        dataSource={[]}
        renderItem={() => (
          <List.Item
            actions={[
              <EyeOutlined key="view" />,
              <DeleteOutlined key="delete" />,
            ]}
          >
            附件项
          </List.Item>
        )}
      />
    </Card>
  );
};

export default PropertyPanel;
