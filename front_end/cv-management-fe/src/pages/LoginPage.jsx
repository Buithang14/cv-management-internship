import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';

const { Title, Text } = Typography;

/**
 * Component Trang Đăng Nhập (LoginPage)
 * Phong cách Enterprise: Tối giản, rõ ràng, không màu mè gradient.
 */
const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Hàm xử lý khi người dùng bấm "Đăng nhập"
   * @param {Object} values - Đối tượng chứa { username, password }
   */
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 1. Gọi API login tới Spring Boot: POST /api/v1/auth/login
      const response = await authApi.login(values);
      
      // 2. Bóc tách dữ liệu chuẩn từ ApiResponse<LoginResponse> của Spring Boot:
      // ApiResponse = { success: true, message: "...", data: { accessToken: "...", user: { id, username, role... } } }
      const resData = response.data || response.result || response;
      const token = resData.accessToken || resData.token;
      
      // Bóc tách object user nằm bên trong LoginResponse
      const backendUser = resData.user || resData;

      const user = {
        userId: backendUser.id || backendUser.userId,
        username: backendUser.username || values.username,
        fullName: backendUser.fullName || '',
        role: backendUser.role || 'USER', // ADMIN, HR, TECH_LEAD, USER
      };

      // 3. Lưu Token và thông tin User chuẩn vào localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // 4. Thông báo thành công
      message.success(`Đăng nhập thành công! Chào mừng ${user.username} (${user.role})`);

      // 5. Chuyển hướng sang trang Dashboard
      navigate('/dashboard');
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
              placeholder="Nhập tên tài khoản (admin, hr_admin, tech_lead, user1...)" 
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
