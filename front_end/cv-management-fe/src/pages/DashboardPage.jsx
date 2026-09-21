import React from 'react';
import { Button, Card, Typography, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

/**
 * Trang Dashboard tạm thời để kiểm tra luồng Đăng nhập thành công
 */
const DashboardPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ padding: 40, maxWidth: 800, margin: '0 auto' }}>
      <Card bordered={true}>
        <Result
          status="success"
          title="Chào mừng bạn đến với CV Management System!"
          subTitle={`Xin chào ${user.username || 'User'} (Quyền: ${user.role || 'N/A'})`}
          extra={[
            <Button type="primary" key="logout" danger onClick={handleLogout}>
              Đăng xuất
            </Button>
          ]}
        />
      </Card>
    </div>
  );
};

export default DashboardPage;
