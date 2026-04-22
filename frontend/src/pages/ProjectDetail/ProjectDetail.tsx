import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Upload, List, message } from 'antd';
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [images, setImages] = useState<{ id: string; name: string; url: string }[]>([]);

  const uploadProps: UploadProps = {
    showUploadList: false,
    onChange: (info) => {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`);
        setImages([...images, { id: Date.now().toString(), name: info.file.name, url: '' }]);
      }
    },
  };

  return (
    <div style={{ padding: '24px' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
        返回项目列表
      </Button>

      <Card title={`项目 ${id}`} style={{ marginTop: '16px' }}>
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />}>上传影像</Button>
        </Upload>

        <List
          style={{ marginTop: '16px' }}
          dataSource={images}
          renderItem={(item) => (
            <List.Item
              actions={[<Button key="annotate" type="link" onClick={() => navigate(`/annotate/${id}/${item.id}`)}>标注</Button>]}
            >
              {item.name}
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default ProjectDetail;
