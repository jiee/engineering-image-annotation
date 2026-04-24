import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Upload, List, message, Empty, Spin, Image } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, DeleteOutlined, AimOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { imageApi } from '../../utils/api';

interface ImageItem {
  id: string;
  project_id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  annotation_count?: number;
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 加载图片列表
  const loadImages = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await imageApi.getImagesByProject(id);
      setImages(response.data || []);
    } catch {
      message.error('加载图片列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, [id]);

  // 上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/images/upload',
    data: () => ({ projectId: id }),
    showUploadList: false,
    accept: 'image/*',
    beforeUpload: (file) => {
      if (!id) {
        message.error('项目ID不存在，请刷新页面重试');
        return false;
      }
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件！');
        return false;
      }
      const isLt20M = file.size / 1024 / 1024 < 20;
      if (!isLt20M) {
        message.error('图片大小不能超过 20MB！');
        return false;
      }
      setUploading(true);
      return true;
    },
    onChange: (info) => {
      if (info.file.status === 'done') {
        setUploading(false);
        message.success(`${info.file.name} 上传成功`);
        loadImages();
      } else if (info.file.status === 'error') {
        setUploading(false);
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };

  // 删除图片
  const handleDelete = async (imageId: string) => {
    try {
      await imageApi.deleteImage(imageId);
      message.success('删除成功');
      loadImages();
    } catch {
      message.error('删除失败');
    }
  };

  // 格式化文件大小
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div style={{ padding: '24px', marginLeft: 220 }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')}>
        返回项目列表
      </Button>

      <Card
        title="影像管理"
        style={{ marginTop: '16px' }}
        extra={
          <Upload {...uploadProps}>
            <Button type="primary" icon={<UploadOutlined />} loading={uploading}>
              上传影像
            </Button>
          </Upload>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin />
          </div>
        ) : images.length === 0 ? (
          <Empty description="暂无影像，请点击上方按钮上传" />
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 6 }}
            dataSource={images}
            renderItem={(item) => (
              <List.Item>
                <Card
                  hoverable
                  cover={
                    <div style={{ height: 150, overflow: 'hidden', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Image
                        src={`/api/images/${item.id}/file`}
                        alt={item.original_name}
                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                      />
                    </div>
                  }
                  actions={[
                    <Button
                      key="annotate"
                      type="link"
                      icon={<AimOutlined />}
                      onClick={() => navigate(`/annotate/${id}/${item.id}`)}
                    >
                      标注
                    </Button>,
                    <Button
                      key="delete"
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(item.id)}
                    >
                      删除
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={item.original_name}
                    description={
                      <div>
                        <div>{formatSize(item.file_size)}</div>
                        {item.annotation_count !== undefined && (
                          <div style={{ color: '#1890ff' }}>{item.annotation_count} 个标注</div>
                        )}
                      </div>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default ProjectDetail;
