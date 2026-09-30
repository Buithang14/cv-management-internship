import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';
import EcmLogo from '../components/common/EcmLogo';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
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
        fullName: (backendUser.fullName || '').replace(/\s*\(Employee\)/gi, '').trim(),
        email: backendUser.email || '',
        role: backendUser.role || 'EMPLOYEE',
        departmentId: backendUser.departmentId || null,
        departmentName: backendUser.departmentName || '',
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      message.success(`Đăng nhập thành công! Chào mừng ${user.fullName || user.username}`);

      // Tối ưu UX theo Role
      if (user.role === 'EMPLOYEE') {
        navigate('/my-cv');
      } else if (user.role === 'TECH_LEAD') {
        navigate('/techlead/evaluations');
      } else if (user.role === 'HR') {
        navigate('/hr/cv-review');
      } else if (user.role === 'ADMIN') {
        navigate('/admin/users');
      } else {
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f4f6f8',
        padding: 16,
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)',
          borderRadius: 8,
          borderColor: '#e2e8f0',
        }}
        bordered={true}
      >
        {/* Logo & Tiêu đề hệ thống */}
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <EcmLogo size={40} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', lineHeight: 1.15, letterSpacing: '0.3px' }}>
                ECM
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', lineHeight: 1.25, marginTop: 2 }}>
                Employee CV Management
              </div>
            </div>
          </div>

          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a', letterSpacing: -0.3 }}>
            Đăng nhập
          </h2>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 4 }}>
            Hệ thống Quản lý & Phê duyệt CV Doanh nghiệp
          </Text>
        </div>

        {/* Biểu mẫu đăng nhập */}
        <Form
          form={form}
          name="login_form"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark={false}
        >
          <Form.Item
            label={<Text strong style={{ fontSize: 13, color: '#334155' }}>Tên đăng nhập</Text>}
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản!' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Ví dụ: thangbui, hr, techlead..."
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={<Text strong style={{ fontSize: 13, color: '#334155' }}>Mật khẩu</Text>}
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Nhập mật khẩu truy cập"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{ fontWeight: 600, height: 42 }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

      </Card>

      {/* Footer bản quyền nội bộ */}
      <Text type="secondary" style={{ marginTop: 24, fontSize: 12, color: '#94a3b8' }}>
        ECM - Employee CV Management &copy; 2026. All rights reserved.
      </Text>
    </div>
  );
};

export default LoginPage;
