import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Card,
  Typography,
  Tag,
  Button,
  Space,
  Modal,
  Input,
  message,
  Divider,
  Row,
  Col,
  Empty,
  Tooltip,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import techLeadApi from '../api/techLeadApi';
import CvApprovalHistoryModal from '../components/CvApprovalHistoryModal';

// Sub-components CV 2 cột
import CvHeader from '../components/cv/CvHeader';
import PersonalInfoSection from '../components/cv/PersonalInfoSection';
import EducationSection from '../components/cv/EducationSection';
import ExperienceSection from '../components/cv/ExperienceSection';
import SkillsSection from '../components/cv/SkillsSection';
import ObjectiveSection from '../components/cv/ObjectiveSection';

const { Title, Text } = Typography;
const { TextArea } = Input;

const TechLeadApprovalPage = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [searchText, setSearchText] = useState('');

  // State cho Modal Preview CV
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState(null);

  // State cho Modal Lịch sử duyệt
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyDraftId, setHistoryDraftId] = useState(null);

  // State cho Modal Duyệt / Từ chối
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState(''); // 'APPROVE' | 'REJECT'
  const [targetDraftId, setTargetDraftId] = useState(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPendingDrafts = async () => {
    setLoading(true);
    try {
      const response = await techLeadApi.getPendingDrafts();
      const list = response.data || response.result || response || [];
      setDrafts(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách CV chờ duyệt:', error);
      message.error('Không thể lấy danh sách CV chờ duyệt từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDrafts();
  }, []);

  const filteredDrafts = useMemo(() => {
    if (!searchText.trim()) return drafts;
    const lower = searchText.toLowerCase().trim();
    return drafts.filter((d) => {
      const name = (d.fullName || d.userFullName || '').toLowerCase();
      const idStr = String(d.id || '');
      const phone = (d.phone || '').toLowerCase();
      return name.includes(lower) || idStr.includes(lower) || phone.includes(lower);
    });
  }, [drafts, searchText]);

  const handleOpenPreview = (record) => {
    setSelectedDraft(record);
    setPreviewModalOpen(true);
  };

  const handleOpenHistory = (draftId) => {
    setHistoryDraftId(draftId);
    setHistoryModalOpen(true);
  };

  const handleOpenActionModal = (id, type) => {
    setTargetDraftId(id);
    setActionType(type);
    setNote('');
    setActionModalOpen(true);
  };

  const handleExecuteAction = async () => {
    if (actionType === 'REJECT' && !note.trim()) {
      message.warning('Vui lòng nhập lý do từ chối để nhân viên biết cách sửa!');
      return;
    }

    setSubmitting(true);
    try {
      if (actionType === 'APPROVE') {
        await techLeadApi.approveDraft(targetDraftId, note.trim());
        message.success('Đã duyệt bản nháp CV thành công (Chuyển sang Trạm 2 HR)!');
      } else if (actionType === 'REJECT') {
        await techLeadApi.rejectDraft(targetDraftId, note.trim());
        message.success('Đã từ chối bản nháp CV và gửi thông báo tới nhân viên.');
      }
      setActionModalOpen(false);
      setPreviewModalOpen(false);
      fetchPendingDrafts();
    } catch (error) {
      console.error('Lỗi khi thực hiện thao tác duyệt:', error);
      const errMsg = error.response?.data?.message || 'Thao tác không thành công!';
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Mã Bản Nháp',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id) => <Tag color="blue">#DRAFT-{id}</Tag>,
    },
    {
      title: 'Nhân Viên',
      dataIndex: 'userFullName',
      key: 'userFullName',
      render: (name, record) => (
        <Text strong style={{ color: '#0f172a', fontSize: 14 }}>
          {record.fullName || name || 'Chưa cập nhật'}
        </Text>
      ),
    },
    {
      title: 'Tóm Tắt Mục Tiêu / Chuyên Môn',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
      render: (summary, record) => (
        <span orientation="vertical" orientationMargin={0} title={summary || record.objective || ''}>
          {summary || record.objective || <Text type="secondary">Chưa cập nhật</Text>}
        </span>
      ),
    },
    {
      title: 'Ngày Gửi Duyệt',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
      render: (date) => (
        <div>
          <div><Text orientation="vertical" orientationMargin={0} style={{ fontSize: 13 }}>{date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'}</Text></div>
          <div><Text type="secondary" style={{ fontSize: 11 }}>{date ? new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}</Text></div>
        </div>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 170,
      render: () => (
        <Tag icon={<ClockCircleOutlined />} color="warning">
          Chờ Tech Lead Duyệt
        </Tag>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleOpenPreview(record)}
        >
          Xem CV
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
            Duyệt CV Chuyên Môn
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Đánh giá và thẩm định kỹ năng, dự án của nhân viên trong bộ phận trước khi chuyển sang HR.
          </Text>
        </div>

        <Space>
          <Tag color="orange" style={{ padding: '4px 12px', fontSize: 13, borderRadius: 16 }}>
            <ClockCircleOutlined style={{ marginRight: 6 }} />
            Đang chờ duyệt: <strong>{drafts.length}</strong> hồ sơ
          </Tag>
          <Button icon={<ReloadOutlined />} onClick={fetchPendingDrafts} loading={loading}>
            Làm mới
          </Button>
        </Space>
      </div>

      {/* Filter / Search Bar */}
      <Card
        bordered={false}
        style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        bodyStyle={{ padding: '12px 16px' }}
      >
        <Row gutter={[16, 12]} align="middle" justify="space-between">
          <Col xs={24} sm={12} md={8}>
            <Input
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Tìm theo tên nhân viên, mã bản nháp..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Hiển thị: <strong>{filteredDrafts.length}</strong> / {drafts.length} bản nháp
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Card
        bordered={false}
        style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={filteredDrafts}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Tổng số ${total} bản nháp`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  searchText
                    ? 'Không tìm thấy bản nháp phù hợp với từ khóa.'
                    : 'Hiện tại không có bản nháp CV nào chờ Tech Lead duyệt.'
                }
              />
            ),
          }}
        />
      </Card>

      {/* MODAL XEM CHI TIẾT CV (LAYOUT 2 CỘT CHUẨN DOANH NGHIỆP) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileTextOutlined style={{ color: '#1677ff' }} />
            <Text strong style={{ fontSize: 16 }}>
              Bản Nháp CV — #DRAFT-{selectedDraft?.id} ({selectedDraft?.fullName || selectedDraft?.userFullName})
            </Text>
          </div>
        }
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        width={960}
        footer={[
          <Button key="history" icon={<HistoryOutlined />} onClick={() => handleOpenHistory(selectedDraft?.id)}>
            Lịch Sử Duyệt
          </Button>,
          <Button key="close" onClick={() => setPreviewModalOpen(false)}>
            Đóng
          </Button>,
          <Button
            key="reject"
            danger
            icon={<CloseOutlined />}
            onClick={() => handleOpenActionModal(selectedDraft?.id, 'REJECT')}
          >
            Từ Chối
          </Button>,
          <Button
            key="approve"
            type="primary"
            style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
            icon={<CheckOutlined />}
            onClick={() => handleOpenActionModal(selectedDraft?.id, 'APPROVE')}
          >
            Duyệt Chuyên Môn
          </Button>,
        ]}
      >
        {selectedDraft && (
          <div style={{ padding: '12px 0' }}>
            <CvHeader
              fullName={selectedDraft.fullName || selectedDraft.userFullName}
              avatarUrl={selectedDraft.avatarUrl}
              title={selectedDraft.departmentName || user.departmentName || 'Phòng Công Nghệ Thông Tin'}
              summary={selectedDraft.summary}
              objective={selectedDraft.objective}
            />

            <Divider style={{ margin: '16px 0 24px 0' }} />

            <Row gutter={32}>
              <Col span={15}>
                <EducationSection educationsJson={selectedDraft.educationsJson} />
                <ExperienceSection experiencesJson={selectedDraft.experiencesJson} />
                <ObjectiveSection objective={selectedDraft.objective} summary={selectedDraft.summary} />
              </Col>

              <Col span={9} style={{ borderLeft: '1px solid #f0f0f0', paddingLeft: 24 }}>
                <PersonalInfoSection
                  phone={selectedDraft.phone}
                  email={selectedDraft.email}
                />
                <SkillsSection skillsJson={selectedDraft.skillsJson} />

                <div>
                  <div style={{
                    borderBottom: '1.5px solid #cbd5e1',
                    paddingBottom: 6,
                    fontWeight: 600,
                    fontSize: 15,
                    letterSpacing: 0.6,
                    marginBottom: 14,
                    color: '#0f172a',
                    textTransform: 'uppercase'
                  }}>
                    THÔNG TIN BỔ SUNG
                  </div>
                  <div style={{ fontSize: 14, color: '#475569', marginBottom: 6 }}>
                    <span>Ngày gửi duyệt: </span>
                    <span style={{ color: '#0f172a', fontWeight: 500 }}>
                      {selectedDraft.createdAt ? new Date(selectedDraft.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, color: '#475569' }}>
                    <span>Cập nhật lần cuối: </span>
                    <span style={{ color: '#0f172a', fontWeight: 500 }}>
                      {selectedDraft.updatedAt ? new Date(selectedDraft.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* MODAL LỊCH SỬ DUYỆT */}
      <CvApprovalHistoryModal
        open={historyModalOpen}
        onCancel={() => setHistoryModalOpen(false)}
        draftId={historyDraftId}
      />

      {/* MODAL PHÊ DUYỆT HOẶC TỪ CHỐI BẢN NHÁP */}
      <Modal
        title={
          actionType === 'APPROVE'
            ? 'Xác Nhận Phê Duyệt CV (Chuyển Trạm 2 HR)'
            : 'Xác Nhận Từ Chối Bản Nháp CV'
        }
        open={actionModalOpen}
        onCancel={() => setActionModalOpen(false)}
        onOk={handleExecuteAction}
        confirmLoading={submitting}
        okText={actionType === 'APPROVE' ? 'Duyệt Chuyên Môn' : 'Gửi Từ Chối'}
        okButtonProps={{
          danger: actionType === 'REJECT',
          style: actionType === 'APPROVE' ? { backgroundColor: '#16a34a', borderColor: '#16a34a' } : {},
        }}
      >
        <div style={{ marginTop: 16 }}>
          {actionType === 'APPROVE' ? (
            <p>
              Bạn có chắc chắn muốn <Text strong style={{ color: '#16a34a' }}>Duyệt</Text> bản nháp CV này để chuyển sang Trạm 2 (HR duyệt chót) không?
            </p>
          ) : (
            <p>
              Vui lòng nhập <Text strong type="danger">lý do từ chối</Text> cụ thể để nhân viên nắm rõ và chỉnh sửa:
            </p>
          )}

          <TextArea
            rows={4}
            placeholder={
              actionType === 'APPROVE'
                ? 'Nhập nhận xét / ghi chú thêm cho HR (không bắt buộc)...'
                : 'Nhập lý do từ chối (bắt buộc)...'
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default TechLeadApprovalPage;
