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
  message,
  Empty,
} from 'antd';
import {
  BankOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import adminApi from '../../api/adminApi';

const { Title, Text } = Typography;

const DepartmentManagementPage = () => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  // Modal Create Department
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAllDepartments();
      const list = response.data || response.result || response || [];
      setDepartments(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách phòng ban:', error);
      message.error('Không thể lấy danh sách phòng ban từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateDepartment = async (values) => {
    setSubmitting(true);
    try {
      await adminApi.createDepartment(values);
      message.success('Đã thêm mới phòng ban thành công!');
      setCreateModalOpen(false);
      form.resetFields();
      fetchDepartments();
    } catch (error) {
      console.error('Lỗi tạo phòng ban:', error);
      const errMsg = error.response?.data?.message || 'Tạo phòng ban thất bại!';
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Mã ID',
      dataIndex: 'id',
      key: 'id',
      width: 90,
      render: (id) => <Text strong>#{id}</Text>,
    },
    {
      title: 'Mã Phòng Ban (Code)',
      dataIndex: 'code',
      key: 'code',
      width: 200,
      render: (code) => <Tag color="blue" style={{ fontSize: 13, padding: '2px 10px' }}>{code}</Tag>,
    },
    {
      title: 'Tên Phòng Ban',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Text strong style={{ fontSize: 15 }}>{name}</Text>,
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => (date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'),
    },
  ];

  return (
    <div>
      {/* HEADER & THAO TÁC */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Admin — Quản Lý Danh Mục Phòng Ban</Title>
          <Text type="secondary">Quản lý các phòng ban trực thuộc công ty dùng cho việc phân quyền nhân sự và xét duyệt CV.</Text>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchDepartments}>Tải Lại</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            Thêm Phòng Ban Mới
          </Button>
        </Space>
      </div>

      {/* BẢNG DANH SÁCH PHÒNG BAN */}
      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table
          columns={columns}
          dataSource={departments}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description="Chưa có phòng ban nào." /> }}
        />
      </Card>

      {/* MODAL TẠO PHÒNG BAN MỚI */}
      <Modal
        title="Thêm Phòng Ban Mới (Admin)"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateDepartment} style={{ marginTop: 16 }}>
          <Form.Item
            label="Mã Phòng Ban (Code)"
            name="code"
            rules={[{ required: true, message: 'Vui lòng nhập Mã phòng ban!' }]}
            help="Viết hoa không dấu (Ví dụ: IT, HR, MKT, FIN)"
          >
            <Input prefix={<BankOutlined />} placeholder="Ví dụ: MKT" />
          </Form.Item>

          <Form.Item
            label="Tên Phòng Ban"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập Tên phòng ban!' }]}
          >
            <Input placeholder="Ví dụ: Phòng Marketing & Truyền Thông" />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setCreateModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={submitting}>
                Tạo Phòng Ban
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DepartmentManagementPage;
