import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Typography,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Popconfirm,
  Empty,
} from 'antd';
import {
  UserAddOutlined,
  LockOutlined,
  UnlockOutlined,
  UserOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import adminApi from '../../api/adminApi';

const { Title, Text } = Typography;
const { Option } = Select;

const UserManagementPage = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Modal Create User
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchUsersAndDepartments = async () => {
    setLoading(true);
    try {
      const [usersRes, deptsRes] = await Promise.all([
        adminApi.getAllUsers(),
        adminApi.getAllDepartments(),
      ]);

      const usersList = usersRes?.data || usersRes?.result || usersRes || [];
      const deptsList = deptsRes?.data || deptsRes?.result || deptsRes || [];

      setUsers(Array.isArray(usersList) ? usersList : []);
      setDepartments(Array.isArray(deptsList) ? deptsList : []);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu người dùng/phòng ban:', error);
      message.error('Không thể lấy danh sách người dùng và phòng ban từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndDepartments();
  }, []);

  const handleCreateUser = async (values) => {
    setSubmitting(true);
    try {
      await adminApi.createUser(values);
      message.success('Đã tạo tài khoản người dùng thành công!');
      setCreateModalOpen(false);
      form.resetFields();
      fetchUsersAndDepartments();
    } catch (error) {
      console.error('Lỗi tạo tài khoản:', error);
      const errMsg = error.response?.data?.message || 'Tạo tài khoản thất bại!';
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (userRecord) => {
    const newStatus = !userRecord.isActive;
    try {
      await adminApi.updateUserStatus(userRecord.id, newStatus);
      message.success(newStatus ? 'Đã mở khóa tài khoản thành công!' : 'Đã khóa tài khoản thành công!');
      fetchUsersAndDepartments();
    } catch (error) {
      console.error('Lỗi đổi trạng thái tài khoản:', error);
      const errMsg = error.response?.data?.message || 'Không thể đổi trạng thái tài khoản!';
      message.error(errMsg);
    }
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

  const columns = [
    {
      title: 'Mã User',
      dataIndex: 'id',
      key: 'id',
      width: 90,
      render: (id) => <Text strong>#{id}</Text>,
    },
    {
      title: 'Tên Đăng Nhập',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <Text strong style={{ color: '#1677ff' }}>{text}</Text>,
    },
    {
      title: 'Họ Và Tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai Trò (Role)',
      dataIndex: 'role',
      key: 'role',
      width: 140,
      render: (role) => getRoleTag(role),
    },
    {
      title: 'Phòng Ban',
      dataIndex: 'departmentName',
      key: 'departmentName',
      render: (deptName) => deptName || 'Chưa gán',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 140,
      render: (isActive) => (
        isActive ? (
          <Tag color="success">Hoạt Động</Tag>
        ) : (
          <Tag color="error">Đã Khóa</Tag>
        )
      ),
    },
    {
      title: 'Hành Động',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Popconfirm
          title={record.isActive ? 'Khóa tài khoản này?' : 'Mở khóa tài khoản này?'}
          description={record.isActive ? 'Người dùng sẽ không thể đăng nhập vào hệ thống.' : 'Người dùng có thể đăng nhập lại.'}
          onConfirm={() => handleToggleStatus(record)}
          okText="Đồng ý"
          cancelText="Hủy"
        >
          <Button
            size="small"
            danger={record.isActive}
            icon={record.isActive ? <LockOutlined /> : <UnlockOutlined />}
          >
            {record.isActive ? 'Khóa TK' : 'Mở Khóa'}
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      {/* HEADER & THAO TÁC */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Admin — Quản Lý Tài Khoản Người Dùng</Title>
          <Text type="secondary">Cấp tài khoản mới, phân quyền Vai trò (Role), gán Phòng ban và Quản lý trạng thái khóa/mở khóa.</Text>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchUsersAndDepartments}>Tải Lại</Button>
          <Button type="primary" icon={<UserAddOutlined />} onClick={() => setCreateModalOpen(true)}>
            Tạo Tài Khoản Mới
          </Button>
        </Space>
      </div>

      {/* BẢNG DANH SÁCH USER */}
      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description="Chưa có người dùng nào." /> }}
        />
      </Card>

      {/* MODAL TẠO TÀI KHOẢN MỚI */}
      <Modal
        title="Tạo Tài Khoản Người Dùng Mới (Admin)"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateUser} style={{ marginTop: 16 }}>
          <Form.Item
            label="Tên Đăng Nhập (Username)"
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập Username!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Ví dụ: employee2" />
          </Form.Item>

          <Form.Item
            label="Mật Khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }, { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu (Tối thiểu 6 ký tự)" />
          </Form.Item>

          <Form.Item
            label="Họ Và Tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập Họ tên!' }]}
          >
            <Input placeholder="Ví dụ: Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            label="Địa Chỉ Email"
            name="email"
            rules={[{ required: true, message: 'Vui lòng nhập Email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}
          >
            <Input placeholder="Ví dụ: nguyenvana@company.com" />
          </Form.Item>

          <Form.Item
            label="Vai Trò Trong Hệ Thống (Role)"
            name="role"
            rules={[{ required: true, message: 'Vui lòng chọn Vai trò!' }]}
          >
            <Select placeholder="Chọn Vai trò">
              <Option value="EMPLOYEE">EMPLOYEE — Nhân Viên</Option>
              <Option value="TECH_LEAD">TECH_LEAD — Trưởng Nhóm Kỹ Thuật (Duyệt Trạm 1)</Option>
              <Option value="HR">HR — Quản Trị Nhân Sự (Duyệt Trạm 2 & Master Dashboard)</Option>
              <Option value="ADMIN">ADMIN — Quản Trị Hệ Thống</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Phòng Ban Trực Thuộc"
            name="departmentId"
            rules={[{ required: true, message: 'Vui lòng chọn Phòng ban!' }]}
          >
            <Select placeholder="Chọn Phòng Ban">
              {departments.map((dept) => (
                <Option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setCreateModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" icon={<UserAddOutlined />} loading={submitting}>
                Tạo Tài Khoản
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
