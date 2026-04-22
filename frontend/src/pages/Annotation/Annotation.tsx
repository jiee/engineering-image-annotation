import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Spin, message, List, Button, Empty, Tabs, TabPane } from 'antd';
import { 
  ArrowLeftOutlined, 
  PictureOutlined, 
  AimOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import AnnotationCanvas from '../../components/AnnotationCanvas/AnnotationCanvas';
import PropertyPanel from '../../components/PropertyPanel/PropertyPanel';
import Toolbar from '../../components/Toolbar/Toolbar';
import { useStore } from '../../store';
import { projectApi, imageApi, annotationApi } from '../../utils/api';
import { Image, Annotation } from '../../types';

const { Content, Sider } = Layout;

const AnnotationPage: React.FC = () => {
  const { projectId, imageId } = useParams<{ projectId: string; imageId: string }>();
  const navigate = useNavigate();
  
  const {
    setCurrentProject,
    setCurrentImage,
    annotations,
    setAnnotations,
    selectedAnnotation,
    setSelectedAnnotation,
    currentImage,
  } = useStore();
  
  const [loading, setLoading] = useState(true);

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      if (!projectId || !imageId) return;

      setLoading(true);
      try {
        // 加载项目信息
        const projectRes = await projectApi.getProject(projectId);
        setCurrentProject(projectRes.data);

        // 加载影像信息
        const imageRes = await imageApi.getImage(imageId);
        setCurrentImage(imageRes.data);

        // 加载标注列表
        const annotationsRes = await annotationApi.getAnnotationsByImage(imageId);
        setAnnotations(annotationsRes.data);
      } catch (error) {
        message.error('加载数据失败');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      setCurrentProject(null);
      setCurrentImage(null);
      setAnnotations([]);
      setSelectedAnnotation(null);
    };
  }, [projectId, imageId]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        marginLeft: 220 
      }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!currentImage) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        marginLeft: 220 
      }}>
        <Empty description="影像不存在" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', marginLeft: 220 }}>
      {/* 顶部导航 */}
      <div 
        style={{ 
          background: '#fff',
          padding: '12px 24px',
          borderBottom: '1px solid #e8e8e8',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(`/projects/${projectId}`)}
        >
          返回项目
        </Button>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 500 }}>{currentImage.original_name}</span>
        </div>
        <span style={{ color: '#999', fontSize: '12px' }}>
          {annotations.length} 个标注
        </span>
      </div>

      {/* 主内容区域 */}
      <Layout>
        <Content style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
          {/* 画布区域 */}
          <div style={{ flex: 1, position: 'relative' }}>
            {/* 工具栏 */}
            <div className="annotation-toolbar">
              <Toolbar />
            </div>
            
            {/* 标注画布 */}
            <AnnotationCanvas imageId={imageId!} />
          </div>

          {/* 右侧面板 */}
          <Sider 
            width={360}
            style={{ 
              background: '#fff',
              borderLeft: '1px solid #e8e8e8',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Tabs 
              defaultActiveKey="property"
              style={{ height: '100%' }}
              items={[
                {
                  key: 'property',
                  label: (
                    <span>
                      <AimOutlined /> 属性
                    </span>
                  ),
                  children: <PropertyPanel />,
                },
                {
                  key: 'list',
                  label: (
                    <span>
                      <UnorderedListOutlined /> 标注列表
                    </span>
                  ),
                  children: (
                    <AnnotationList 
                      annotations={annotations}
                      selectedId={selectedAnnotation?.id}
                      onSelect={setSelectedAnnotation}
                    />
                  ),
                },
              ]}
            />
          </Sider>
        </Content>
      </Layout>
    </Layout>
  );
};

// 标注列表组件
interface AnnotationListProps {
  annotations: Annotation[];
  selectedId?: string;
  onSelect: (annotation: Annotation | null) => void;
}

const AnnotationList: React.FC<AnnotationListProps> = ({ annotations, selectedId, onSelect }) => {
  const typeLabels: Record<string, string> = {
    point: '点',
    rectangle: '矩形',
    polygon: '多边形',
  };

  const statusColors: Record<string, string> = {
    '待处理': 'default',
    '进行中': 'processing',
    '已完成': 'success',
    '异常': 'error',
  };

  if (annotations.length === 0) {
    return (
      <Empty 
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="暂无标注"
        style={{ padding: '48px' }}
      />
    );
  }

  return (
    <List
      style={{ height: '100%', overflow: 'auto', padding: '8px' }}
      dataSource={annotations}
      renderItem={(annotation) => (
        <List.Item
          style={{
            marginBottom: '8px',
            padding: '12px',
            borderRadius: '6px',
            background: selectedId === annotation.id ? '#e6f7ff' : '#fafafa',
            border: `2px solid ${selectedId === annotation.id ? '#1890ff' : 'transparent'}`,
            cursor: 'pointer',
          }}
          onClick={() => onSelect(annotation)}
        >
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontWeight: 500 }}>
                {annotation.properties?.name || '未命名标注'}
              </span>
              <span style={{ fontSize: '12px', color: '#999' }}>
                {typeLabels[annotation.type]}
              </span>
              {annotation.properties?.status && (
                <span style={{ 
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: statusColors[annotation.properties.status] === 'success' ? '#f6ffed' :
                              statusColors[annotation.properties.status] === 'processing' ? '#e6f7ff' :
                              statusColors[annotation.properties.status] === 'error' ? '#fff2f0' : '#f0f0f0',
                  color: statusColors[annotation.properties.status] === 'success' ? '#52c41a' :
                         statusColors[annotation.properties.status] === 'processing' ? '#1890ff' :
                         statusColors[annotation.properties.status] === 'error' ? '#ff4d4f' : '#999',
                }}>
                  {annotation.properties.status}
                </span>
              )}
            </div>
            {annotation.properties?.description && (
              <div style={{ fontSize: '12px', color: '#999' }}>
                {annotation.properties.description}
              </div>
            )}
            {annotation.attachment_count !== undefined && annotation.attachment_count > 0 && (
              <div style={{ fontSize: '12px', color: '#1890ff', marginTop: '4px' }}>
                📎 {annotation.attachment_count} 个附件
              </div>
            )}
          </div>
        </List.Item>
      )}
    />
  );
};

export default AnnotationPage;
