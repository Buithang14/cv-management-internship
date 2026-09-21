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
  // state loading: Kích hoạt trạng thái xoay vòng Spinner trên nút bấm khi chờ API trả về
  const [loading, setLoading] = useState(false);
  
  // navigate: Dùng để chuyển hướng trang (tương tự response.sendRedirect trong Java Servlet)
  const navigate = useNavigate();

  /**
   * Hàm xử lý khi người dùng bấm "Đăng nhập" và dữ liệu Form hợp lệ
   * @param {Object} values - Đối tượng chứa dữ liệu { username, password }
   */
  const onFinish = async (values) => {
    setLoading(true); // Bắt đầu xoay Spinner
    try {
      // 1. Gọi API login tới Spring Boot
      const response = await authApi.login(values);
      
      // 2. Lấy dữ liệu kết quả từ ApiResponse của Spring Boot
      const data = response.result || response.data || response;
      const token = data.token || data.accessToken;
      const user = {
        userId: data.userId || data.id,
        username: data.username || values.username,
        role: data.role || data.roles,
      };

      // 3. Lưu Token và thông tin User vào localStorage của trình duyệt
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // 4. Hiển thị thông báo thành công dạng Pop-up Toast
      message.success('Đăng nhập thành công!');

      // 5. Chuyển hướng tới trang Dashboard chính
      navigate('/dashboard');
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      // Hiển thị thông báo lỗi chi tiết từ GlobalExceptionHandler của Spring Boot nếu có
      const errorMsg = error.response?.data?.message || 'Đăng nhập thất bại! Vui lòng kiểm tra tài khoản/mật khẩu.';
      message.error(errorMsg);
    } finally {
      setLoading(false); // Tắt Spinner
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5' // Màu nền xám trung tính chuẩn Enterprise
    }}>
      <Card 
        style={{ width: 400, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', borderRadius: 6 }}
        bordered={true}
      >
        {/* Tiêu đề ứng dụng */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, color: '#1677ff' }}>
            CV MANAGEMENT SYSTEM
          </Title>
          <Text type="secondary">Hệ thống Quản lý & Phê duyệt CV Nội bộ</Text>
        </div>

        {/* Form Đăng nhập của Ant Design */}
        <Form
          name="login_form"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          {/* Ô nhập Tài khoản */}
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

          {/* Ô nhập Mật khẩu */}
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

          {/* Nút bấm Submit Form */}
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
