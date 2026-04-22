import React, { useEffect, useState, useCallback } from 'react';
import { Card, Button, Row, Col, Upload, Empty, Modal, message, Popconfirm, Descriptions, Tag, Spin } from 'antd';
import { 
  PlusOutlined, 
  UploadOutlined, 
  DeleteOutlined, 
  PictureOutlined, 
  AimOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { projectApi, imageApi } from '../../utils/api';
import { Project, Image } from '../../types';
import { formatFileSize, formatDateTime } from '../../utils/helpers';
import { useStore } from '../../store';

const { Dragger } = Upload;

const ProjectDetail: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { setCurrentProject } = useStore();
  
  const [project, setProject] = useState<Project | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<Image | null>(null);

  // 加载项目详情
  const loadProject = async () => {
    if (!projectId) return;
    try {
      const response = await projectApi.getProject(projectId);
      setProject(response.data);
      setCurrentProject(response.data);
    } catch (error) {
      message.error('加载项目失败');
    }
  };

  // 加载影像列表
  const loadImages = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const response = await imageApi.getImages(projectId);
      setImages(response.data);
    } catch (error) {
      message.error('加载影像失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
    loadImages();
    
    return () => {
      setCurrentProject(null);
    };
  }, [projectId]);

  // 上传影像
  const handleUpload = async (file: File) => {
    if (!projectId) return false;
    
    setUploading(true);
    try {
      await imageApi.uploadImage(projectId, file);
      message.success('上传成功');
      loadImages();
    } catch (error) {
      message.error('上传失败');
    } finally {
      setUploading(false);
    }
    return false;
  };

  // 删除影像
  const handleDeleteImage = async (imageId: string) => {
    try {
      await imageApi.deleteImage(imageId);
      message.success('删除成功');
      setImages(images.filter((img) => img.id !== imageId));
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 打开预览
  const openPreview = (image: Image) => {
    setPreviewImage(image);
    setPreviewVisible(true);
  };

  // 打开标注页面
  const openAnnotation = (image: Image) => {
    navigate(`/projects/${projectId}/images/${image.id}`);
  };

  const statusColors: Record<string, string> = {
    active: 'green',
    paused: 'orange',
    completed: 'blue',
  };

  if (!project) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        marginLeft: 220 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="page-container" style={{ marginLeft: 220 }}>
      {/* 头部 */}
      <div className="page-header">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/projects')}
          style={{ marginBottom: '16px' }}
        >
          返回项目列表
        </Button>
        
        <Row gutter={16}>
          <Col flex="1">
            <h1 className="page-title">{project.name}</h1>
            <p className="page-subtitle">{project.description || '暂无描述'}</p>
          </Col>
          <Col>
            <Tag color={statusColors[project.status] || 'default'}>
              {project.status === 'active' ? '进行中' : project.status}
            </Tag>
          </Col>
        </Row>
      </div>

      {/* 项目信息 */}
      <Card style={{ marginBottom: '24px' }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="创建时间">
            {formatDateTime(project.created_at)}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {formatDateTime(project.updated_at)}
          </Descriptions.Item>
          <Descriptions.Item label="影像数量">
            <Tag color="blue">{images.length}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 上传区域 */}
      <Card 
        title="影像管理" 
        extra={
          <Upload
            showUploadList={false}
            beforeUpload={handleUpload}
            accept="image/*"
            disabled={uploading}
          >
            <Button type="primary" icon={<UploadOutlined />} loading={uploading}>
              上传影像
            </Button>
          </Upload>
        }
      >
        {images.length === 0 && !loading ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无影像"
          >
            <Upload
              showUploadList={false}
              beforeUpload={handleUpload}
              accept="image/*"
              disabled={uploading}
            >
              <Button type="primary" icon={<UploadOutlined />} loading={uploading}>
                上传第一张影像
              </Button>
            </Upload>
          </Empty>
        ) : (
          <Row gutter={[16, 16]}>
            {images.map((image) => (
              <Col key={image.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  cover={
                    <div 
                      style={{ 
                        height: '180px', 
                        background: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}
                    >
                      <img
                        src={imageApi.getImageUrl(image.id)}
                        alt={image.original_name}
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  }
                  actions={[
                    <Button 
                      type="text" 
                      icon={<EyeOutlined />} 
                      onClick={() => openPreview(image)}
                    >
                      预览
                    </Button>,
                    <Button 
                      type="text" 
                      icon={<AimOutlined />} 
                      onClick={() => openAnnotation(image)}
                    >
                      标注
                    </Button>,
                    <Popconfirm
                      title="确定要删除这张影像吗？"
                      onConfirm={() => handleDeleteImage(image.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button type="text" danger icon={<DeleteOutlined />}>
                        删除
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <Card.Meta
                    title={image.original_name}
                    description={
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        <div>{formatFileSize(image.file_size || 0)}</div>
                        <div>{image.annotation_count || 0} 个标注</div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* 预览弹窗 */}
      <Modal
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="back" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>,
          <Button 
            key="annotate" 
            type="primary" 
            icon={<AimOutlined />}
            onClick={() => {
              setPreviewVisible(false);
              if (previewImage) openAnnotation(previewImage);
            }}
          >
            开始标注
          </Button>,
        ]}
        width={800}
      >
        {previewImage && (
          <div style={{ textAlign: 'center' }}>
            <img
              src={imageApi.getImageUrl(previewImage.id)}
              alt={previewImage.original_name}
              style={{ maxWidth: '100%', maxHeight: '60vh' }}
            />
            <div style={{ marginTop: '16px', textAlign: 'left' }}>
              <p><strong>文件名：</strong>{previewImage.original_name}</p>
              <p><strong>文件大小：</strong>{formatFileSize(previewImage.file_size || 0)}</p>
              <p><strong>上传时间：</strong>{formatDateTime(previewImage.created_at)}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProjectDetail;
