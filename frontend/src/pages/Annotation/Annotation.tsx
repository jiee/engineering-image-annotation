import React, { useState } from 'react';
import { Layout, Tabs } from 'antd';
import { TagsOutlined, FileImageOutlined } from '@ant-design/icons';
import Sidebar from '../../components/Sidebar/Sidebar';
import Toolbar from '../../components/Toolbar/Toolbar';
import ImageViewer from '../../components/ImageViewer/ImageViewer';
import AnnotationCanvas from '../../components/AnnotationCanvas/AnnotationCanvas';
import PropertyPanel from '../../components/PropertyPanel/PropertyPanel';

const { Sider, Content } = Layout;

const Annotation: React.FC = () => {
  const [activeTool, setActiveTool] = useState('select');

  const items = [
    {
      key: 'images',
      label: '影像列表',
      icon: <FileImageOutlined />,
      children: <Sidebar />,
    },
    {
      key: 'annotations',
      label: '标注列表',
      icon: <TagsOutlined />,
      children: <div>标注列表</div>,
    },
  ];

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider width={250} theme="light">
        <Tabs defaultActiveKey="images" items={items} />
      </Sider>
      <Layout>
        <Toolbar activeTool={activeTool} onToolChange={setActiveTool} />
        <Content style={{ position: 'relative' }}>
          <ImageViewer>
            <AnnotationCanvas activeTool={activeTool} />
          </ImageViewer>
        </Content>
      </Layout>
      <Sider width={300} theme="light">
        <PropertyPanel />
      </Sider>
    </Layout>
  );
};

export default Annotation;
