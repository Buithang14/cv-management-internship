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
 * Tuân thủ quy tắc nguyenTacDesign.txt: Tối giản, thanh lịch, phân quyền rõ ràng theo UserRole (ADMIN, HR, TECH_LEAD, EMPLOYEE)
 */
const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Đọc thông tin User từ localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role || 'EMPLOYEE';

  // Xử lý Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Danh sách Menu điều hướng bên trái dựa vào Role của người dùng
  const getMenuItems = () => {
    const items = [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
      },
    ];

    // Menu dành cho EMPLOYEE / USER / INTERN (Xem CV cá nhân & Yêu cầu cập nhật)
    if (userRole === 'EMPLOYEE' || userRole === 'USER' || userRole === 'INTERN') {
      items.push(
        {
          key: '/my-cv',
          icon: <FileTextOutlined />,
          label: 'CV Cá Nhân',
        }
      );
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

  // Nhãn Badge đại diện cho từng Role
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

  // Menu Dropdown góc phải khi click vào User
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
      {/* 1. LEFT SIDEBAR */}
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

      {/* 2. KHUNG NỘI DUNG CHÍNH */}
      <Layout>
        {/* TOP BAR */}
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

        {/* MAIN CONTENT AREA */}
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 6, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
