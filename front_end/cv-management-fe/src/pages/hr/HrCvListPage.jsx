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
  DatePicker,
  message,
  Divider,
  Row,
  Col,
  Empty,
  Statistic,
} from 'antd';
import {
  SendOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileDoneOutlined,
  CheckOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import hrApi from '../../api/hrApi';
import adminApi from '../../api/adminApi';

// Sub-components CV 2 cột
import CvHeader from '../../components/cv/CvHeader';
import PersonalInfoSection from '../../components/cv/PersonalInfoSection';
import EducationSection from '../../components/cv/EducationSection';
import ExperienceSection from '../../components/cv/ExperienceSection';
import SkillsSection from '../../components/cv/SkillsSection';
import ObjectiveSection from '../../components/cv/ObjectiveSection';

const { Title, Text } = Typography;
const { Option } = Select;

const HrCvListPage = () => {
  const [loading, setLoading] = useState(false);
  const [cvList, setCvList] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Filters
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Modal Request Creation
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Modal Preview CV
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedCv, setSelectedCv] = useState(null);

  const fetchDepartments = async () => {
    try {
      const res = await adminApi.getAllDepartments();
      const list = res.data || res.result || res || [];
      setDepartments(Array.isArray(list) ? list : []);
    } catch {
      // HR might not have permission or departments empty, fallback silently
      setDepartments([]);
    }
  };

  const fetchAllCvs = async () => {
    setLoading(true);
    try {
      const response = await hrApi.getAllCvs(selectedDepartment, statusFilter);
      const list = response.data || response.result || response || [];
      setCvList(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách CV Master Dashboard:', error);
      message.error('Không thể lấy danh sách CV toàn công ty.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchAllCvs();
  }, [selectedDepartment, statusFilter]);

  const filteredCvs = useMemo(() => {
    if (!searchKeyword.trim()) return cvList;
    const lower = searchKeyword.toLowerCase().trim();
    return cvList.filter((cv) => {
      const name = (cv.fullName || cv.userFullName || '').toLowerCase();
      const phone = (cv.phone || '').toLowerCase();
      const idStr = String(cv.id || '');
      const summary = (cv.summary || cv.objective || '').toLowerCase();
      return name.includes(lower) || phone.includes(lower) || idStr.includes(lower) || summary.includes(lower);
    });
  }, [cvList, searchKeyword]);

  // Statistics
  const stats = useMemo(() => {
    const total = cvList.length;
    const updated = cvList.filter((c) => c.overallStatus === 'UPDATED').length;
    const notUpdated = cvList.filter((c) => c.overallStatus === 'NOT_UPDATED').length;
    const canceled = cvList.filter((c) => c.overallStatus === 'REQUEST_CANCELED').length;
    return { total, updated, notUpdated, canceled };
  }, [cvList]);

  const handleOpenPreview = (record) => {
    setSelectedCv(record);
    setPreviewModalOpen(true);
  };

  const handleCreateRequest = async (values) => {
    setRequestSubmitting(true);
    try {
      const payload = {
        batchName: values.batchName,
        deadline: values.deadline ? values.deadline.format('YYYY-MM-DDTHH:mm:ss') : null,
        targetUserIds: values.targetUserIds
          ? values.targetUserIds
              .split(',')
              .map((id) => parseInt(id.trim(), 10))
              .filter((n) => !isNaN(n))
          : [],
      };

      await hrApi.createUpdateRequests(payload);
      message.success('Đã phát lệnh yêu cầu cập nhật CV tới nhân viên thành công!');
      setRequestModalOpen(false);
      form.resetFields();
      fetchAllCvs();
    } catch (error) {
      console.error('Lỗi khi tạo yêu cầu cập nhật CV:', error);
      const errMsg = error.response?.data?.message || 'Tạo yêu cầu cập nhật CV thất bại!';
      message.error(errMsg);
    } finally {
      setRequestSubmitting(false);
    }
  };

  const renderOverallStatus = (status) => {
    switch (status) {
      case 'UPDATED':
        return <Tag icon={<CheckCircleOutlined />} color="success">Đã Cập Nhật (Active)</Tag>;
      case 'NOT_UPDATED':
        return <Tag icon={<ExclamationCircleOutlined />} color="error">Chưa Cập Nhật (Cần Sửa)</Tag>;
      case 'REQUEST_CANCELED':
        return <Tag icon={<CloseCircleOutlined />} color="default">Đã Hủy Yêu Cầu</Tag>;
      default:
        return <Tag color="default">{status || 'Chưa cập nhật'}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Mã CV',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id) => <Tag color="blue">#CV-{id}</Tag>,
    },
    {
      title: 'Họ Và Tên Nhân Viên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name, record) => (
        <div>
          <Text strong style={{ color: '#1677ff', fontSize: 14 }}>
            {name || record.userFullName || 'Chưa cập nhật'}
          </Text>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            User ID: #{record.userId}
            {record.phone && ` • SĐT: ${record.phone}`}
          </div>
        </div>
      ),
    },
    {
      title: 'Phiên Bản',
      dataIndex: 'version',
      key: 'version',
      width: 110,
      render: (ver) => <Tag color="cyan">v{ver || 1}</Tag>,
    },
    {
      title: 'Trạng Thái CV',
      dataIndex: 'overallStatus',
      key: 'overallStatus',
      width: 190,
      render: (status) => renderOverallStatus(status),
    },
    {
      title: 'Tóm Tắt Vị Trí / Mục Tiêu',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
      render: (summary, record) => (
        <span title={summary || record.objective || ''}>
          {summary || record.objective || <Text type="secondary">Chưa cập nhật</Text>}
        </span>
      ),
    },
    {
      title: 'Ngày Cập Nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (date) => (date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'),
    },
    {
      title: 'Hành Động',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => handleOpenPreview(record)}>
          Xem CV
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* HEADER & ACTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
            Danh Sách CV Toàn Công Ty
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Quản lý hồ sơ CV chính thức đang hoạt động và phát động các đợt cập nhật định kỳ.
          </Text>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchAllCvs} loading={loading}>
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => setRequestModalOpen(true)}
          >
            Phát Lệnh Cập Nhật CV
          </Button>
        </Space>
      </div>

      {/* STATISTIC SUMMARY CARDS */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: 16 }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: '#8c8c8c' }}>Tổng CV Hoạt Động</span>}
              value={stats.total}
              valueStyle={{ fontSize: 22, fontWeight: 600, color: '#1677ff' }}
              prefix={<FileDoneOutlined style={{ fontSize: 18, marginRight: 6 }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: 16 }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: '#8c8c8c' }}>Đã Cập Nhật (Active)</span>}
              value={stats.updated}
              valueStyle={{ fontSize: 22, fontWeight: 600, color: '#16a34a' }}
              prefix={<CheckOutlined style={{ fontSize: 18, marginRight: 6 }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: 16 }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: '#8c8c8c' }}>Chưa Cập Nhật (Cần Sửa)</span>}
              value={stats.notUpdated}
              valueStyle={{ fontSize: 22, fontWeight: 600, color: '#fa8c16' }}
              prefix={<AlertOutlined style={{ fontSize: 18, marginRight: 6 }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: 16 }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: '#8c8c8c' }}>Yêu Cầu Đã Hủy</span>}
              value={stats.canceled}
              valueStyle={{ fontSize: 22, fontWeight: 600, color: '#8c8c8c' }}
              prefix={<CloseCircleOutlined style={{ fontSize: 18, marginRight: 6 }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* FILTER BAR */}
      <Card
        bordered={false}
        style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        bodyStyle={{ padding: '12px 16px' }}
      >
        <Row gutter={[16, 12]} align="middle" justify="space-between">
          <Col xs={24} md={16}>
            <Space wrap size="middle">
              <Input
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Tìm tên, SĐT, mã CV..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                allowClear
                style={{ width: 220 }}
              />

              {departments.length > 0 && (
                <Select
                  placeholder="Lọc theo phòng ban"
                  style={{ width: 200 }}
                  allowClear
                  value={selectedDepartment}
                  onChange={(val) => setSelectedDepartment(val)}
                >
                  {departments.map((dept) => (
                    <Option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </Option>
                  ))}
                </Select>
              )}

              <Select
                placeholder="Lọc theo trạng thái"
                style={{ width: 200 }}
                allowClear
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
              >
                <Option value="UPDATED">Đã Cập Nhật (Active)</Option>
                <Option value="NOT_UPDATED">Chưa Cập Nhật (Cần Sửa)</Option>
                <Option value="REQUEST_CANCELED">Đã Hủy Yêu Cầu</Option>
              </Select>
            </Space>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Hiển thị: <strong>{filteredCvs.length}</strong> / {cvList.length} hồ sơ CV
            </Text>
          </Col>
        </Row>
      </Card>

      {/* BẢNG DỮ LIỆU CV MASTER */}
      <Card
        bordered={false}
        style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={filteredCvs}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Tổng số ${total} hồ sơ CV`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  searchKeyword || selectedDepartment || statusFilter
                    ? 'Không tìm thấy hồ sơ CV nào phù hợp với bộ lọc.'
                    : 'Chưa có dữ liệu CV nào trong hệ thống.'
                }
              />
            ),
          }}
        />
      </Card>

      {/* MODAL PHÁT LỆNH CẬP NHẬT CV */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SendOutlined style={{ color: '#1677ff' }} />
            <span>Phát Lệnh Yêu Cầu Cập Nhật CV (HR Request)</span>
          </div>
        }
        open={requestModalOpen}
        onCancel={() => setRequestModalOpen(false)}
        footer={null}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateRequest} style={{ marginTop: 16 }}>
          <Form.Item
            label="Tên Đợt Thu Thập / Lý Do Yêu Cầu"
            name="batchName"
            rules={[{ required: true, message: 'Vui lòng nhập tên đợt thu thập!' }]}
          >
            <Input placeholder="Ví dụ: Rà soát CV Q3/2026 cho dự án mới..." />
          </Form.Item>

          <Form.Item
            label="Hạn Chót Nộp Bài (Deadline)"
            name="deadline"
            rules={[{ required: true, message: 'Vui lòng chọn hạn chót!' }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} placeholder="Chọn ngày và giờ hết hạn" />
          </Form.Item>

          <Form.Item
            label="ID Các Nhân Viên Nhận Yêu Cầu (Phân cách bằng dấu phẩy)"
            name="targetUserIds"
            help="Để trống để phát lệnh cho TẤT CẢ nhân viên, hoặc nhập ID cụ thể (ví dụ: 4, 5, 8)."
          >
            <Input placeholder="Ví dụ: 4, 5 hoặc để trống cho toàn bộ nhân viên" />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setRequestModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={requestSubmitting}>
                Phát Lệnh Yêu Cầu
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* MODAL XEM CHI TIẾT CV PREVIEW */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileDoneOutlined style={{ color: '#1677ff' }} />
            <Text strong style={{ fontSize: 16 }}>
              Hồ Sơ CV Chính Thức v{selectedCv?.version || 1} — {selectedCv?.fullName || selectedCv?.userFullName}
            </Text>
          </div>
        }
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        width={960}
        footer={[
          <Button key="close" onClick={() => setPreviewModalOpen(false)}>
            Đóng
          </Button>,
        ]}
      >
        {selectedCv && (
          <div style={{ padding: '12px 0' }}>
            <CvHeader
              fullName={selectedCv.fullName || selectedCv.userFullName}
              avatarUrl={selectedCv.avatarUrl}
              title={`Phiên bản CV v${selectedCv.version || 1} — Đang Hoạt Động`}
              summary={selectedCv.summary}
              objective={selectedCv.objective}
            />

            <Divider style={{ margin: '16px 0 24px 0' }} />

            <Row gutter={32}>
              <Col span={15}>
                <EducationSection educationsJson={selectedCv.educationsJson} />
                <ExperienceSection experiencesJson={selectedCv.experiencesJson} />
                <ObjectiveSection objective={selectedCv.objective} summary={selectedCv.summary} />
              </Col>

              <Col span={9} style={{ borderLeft: '1px solid #f0f0f0', paddingLeft: 24 }}>
                <PersonalInfoSection
                  phone={selectedCv.phone}
                />
                <SkillsSection skillsJson={selectedCv.skillsJson} />
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HrCvListPage;
