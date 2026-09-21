import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await authApi.login(values);
      const resData = response.data || response.result || response;
      const token = resData.accessToken || resData.token;
      const backendUser = resData.user || resData;

      const user = {
        userId: backendUser.id || backendUser.userId,
        username: backendUser.username || values.username,
        fullName: backendUser.fullName || '',
        role: backendUser.role || 'EMPLOYEE',
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      message.success(`Đăng nhập thành công! Chào mừng ${user.username}`);

      // Tối ưu UX: Nếu là Nhân viên (EMPLOYEE) -> Chuyển thẳng tới trang CV Cá Nhân /my-cv
      if (user.role === 'EMPLOYEE' || user.role === 'USER' || user.role === 'INTERN') {
        navigate('/my-cv');
      } else {
        // HR, TECH_LEAD, ADMIN -> Vào Dashboard tổng quan
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      const errorMsg = error.response?.data?.message || 'Đăng nhập thất bại! Vui lòng kiểm tra tài khoản/mật khẩu.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5'
    }}>
      <Card 
        style={{ width: 400, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', borderRadius: 6 }}
        bordered={true}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, color: '#1677ff' }}>
            CV MANAGEMENT SYSTEM
          </Title>
          <Text type="secondary">Hệ thống Quản lý & Phê duyệt CV Nội bộ</Text>
        </div>

        <Form
          name="login_form"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Tài khoản"
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản!' }]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} 
              placeholder="Nhập tên tài khoản" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} 
              placeholder="Nhập mật khẩu" 
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large"
              loading={loading}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
