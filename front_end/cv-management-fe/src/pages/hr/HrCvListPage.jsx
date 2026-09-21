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
  DatePicker,
  message,
  Divider,
  Row,
  Col,
  Empty,
} from 'antd';
import {
  SendOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import hrApi from '../../api/hrApi';

// Import sub-components CV 2 cột
import CvHeader from '../../components/cv/CvHeader';
import PersonalInfoSection from '../../components/cv/PersonalInfoSection';
import EducationSection from '../../components/cv/EducationSection';
import ExperienceSection from '../../components/cv/ExperienceSection';
import SkillsSection from '../../components/cv/SkillsSection';

const { Title, Text } = Typography;
const { Option } = Select;

const HrCvListPage = () => {
  const [loading, setLoading] = useState(false);
  const [cvList, setCvList] = useState([]);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState(null);

  // Modal Request Creation
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Modal Preview CV
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedCv, setSelectedCv] = useState(null);

  const fetchAllCvs = async () => {
    setLoading(true);
    try {
      const response = await hrApi.getAllCvs(null, statusFilter);
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
    fetchAllCvs();
  }, [statusFilter]);

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
        targetUserIds: values.targetUserIds ? values.targetUserIds.split(',').map(id => parseInt(id.trim())).filter(Boolean) : [],
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
      width: 90,
      render: (id) => <Text strong>#CV-{id}</Text>,
    },
    {
      title: 'Họ Và Tên Nhân Viên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name, record) => (
        <div>
          <Text strong style={{ color: '#1677ff' }}>{name || record.userFullName || 'Chưa cập nhật'}</Text>
          {record.phone && <div><Text type="secondary" style={{ fontSize: 12 }}>SĐT: {record.phone}</Text></div>}
        </div>
      ),
    },
    {
      title: 'Phiên Bản',
      dataIndex: 'version',
      key: 'version',
      width: 110,
      render: (ver) => <Tag color="blue">v{ver || 1}</Tag>,
    },
    {
      title: 'Trạng Thái CV',
      dataIndex: 'overallStatus',
      key: 'overallStatus',
      width: 180,
      render: (status) => renderOverallStatus(status),
    },
    {
      title: 'Tóm Tắt Vị Trí',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
      render: (summary, record) => summary || record.objective || 'Chưa cập nhật',
    },
    {
      title: 'Ngày Cập Nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
      render: (date) => (date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'),
    },
    {
      title: 'Hành Động',
      key: 'actions',
      width: 130,
      render: (_, record) => (
        <Button icon={<EyeOutlined />} onClick={() => handleOpenPreview(record)}>
          Xem CV
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* HEADER & THANH THAO TÁC */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>HR Master Dashboard — Danh Sách CV Toàn Công Ty</Title>
          <Text type="secondary">Quản lý phiên bản CV chính thức và phát lệnh thu thập cập nhật CV định kỳ.</Text>
        </div>

        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={() => setRequestModalOpen(true)}
        >
          Phát Lệnh Cập Nhật CV
        </Button>
      </div>

      {/* THANH LỌC BỘ LỌC DỮ LIỆU */}
      <Card bordered={false} style={{ marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Space size="middle">
          <Text strong><FilterOutlined /> Lọc Theo Trạng Thái:</Text>
          <Select
            placeholder="Tất cả trạng thái"
            style={{ width: 220 }}
            allowClear
            onChange={(val) => setStatusFilter(val)}
          >
            <Option value="UPDATED">Màu Xanh — Đã Cập Nhật</Option>
            <Option value="NOT_UPDATED">Màu Đỏ — Chưa Cập Nhật</Option>
            <Option value="REQUEST_CANCELED">Màu Xám — Đã Hủy Yêu Cầu</Option>
          </Select>
        </Space>
      </Card>

      {/* BẢNG DỮ LIỆU CV MASTER */}
      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table
          columns={columns}
          dataSource={cvList}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description="Chưa có dữ liệu CV nào trong hệ thống." /> }}
        />
      </Card>

      {/* MODAL PHÁT LỆNH CẬP NHẬT CV */}
      <Modal
        title="Phát Lệnh Yêu Cầu Cập Nhật CV (HR Request)"
        open={requestModalOpen}
        onCancel={() => setRequestModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateRequest} style={{ marginTop: 16 }}>
          <Form.Item
            label="Tên Đợt Thu Thập / Lý Do"
            name="batchName"
            rules={[{ required: true, message: 'Vui lòng nhập tên đợt thu thập!' }]}
          >
            <Input placeholder="Ví dụ: Đợt Thu Thập CV Q3/2026..." />
          </Form.Item>

          <Form.Item
            label="Hạn Chót Nộp Bài (Deadline)"
            name="deadline"
            rules={[{ required: true, message: 'Vui lòng chọn hạn chót!' }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="ID Các Nhân Viên Nhận Yêu Cầu (Phân cách bởi dấu phẩy)"
            name="targetUserIds"
            help="Để trống hoặc nhập ID các tài khoản nhân viên (Ví dụ: 4, 5, 6)"
          >
            <Input placeholder="Ví dụ: 4" />
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
          <Text strong style={{ fontSize: 16 }}>
            Hồ Sơ CV Chính Thức v{selectedCv?.version} — {selectedCv?.fullName || selectedCv?.userFullName}
          </Text>
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
              title={"Phiên bản CV v" + (selectedCv.version || 1) + " — Đang Hoạt Động"}
              summary={selectedCv.summary}
              objective={selectedCv.objective}
            />

            <Divider style={{ margin: '16px 0 24px 0' }} />

            <Row gutter={32}>
              <Col span={15}>
                <EducationSection educationsJson={selectedCv.educationsJson} />
                <ExperienceSection experiencesJson={selectedCv.experiencesJson} />
              </Col>

              <Col span={9} style={{ borderLeft: '1px solid #f0f0f0', paddingLeft: 24 }}>
                <PersonalInfoSection
                  phone={selectedCv.phone}
                  email="N/A"
                  address="Việt Nam"
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
