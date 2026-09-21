import React from 'react';
import { Layout, Menu, Typography, Avatar, Tag, Dropdown } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

/**
 * Component Khung Giao Diện Doanh Nghiệp (MainLayout)
 * Đã tối ưu UX: Với EMPLOYEE không cần trang Dashboard thừa thãi, dùng /my-cv làm trang chính
 */
const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role || 'EMPLOYEE';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getMenuItems = () => {
    const items = [];

    // 1. Nếu là EMPLOYEE / INTERN -> Trang chủ chính là CV Cá Nhân (Không dùng Dashboard thừa thãi)
    if (userRole === 'EMPLOYEE' || userRole === 'USER' || userRole === 'INTERN') {
      items.push(
        {
          key: '/my-cv',
          icon: <FileTextOutlined />,
          label: 'CV Cá Nhân',
        }
      );
    } else {
      // 2. Chỉ có HR, TECH LEAD, ADMIN mới cần Dashboard báo cáo tổng quan
      items.push({
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard Tổng Quan',
      });
    }

    // Menu dành cho HR (Duyệt CV & Quản lý danh sách CV)
    if (userRole === 'HR' || userRole === 'ADMIN') {
      items.push(
        {
          key: '/hr/cv-review',
          icon: <SolutionOutlined />,
          label: 'HR Duyệt CV',
        },
        {
          key: '/hr/cv-list',
          icon: <FileTextOutlined />,
          label: 'Danh Sách CV HR',
        }
      );
    }

    // Menu dành cho TECH LEAD (Đánh giá chuyên môn)
    if (userRole === 'TECH_LEAD' || userRole === 'ADMIN') {
      items.push({
        key: '/techlead/evaluations',
        icon: <SolutionOutlined />,
        label: 'Tech Lead Đánh Giá',
      });
    }

    // Menu dành cho ADMIN (Quản lý User & Phòng ban)
    if (userRole === 'ADMIN') {
      items.push(
        {
          key: '/admin/users',
          icon: <TeamOutlined />,
          label: 'Quản Lý Người Dùng',
        },
        {
          key: '/admin/departments',
          icon: <BankOutlined />,
          label: 'Quản Lý Phòng Ban',
        }
      );
    }

    return items;
  };

  const getRoleTag = (role) => {
    switch (role) {
      case 'ADMIN':
        return <Tag color="geekblue">ADMIN</Tag>;
      case 'HR':
        return <Tag color="magenta">HR</Tag>;
      case 'TECH_LEAD':
        return <Tag color="purple">TECH LEAD</Tag>;
      case 'EMPLOYEE':
      default:
        return <Tag color="blue">EMPLOYEE</Tag>;
    }
  };

  const userDropdownItems = [
    {
      key: 'username',
      label: <Text strong>{user.username || 'User'}</Text>,
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={240} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '16px 24px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>
          <Text strong style={{ fontSize: 16, color: '#1677ff', letterSpacing: 0.5 }}>
            CV MANAGEMENT
          </Text>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, marginTop: 8 }}
        />
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <div>
            <Text type="secondary">Hệ thống Quản lý & Phê duyệt CV Nội bộ</Text>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {getRoleTag(userRole)}
            <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                <Text>{user.username || 'Tài khoản'}</Text>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 6, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
