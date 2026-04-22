import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ProjectOutlined,
  FolderOutlined,
  SettingOutlined,
  DashboardOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: '项目列表',
    },
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '数据看板',
      disabled: true,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      disabled: true,
    },
  ];

  return (
    <Sider
      width={220}
      style={{
        background: '#001529',
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <FolderOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '8px' }} />
        <span style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>影像标注系统</span>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => {
          if (key !== '/dashboard' && key !== '/settings') {
            navigate(key);
          }
        }}
        style={{ borderRight: 0, marginTop: '8px' }}
      />
    </Sider>
  );
};

export default Sidebar;
