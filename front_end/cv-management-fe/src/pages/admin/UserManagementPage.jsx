import React, { useState, useEffect, useMemo } from 'react';
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
  message,
  Popconfirm,
  Empty,
  Row,
  Col,
} from 'antd';
import {
  UserAddOutlined,
  LockOutlined,
  UnlockOutlined,
  UserOutlined,
  ReloadOutlined,
  SearchOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import adminApi from '../../api/adminApi';

const { Title, Text } = Typography;
const { Option } = Select;

const UserManagementPage = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Filters
  const [searchKeyword, setSearchKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

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

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;

      // Department filter
      if (departmentFilter !== 'ALL') {
        if (departmentFilter === 'UNASSIGNED') {
          if (u.departmentId || u.departmentName) return false;
        } else if (String(u.departmentId) !== String(departmentFilter) && u.departmentName !== departmentFilter) {
          return false;
        }
      }

      // Status filter
      if (statusFilter === 'ACTIVE' && !u.isActive) return false;
      if (statusFilter === 'INACTIVE' && u.isActive) return false;

      // Search keyword
      if (searchKeyword.trim()) {
        const lower = searchKeyword.toLowerCase().trim();
        const username = (u.username || '').toLowerCase();
        const fullName = (u.fullName || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const idStr = String(u.id || '');
        return username.includes(lower) || fullName.includes(lower) || email.includes(lower) || idStr.includes(lower);
      }

      return true;
    });
  }, [users, roleFilter, departmentFilter, statusFilter, searchKeyword]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const locked = users.filter((u) => !u.isActive).length;
    const totalDepts = departments.length;
    return { total, active, locked, totalDepts };
  }, [users, departments]);

  const getRoleTag = (role) => {
    switch (role) {
      case 'ADMIN':
        return <Tag color="blue">ADMIN</Tag>;
      case 'HR':
        return <Tag color="cyan">HR</Tag>;
      case 'TECH_LEAD':
        return <Tag color="geekblue">TECH LEAD</Tag>;
      case 'EMPLOYEE':
      default:
        return <Tag color="default">EMPLOYEE</Tag>;
    }
  };

  const columns = [
    {
      title: 'Mã User',
      dataIndex: 'id',
      key: 'id',
      width: 90,
      render: (id) => <Tag color="blue">#{id}</Tag>,
    },
    {
      title: 'Tài Khoản & Họ Tên',
      dataIndex: 'username',
      key: 'username',
      render: (username, record) => (
        <div>
          <Text strong style={{ color: '#1677ff', fontSize: 14 }}>
            {record.fullName || username}
          </Text>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            @{username} {record.email && `• ${record.email}`}
          </div>
        </div>
      ),
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
      width: 170,
      render: (deptName) => (
        deptName ? (
          <Space orientation="horizontal" size={4}>
            <ApartmentOutlined style={{ color: '#8c8c8c' }} />
            <span>{deptName}</span>
          </Space>
        ) : (
          <Text type="secondary" italic>Chưa gán</Text>
        )
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 130,
      render: (isActive) => (
        isActive ? (
          <Tag color="success">Hoạt Động</Tag>
        ) : (
          <Tag color="error">Đã Khóa</Tag>
        )
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Popconfirm
          title={record.isActive ? 'Khóa tài khoản này?' : 'Mở khóa tài khoản này?'}
          description={
            record.isActive
              ? 'Người dùng sẽ bị thu hồi quyền đăng nhập vào hệ thống.'
              : 'Người dùng sẽ có thể đăng nhập bình thường.'
          }
          onConfirm={() => handleToggleStatus(record)}
          okText={record.isActive ? 'Khóa' : 'Mở khóa'}
          cancelText="Hủy"
          okButtonProps={{ danger: record.isActive }}
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
            Admin — Quản Lý Tài Khoản Người Dùng
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Cấp tài khoản mới, phân quyền Vai trò (Role), gán Phòng ban và Quản lý trạng thái khóa/mở khóa.
          </Text>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchUsersAndDepartments} loading={loading}>
            Làm mới
          </Button>
          <Button type="primary" icon={<UserAddOutlined />} onClick={() => setCreateModalOpen(true)}>
            Tạo Tài Khoản Mới
          </Button>
        </Space>
      </div>

      {/* ─── Thanh Tóm Tắt Tình Trạng Tài Khoản (Thẻ Phẳng Gọn Gàng, Không Icon, Không Màu Sắc) ─── */}
      <Card
        bordered={false}
        style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 20 }}
        bodyStyle={{ padding: '16px 20px', background: '#f8fafc' }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={12} sm={6}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Tổng Số Tài Khoản</Text>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
              {stats.total} <span style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>tài khoản</span>
            </div>
            <Text type="secondary" style={{ fontSize: 11.5, display: 'block', marginTop: 2 }}>Đã đăng ký trong hệ thống</Text>
          </Col>
          <Col xs={12} sm={6}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Đang Hoạt Động</Text>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
              {stats.active} <span style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>tài khoản</span>
            </div>
            <Text type="secondary" style={{ fontSize: 11.5, display: 'block', marginTop: 2 }}>Đang mở khóa truy cập</Text>
          </Col>
          <Col xs={12} sm={6}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Đã Khóa</Text>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
              {stats.locked} <span style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>tài khoản</span>
            </div>
            <Text type="secondary" style={{ fontSize: 11.5, display: 'block', marginTop: 2 }}>Bị vô hiệu hóa truy cập</Text>
          </Col>
          <Col xs={12} sm={6}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Tổng Phòng Ban</Text>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
              {stats.totalDepts} <span style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>phòng ban</span>
            </div>
            <Text type="secondary" style={{ fontSize: 11.5, display: 'block', marginTop: 2 }}>Cơ cấu tổ chức hiện hữu</Text>
          </Col>
        </Row>
      </Card>

      {/* FILTER BAR */}
      <Card
        bordered={false}
        style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        bodyStyle={{ padding: '12px 16px' }}
      >
        <Row gutter={[16, 12]} align="middle" justify="space-between">
          <Col xs={24} md={18}>
            <Space wrap size="middle">
              <Input
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Tìm tên, username, email..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                allowClear
                style={{ width: 220 }}
              />

              <Select
                value={roleFilter}
                onChange={(val) => setRoleFilter(val)}
                style={{ width: 150 }}
              >
                <Option value="ALL">Tất cả vai trò</Option>
                <Option value="EMPLOYEE">EMPLOYEE</Option>
                <Option value="TECH_LEAD">TECH_LEAD</Option>
                <Option value="HR">HR</Option>
                <Option value="ADMIN">ADMIN</Option>
              </Select>

              {departments.length > 0 && (
                <Select
                  value={departmentFilter}
                  onChange={(val) => setDepartmentFilter(val)}
                  style={{ width: 180 }}
                >
                  <Option value="ALL">Tất cả phòng ban</Option>
                  {departments.map((dept) => (
                    <Option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </Option>
                  ))}
                  <Option value="UNASSIGNED">Chưa gán phòng ban</Option>
                </Select>
              )}

              <Select
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                style={{ width: 140 }}
              >
                <Option value="ALL">Tất cả trạng thái</Option>
                <Option value="ACTIVE">Hoạt Động</Option>
                <Option value="INACTIVE">Đã Khóa</Option>
              </Select>
            </Space>
          </Col>

          <Col xs={24} md={6} style={{ textAlign: 'right' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Hiển thị: <strong>{filteredUsers.length}</strong> / {users.length} tài khoản
            </Text>
          </Col>
        </Row>
      </Card>

      {/* TABLE */}
      <Card
        bordered={false}
        style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Tổng số ${total} tài khoản`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  searchKeyword || roleFilter !== 'ALL' || departmentFilter !== 'ALL' || statusFilter !== 'ALL'
                    ? 'Không tìm thấy người dùng phù hợp với bộ lọc.'
                    : 'Chưa có người dùng nào trong hệ thống.'
                }
              />
            ),
          }}
        />
      </Card>

      {/* MODAL TẠO TÀI KHOẢN MỚI */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserAddOutlined style={{ color: '#1677ff' }} />
            <span>Tạo Tài Khoản Người Dùng Mới</span>
          </div>
        }
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
        width={520}
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
            label="Mật Khẩu Khởi Tạo"
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập Mật khẩu!' },
              { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' },
            ]}
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
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Email không đúng định dạng!' },
            ]}
          >
            <Input placeholder="Ví dụ: nguyenvana@company.com" />
          </Form.Item>

          <Form.Item
            label="Vai Trò Trong Hệ Thống (Role)"
            name="role"
            rules={[{ required: true, message: 'Vui lòng chọn Vai trò!' }]}
          >
            <Select placeholder="Chọn Vai trò">
              <Option value="EMPLOYEE">Nhân Viên (EMPLOYEE)</Option>
              <Option value="TECH_LEAD">Trưởng Nhóm Kỹ Thuật (TECH_LEAD)</Option>
              <Option value="HR">Quản Trị Nhân Sự (HR)</Option>
              <Option value="ADMIN">Quản Trị Hệ Thống (ADMIN)</Option>
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
