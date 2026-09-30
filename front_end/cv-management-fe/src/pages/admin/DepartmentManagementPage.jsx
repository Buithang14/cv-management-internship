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
  message,
  Empty,
  Row,
  Col,
} from 'antd';
import {
  BankOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import adminApi from '../../api/adminApi';

const { Title, Text } = Typography;

const DepartmentManagementPage = () => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Modal Create Department
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAllDepartments();
      const list = response?.data || response?.result || response || [];
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

  const filteredDepartments = useMemo(() => {
    if (!searchKeyword.trim()) return departments;
    const lower = searchKeyword.toLowerCase().trim();
    return departments.filter((d) => {
      const name = (d.name || '').toLowerCase();
      const code = (d.code || '').toLowerCase();
      const idStr = String(d.id || '');
      return name.includes(lower) || code.includes(lower) || idStr.includes(lower);
    });
  }, [departments, searchKeyword]);

  const columns = [
    {
      title: 'Mã ID',
      dataIndex: 'id',
      key: 'id',
      width: 90,
      render: (id) => <Tag color="blue">#{id}</Tag>,
    },
    {
      title: 'Mã Phòng Ban (Code)',
      dataIndex: 'code',
      key: 'code',
      width: 220,
      render: (code) => (
        <Tag color="geekblue" style={{ fontSize: 13, padding: '2px 10px', fontWeight: 600 }}>
          {code}
        </Tag>
      ),
    },
    {
      title: 'Tên Phòng Ban',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Text strong style={{ fontSize: 14 }}>{name}</Text>,
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
            Admin — Quản Lý Danh Mục Phòng Ban
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Quản lý các phòng ban trực thuộc công ty dùng cho việc phân quyền nhân sự và xét duyệt CV.
          </Text>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchDepartments} loading={loading}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            Thêm Phòng Ban Mới
          </Button>
        </Space>
      </div>

      {/* ─── Thanh Tóm Tắt Phòng Ban (Thẻ Phẳng Gọn Gàng, Không Icon, Không Màu Sắc) ─── */}
      <Card
        bordered={false}
        style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 20 }}
        bodyStyle={{ padding: '16px 20px', background: '#f8fafc' }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Tổng Số Phòng Ban</Text>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
              {departments.length} <span style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>phòng ban</span>
            </div>
            <Text type="secondary" style={{ fontSize: 11.5, display: 'block', marginTop: 2 }}>Đang hoạt động trong cơ cấu tổ chức</Text>
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
          <Col xs={24} sm={12}>
            <Input
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Tìm theo tên phòng ban, mã code..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
              style={{ maxWidth: 300 }}
            />
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Hiển thị: <strong>{filteredDepartments.length}</strong> / {departments.length} phòng ban
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
          dataSource={filteredDepartments}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Tổng số ${total} phòng ban`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  searchKeyword
                    ? 'Không tìm thấy phòng ban phù hợp.'
                    : 'Chưa có phòng ban nào trong hệ thống.'
                }
              />
            ),
          }}
        />
      </Card>

      {/* MODAL TẠO PHÒNG BAN MỚI */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BankOutlined style={{ color: '#1677ff' }} />
            <span>Thêm Phòng Ban Mới</span>
          </div>
        }
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
        width={480}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateDepartment} style={{ marginTop: 16 }}>
          <Form.Item
            label="Mã Phòng Ban (Code)"
            name="code"
            rules={[{ required: true, message: 'Vui lòng nhập Mã phòng ban!' }]}
            help="Viết hoa không dấu (Ví dụ: IT, HR, MKT, FIN, QA)"
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
