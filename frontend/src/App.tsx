import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import ProjectList from './pages/ProjectList/ProjectList';
import ProjectDetail from './pages/ProjectDetail/ProjectDetail';
import Annotation from './pages/Annotation/Annotation';
import Sidebar from './components/Sidebar/Sidebar';

const { Header, Content } = Layout;

function App() {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar />
        <Layout>
          <Header style={{ 
            background: '#001529', 
            color: '#fff',
            fontSize: '18px',
            fontWeight: 'bold',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center'
          }}>
            🏗️ 工程现场影像智能标注与关联系统
          </Header>
          <Content style={{ padding: '24px', background: '#f0f2f5' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/projects" replace />} />
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/projects/:projectId" element={<ProjectDetail />} />
              <Route path="/projects/:projectId/images/:imageId" element={<Annotation />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
