import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Table,
  Card,
  Typography,
  Tag,
  Button,
  Space,
  Modal,
  Input,
  Select,
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
  SearchOutlined,
  ReloadOutlined,
  FileDoneOutlined,
  CheckOutlined,
  AlertOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import hrApi from '../../api/hrApi';
import adminApi from '../../api/adminApi';
import { parseJsonField } from '../../utils/jsonUtils';

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
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [cvList, setCvList] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Filters
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [skillKeyword, setSkillKeyword] = useState('');

  // Modal Preview CV
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedCv, setSelectedCv] = useState(null);

  const fetchDepartments = async () => {
    try {
      const res = await adminApi.getAllDepartments();
      const list = res.data || res.result || res || [];
      setDepartments(Array.isArray(list) ? list : []);
    } catch {
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

  // Tự động chọn phòng ban nếu được chuyển từ trang Dashboard
  useEffect(() => {
    if (location.state?.departmentName && departments.length > 0) {
      const found = departments.find((d) => d.name === location.state.departmentName);
      if (found) {
        setSelectedDepartment(found.id);
      }
    }
  }, [departments, location.state]);

  useEffect(() => {
    fetchAllCvs();
  }, [selectedDepartment, statusFilter]);

  // Bộ lọc kết hợp: Tên/SĐT/ID + Kỹ năng chuyên môn
  const filteredCvs = useMemo(() => {
    let result = cvList;

    // 1. Lọc theo từ khóa thông thường
    if (searchKeyword.trim()) {
      const lower = searchKeyword.toLowerCase().trim();
      result = result.filter((cv) => {
        const name = (cv.fullName || cv.userFullName || '').toLowerCase();
        const phone = (cv.phone || '').toLowerCase();
        const email = (cv.email || '').toLowerCase();
        const dept = (cv.departmentName || '').toLowerCase();
        const idStr = String(cv.id || '');
        const summary = (cv.summary || cv.objective || '').toLowerCase();
        return name.includes(lower) || phone.includes(lower) || email.includes(lower) || dept.includes(lower) || idStr.includes(lower) || summary.includes(lower);
      });
    }

    // 2. Lọc theo kỹ năng chuyên môn (Skill Search)
    if (skillKeyword.trim()) {
      const lowerSkill = skillKeyword.toLowerCase().trim();
      result = result.filter((cv) => {
        const skills = parseJsonField(cv.skillsJson);
        const skillString = skills
          .map((s) => (typeof s === 'object' && s !== null ? s.name || s.skill || '' : String(s)))
          .join(' ')
          .toLowerCase();
        return skillString.includes(lowerSkill);
      });
    }

    return result;
  }, [cvList, searchKeyword, skillKeyword]);

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

  const renderOverallStatus = (status) => {
    switch (status) {
      case 'UPDATED':
        return <Tag icon={<CheckCircleOutlined />} color="success">Đã Cập Nhật</Tag>;
      case 'NOT_UPDATED':
        return <Tag icon={<ExclamationCircleOutlined />} color="error">Chưa Cập Nhật</Tag>;
      case 'REQUEST_CANCELED':
        return <Tag icon={<CloseCircleOutlined />} color="default">Đã Hủy</Tag>;
      default:
        return <Tag color="default">{status || 'Chưa cập nhật'}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Mã CV',
      dataIndex: 'id',
      key: 'id',
      width: 95,
      render: (id) => <Tag color="blue">#CV-{id}</Tag>,
    },
    {
      title: 'Họ Và Tên Nhân Viên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name, record) => (
        <div>
          <Text strong style={{ color: '#0f172a', fontSize: 13.5 }}>
            {name || record.userFullName || 'Chưa cập nhật'}
          </Text>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            {record.email && <span>{record.email} • </span>}
            {record.phone ? <span>SĐT: {record.phone}</span> : `User ID: #${record.userId}`}
          </div>
          {record.departmentName && (
            <div style={{ fontSize: 12, color: '#1677ff', fontWeight: 500, marginTop: 2 }}>
              {record.departmentName}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Phiên Bản',
      dataIndex: 'version',
      key: 'version',
      width: 100,
      align: 'center',
      render: (ver) => <Tag color="cyan">v{ver || 1}</Tag>,
    },
    {
      title: 'Trạng Thái CV',
      dataIndex: 'overallStatus',
      key: 'overallStatus',
      width: 180,
      render: (status) => renderOverallStatus(status),
    },
    {
      title: 'Kỹ Năng Nổi Bật (Skills)',
      key: 'skills',
      width: 220,
      render: (_, record) => {
        const skills = parseJsonField(record.skillsJson);
        if (!skills || skills.length === 0) {
          return <Text type="secondary" italic style={{ fontSize: 12 }}>Chưa cập nhật</Text>;
        }
        const topSkills = skills.slice(0, 3);
        const remainingCount = skills.length - 3;
        return (
          <Space wrap size={[4, 4]}>
            {topSkills.map((s, idx) => {
              const skillName = typeof s === 'object' && s !== null ? s.name || s.skill || 'Skill' : String(s);
              return (
                <Tag key={idx} color="blue" style={{ fontSize: 11, padding: '1px 6px', margin: 0 }}>
                  {skillName}
                </Tag>
              );
            })}
            {remainingCount > 0 && (
              <Tag style={{ fontSize: 11, padding: '1px 6px', margin: 0 }}>+{remainingCount}</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Ngày Cập Nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 130,
      render: (date) => (date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 110,
      align: 'center',
      render: (_, record) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => handleOpenPreview(record)} style={{ borderRadius: 4 }}>
          Xem CV
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* ─── Header & Primary Action ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
            Kho Hồ Sơ CV Toàn Doanh Nghiệp
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Quản lý cơ sở dữ liệu hồ sơ năng lực chính thức và phát động các đợt cập nhật định kỳ.
          </Text>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchAllCvs} loading={loading} style={{ borderRadius: 6 }}>
            Làm mới
          </Button>
        </Space>
      </div>

      {/* ─── Statistic Summary Cards ─── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: 16 }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: '#8c8c8c' }}>Tổng CV Hoạt Động</span>}
              value={stats.total}
              valueStyle={{ fontSize: 22, fontWeight: 700, color: '#1677ff' }}
              prefix={<FileDoneOutlined style={{ fontSize: 18, marginRight: 6 }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: 16 }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: '#8c8c8c' }}>Đã Cập Nhật</span>}
              value={stats.updated}
              valueStyle={{ fontSize: 22, fontWeight: 700, color: '#16a34a' }}
              prefix={<CheckOutlined style={{ fontSize: 18, marginRight: 6 }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: 16 }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: '#8c8c8c' }}>Chưa Cập Nhật</span>}
              value={stats.notUpdated}
              valueStyle={{ fontSize: 22, fontWeight: 700, color: '#fa8c16' }}
              prefix={<AlertOutlined style={{ fontSize: 18, marginRight: 6 }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: 16 }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: '#8c8c8c' }}>Đã Hủy</span>}
              value={stats.canceled}
              valueStyle={{ fontSize: 22, fontWeight: 700, color: '#8c8c8c' }}
              prefix={<CloseCircleOutlined style={{ fontSize: 18, marginRight: 6 }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* ─── Bộ Lọc Nâng Cao (Search + Skill Filter + Status + Dept) ─── */}
      <Card
        bordered={false}
        style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        bodyStyle={{ padding: '12px 16px' }}
      >
        <Row gutter={[16, 12]} align="middle" justify="space-between">
          <Col xs={24} lg={18}>
            <Space wrap size="middle">
              <Input
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Tìm tên, SĐT, mã CV..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                allowClear
                style={{ width: 200, borderRadius: 6 }}
              />

              <Input
                prefix={<CodeOutlined style={{ color: '#1677ff' }} />}
                placeholder="Lọc kỹ năng (React, Java...)"
                value={skillKeyword}
                onChange={(e) => setSkillKeyword(e.target.value)}
                allowClear
                style={{ width: 200, borderRadius: 6 }}
              />

              {departments.length > 0 && (
                <Select
                  placeholder="Lọc theo phòng ban"
                  style={{ width: 190 }}
                  allowClear
                  value={selectedDepartment}
                  onChange={(val) => setSelectedDepartment(val)}
                >
                  {departments.map((dept) => (
                    <Option key={dept.id} value={dept.id}>
                      {dept.name}
                    </Option>
                  ))}
                </Select>
              )}

              <Select
                placeholder="Lọc theo trạng thái"
                style={{ width: 180 }}
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

          <Col xs={24} lg={6} style={{ textAlign: 'right' }}>
            <Text type="secondary" style={{ fontSize: 12.5 }}>
              Hiển thị: <strong>{filteredCvs.length}</strong> / {cvList.length} hồ sơ CV
            </Text>
          </Col>
        </Row>
      </Card>

      {/* ─── Bảng Dữ Liệu CV Master ─── */}
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
                  searchKeyword || skillKeyword || selectedDepartment || statusFilter
                    ? 'Không tìm thấy hồ sơ CV nào phù hợp với bộ lọc.'
                    : 'Chưa có dữ liệu CV nào trong hệ thống.'
                }
              />
            ),
          }}
        />
      </Card>

      {/* ─── Modal Xem Chi Tiết CV Preview ─── */}
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
              title={selectedCv.departmentName ? `${selectedCv.departmentName} • Phiên bản v${selectedCv.version || 1}` : `Phiên bản CV v${selectedCv.version || 1} — Đang Hoạt Động`}
              summary={selectedCv.summary}
              objective={selectedCv.objective}
            />

            <Divider style={{ margin: '16px 0 24px 0' }} />

            <Row gutter={32}>
              <Col span={15}>
                <ObjectiveSection objective={selectedCv.objective} summary={selectedCv.summary} />
                <EducationSection educationsJson={selectedCv.educationsJson} />
                <ExperienceSection experiencesJson={selectedCv.experiencesJson} />
              </Col>

              <Col span={9} style={{ borderLeft: '1px solid #f0f0f0', paddingLeft: 24 }}>
                <PersonalInfoSection
                  phone={selectedCv.phone}
                  email={selectedCv.email}
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
