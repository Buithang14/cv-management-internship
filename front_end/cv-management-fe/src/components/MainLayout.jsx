import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, Menu, Typography, Avatar, Tag, Dropdown, Badge, Button, Popover, Tooltip, Empty, List, Spin, Breadcrumb, message as antdMessage } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
  BankOutlined,
  SendOutlined,
  BellOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import EcmLogo from './common/EcmLogo';
import notificationApi from '../api/notificationApi';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

/**
 * Component Khung Giao Diện Doanh Nghiệp (MainLayout)
 * Tuân thủ chuẩn Enterprise Control Plane:
 * - Sider thu gọn / mở rộng linh hoạt
 * - Header hiển thị Page Title / Breadcrumb, chuông Notification Popover, thông tin User & Department
 * - Menu điều hướng bám sát 4 Role chuẩn: ADMIN, HR, TECH_LEAD, EMPLOYEE
 */
const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // ─── Notification State ───────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const pollingRef = useRef(null);
  // ─────────────────────────────────────────────────────────────

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role || 'EMPLOYEE';
  const displayName = (user.fullName || user.username || 'Tài khoản').replace(/\s*\(Employee\)/gi, '').trim();

  // ─── Notification API handlers ────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        notificationApi.getMyNotifications(),
        notificationApi.getUnreadCount(),
      ]);
      // axiosClient trả về response.data (= ApiResponse object)
      // ApiResponse có dạng { success: true, data: [...], message: '...' }
      setNotifications(listRes?.data || []);
      setUnreadCount(Number(countRes?.data) || 0);
    } catch (_) {
      // silent fail — không làm phiền user nếu backend chưa sẵn sàng
    }
  }, []);

  // Polling mỗi 30 giây
  useEffect(() => {
    fetchNotifications();
    pollingRef.current = setInterval(fetchNotifications, 30000);
    return () => clearInterval(pollingRef.current);
  }, [fetchNotifications]);

  const handleBellOpenChange = (open) => {
    setBellOpen(open);
    if (open) {
      setNotifLoading(true);
      fetchNotifications().finally(() => setNotifLoading(false));
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (_) {
      antdMessage.error('Không thể đánh dấu đã đọc');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (_) {
      antdMessage.error('Có lỗi xảy ra');
    }
  };
  // ─────────────────────────────────────────────────────────────

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getPageInfo = () => {
    const path = location.pathname;
    switch (path) {
      case '/my-cv':
        return { breadcrumb: ['Nhân Viên', 'CV Cá Nhân'] };
      case '/dashboard':
        return { breadcrumb: ['Tổng Quan'] };
      case '/techlead/evaluations':
        return { breadcrumb: ['Kỹ Thuật', 'Thẩm Định CV'] };
      case '/hr/cv-review':
        return { breadcrumb: ['Nhân Sự', 'Duyệt Chót CV'] };
      case '/hr/cv-list':
        return { breadcrumb: ['Nhân Sự', 'Danh Sách CV Toàn Công Ty'] };
      case '/hr/requests':
        return { breadcrumb: ['Nhân Sự', 'Yêu Cầu Cập Nhật'] };
      case '/admin/users':
        return { breadcrumb: ['Quản Trị', 'Người Dùng'] };
      case '/admin/departments':
        return { breadcrumb: ['Quản Trị', 'Phòng Ban'] };
      default:
        return { breadcrumb: ['Trang Chủ'] };
    }
  };

  const getMenuItems = () => {
    const items = [];

    // 1. Nếu là EMPLOYEE -> Trang chủ chính là CV Cá Nhân
    if (userRole === 'EMPLOYEE') {
      items.push({
        key: '/my-cv',
        icon: <FileTextOutlined />,
        label: 'CV Cá Nhân',
      });
    } else {
      // 2. Chỉ có HR, TECH LEAD, ADMIN mới cần Dashboard báo cáo tổng quan
      items.push({
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Tổng Quan',
      });
    }

    // Menu dành cho HR (Duyệt CV, Danh sách CV & Quản lý yêu cầu)
    if (userRole === 'HR') {
      items.push(
        {
          key: '/hr/cv-review',
          icon: <SolutionOutlined />,
          label: 'Phê Duyệt CV',
        },
        {
          key: '/hr/cv-list',
          icon: <FileTextOutlined />,
          label: 'Danh Sách CV',
        },
        {
          key: '/hr/requests',
          icon: <SendOutlined />,
          label: 'Yêu Cầu Cập Nhật',
        }
      );
    }

    // Menu dành cho TECH LEAD (Thẩm định chuyên môn)
    if (userRole === 'TECH_LEAD') {
      items.push({
        key: '/techlead/evaluations',
        icon: <SolutionOutlined />,
        label: 'Thẩm Định CV',
      });
    }

    // Menu dành cho ADMIN (Quản lý User & Phòng ban & Kho CV Toàn Doanh Nghiệp)
    if (userRole === 'ADMIN') {
      items.push(
        {
          key: '/hr/cv-list',
          icon: <FileTextOutlined />,
          label: 'Kho Hồ Sơ CV',
        },
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
        return <Tag color="blue" style={{ fontWeight: 600 }}>ADMIN</Tag>;
      case 'HR':
        return <Tag color="cyan" style={{ fontWeight: 600 }}>HR</Tag>;
      case 'TECH_LEAD':
        return <Tag color="orange" style={{ fontWeight: 600 }}>TECH LEAD</Tag>;
      case 'EMPLOYEE':
      default:
        return <Tag color="green" style={{ fontWeight: 600 }}>EMPLOYEE</Tag>;
    }
  };

  // ─── Notification Popover Content ─────────────────────────────
  const notificationContent = (
    <div style={{ width: 340, maxHeight: 440, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px 8px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <Text strong style={{ fontSize: 14 }}>Thông Báo Hệ Thống</Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Đã đọc tất cả'}
          </Text>
          {unreadCount > 0 && (
            <Button type="link" size="small" style={{ padding: 0, fontSize: 12 }} onClick={handleMarkAllAsRead}>
              Đọc tất cả
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {notifLoading ? (
          <div style={{ padding: 32, textAlign: 'center' }}><Spin /></div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: 24 }}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có thông báo nào" />
          </div>
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                style={{
                  padding: '10px 14px',
                  background: item.isRead ? '#fff' : '#f0f7ff',
                  cursor: item.isRead ? 'default' : 'pointer',
                  borderBottom: '1px solid #f5f5f5',
                  alignItems: 'flex-start',
                }}
                onClick={() => !item.isRead && handleMarkAsRead(item.id)}
              >
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <Text strong style={{ fontSize: 13, color: item.isRead ? '#595959' : '#1677ff' }}>
                      {item.title}
                    </Text>
                    {!item.isRead && (
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1677ff', flexShrink: 0, marginLeft: 6 }} />
                    )}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12, lineHeight: '1.4' }}>
                    {item.message}
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}
                    </Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
  // ─────────────────────────────────────────────────────────────


  const userDropdownItems = [
    {
      key: 'user_info',
      label: (
        <div style={{ padding: '4px 0' }}>
          <Text strong style={{ display: 'block', fontSize: 14 }}>{displayName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>Tài khoản: @{user.username}</Text>
          <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            {getRoleTag(userRole)}
            {user.departmentName && (
              <Tag icon={<BankOutlined />} color="default" style={{ fontSize: 11, margin: 0 }}>{user.departmentName}</Tag>
            )}
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất khỏi hệ thống',
      danger: true,
      onClick: handleLogout,
    },
  ];

  const pageInfo = getPageInfo();

  return (
    <Layout style={{ minHeight: '100vh', background: '#f4f6f8' }}>
      {/* ─── SIDEBAR DOANH NGHIỆP ─── */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={250}
        theme="light"
        style={{
          borderRight: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
          boxShadow: '1px 0 2px rgba(0,0,0,0.02)',
        }}
      >
        {/* Logo / Brand Header */}
        <div
          style={{
            height: 64,
            padding: collapsed ? '0 16px' : '0 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 12,
            borderBottom: '1px solid #e2e8f0',
            background: '#ffffff',
          }}
        >
          <EcmLogo size={36} />

          {!collapsed && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '0.4px',
                  lineHeight: 1.15,
                }}
              >
                ECM
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#475569',
                  letterSpacing: '-0.1px',
                  lineHeight: 1.25,
                  marginTop: 2,
                }}
              >
                Employee CV Management
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Menu */}
        <div style={{ padding: '8px 0' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={getMenuItems()}
            onClick={({ key }) => navigate(key)}
            style={{ borderRight: 0 }}
          />
        </div>
      </Sider>

      {/* ─── MAIN LAYOUT & TOPBAR ─── */}
      <Layout>
        {/* TOPBAR */}
        <Header
          style={{
            background: '#ffffff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e2e8f0',
            height: 64,
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          {/* Cụm Trái: Toggle Collapse + Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
            <Breadcrumb
              items={pageInfo.breadcrumb.map((item) => ({ title: item }))}
              style={{ fontSize: 13 }}
            />
          </div>

          {/* Cụm Phải: Notification + User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Chuông Thông báo Popover */}
            <Popover
              content={notificationContent}
              trigger="click"
              placement="bottomRight"
              open={bellOpen}
              onOpenChange={handleBellOpenChange}
            >
              <Badge count={unreadCount} size="small" offset={[-2, 2]} overflowCount={99}>
                <Button
                  type="text"
                  shape="circle"
                  icon={<BellOutlined style={{ fontSize: 17, color: '#475569' }} />}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                />
              </Badge>
            </Popover>

            {/* Menu Tài khoản cá nhân */}
            <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight" arrow>
              <div
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                }}
              >
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#1677ff' }}
                />
                <Text strong style={{ fontSize: 13, color: '#334155' }}>
                  {displayName}
                </Text>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* NỘI DUNG CHÍNH (CONTENT AREA) */}
        <Content style={{ margin: 20, minHeight: 320 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
