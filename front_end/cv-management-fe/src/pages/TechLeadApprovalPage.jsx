import React, { useState, useEffect } from 'react';
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
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import techLeadApi from '../api/techLeadApi';

// Import sub-components CV 2 cột
import CvHeader from '../components/cv/CvHeader';
import PersonalInfoSection from '../components/cv/PersonalInfoSection';
import EducationSection from '../components/cv/EducationSection';
import ExperienceSection from '../components/cv/ExperienceSection';
import SkillsSection from '../components/cv/SkillsSection';

const { Title, Text } = Typography;
const { TextArea } = Input;

const TechLeadApprovalPage = () => {
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState([]);

  // State cho Modal Preview CV
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState(null);

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

  const handleOpenPreview = (record) => {
    setSelectedDraft(record);
    setPreviewModalOpen(true);
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
      width: 110,
      render: (id) => <Text strong>#DRAFT-{id}</Text>,
    },
    {
      title: 'Nhân Viên',
      dataIndex: 'userFullName',
      key: 'userFullName',
      render: (name, record) => (
        <div>
          <Text strong style={{ color: '#1677ff' }}>{record.fullName || name || 'Chưa cập nhật'}</Text>
          {record.phone && <div><Text type="secondary" style={{ fontSize: 12 }}>SĐT: {record.phone}</Text></div>}
        </div>
      ),
    },
    {
      title: 'Tóm Tắt Vị Trí / Mục Tiêu',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
      render: (summary, record) => summary || record.objective || 'Chưa cập nhật',
    },
    {
      title: 'Ngày Gửi Duyệt',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
      render: (date) => (date ? new Date(date).toLocaleString('vi-VN') : 'N/A'),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: () => (
        <Tag icon={<ClockCircleOutlined />} color="warning">
          Chờ Tech Lead Duyệt
        </Tag>
      ),
    },
    {
      title: 'Hành Động',
      key: 'actions',
      width: 280,
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleOpenPreview(record)}
          >
            Xem CV
          </Button>
          <Button
            type="primary"
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            icon={<CheckOutlined />}
            onClick={() => handleOpenActionModal(record.id, 'APPROVE')}
          >
            Duyệt
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={() => handleOpenActionModal(record.id, 'REJECT')}
          >
            Từ Chối
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>Tech Lead — Duyệt CV Chuyên Môn (Trạm 1)</Title>
        <Text type="secondary">
          Danh sách bản nháp CV của nhân viên thuộc phòng ban đang gửi chờ đánh giá chuyên môn.
        </Text>
      </div>

      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table
          columns={columns}
          dataSource={drafts}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description="Hiện tại không có bản nháp CV nào chờ duyệt." /> }}
        />
      </Card>

      {/* MODAL XEM CHI TIẾT CV (LAYOUT 2 CỘT CHUẨN DOANH NGHIỆP) */}
      <Modal
        title={
          <Text strong style={{ fontSize: 16 }}>
            Xem Chi Tiết Bản Nháp CV — #{selectedDraft?.id} ({selectedDraft?.fullName || selectedDraft?.userFullName})
          </Text>
        }
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        width={960}
        footer={[
          <Button key="close" onClick={() => setPreviewModalOpen(false)}>
            Đóng Xem Trước
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
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            icon={<CheckOutlined />}
            onClick={() => handleOpenActionModal(selectedDraft?.id, 'APPROVE')}
          >
            Duyệt Bản Nháp Này
          </Button>,
        ]}
      >
        {selectedDraft && (
          <div style={{ padding: '12px 0' }}>
            <CvHeader
              fullName={selectedDraft.fullName || selectedDraft.userFullName}
              avatarUrl={selectedDraft.avatarUrl}
              title="Nhân viên Đang Gửi Duyệt"
              summary={selectedDraft.summary}
              objective={selectedDraft.objective}
            />

            <Divider style={{ margin: '16px 0 24px 0' }} />

            <Row gutter={32}>
              <Col span={15}>
                <EducationSection educationsJson={selectedDraft.educationsJson} />
                <ExperienceSection experiencesJson={selectedDraft.experiencesJson} />
              </Col>

              <Col span={9} style={{ borderLeft: '1px solid #f0f0f0', paddingLeft: 24 }}>
                <PersonalInfoSection
                  phone={selectedDraft.phone}
                  email="N/A"
                  address="Việt Nam"
                />
                <SkillsSection skillsJson={selectedDraft.skillsJson} />
              </Col>
            </Row>
          </div>
        )}
      </Modal>

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
          style: actionType === 'APPROVE' ? { backgroundColor: '#52c41a', borderColor: '#52c41a' } : {},
        }}
      >
        <div style={{ marginTop: 16 }}>
          {actionType === 'APPROVE' ? (
            <p>
              Bạn có chắc chắn muốn <Text strong type="success">Duyệt</Text> bản nháp CV này để chuyển sang Trạm 2 (HR duyệt chót) không?
            </p>
          ) : (
            <p>
              Vui lòng nhập <Text strong type="danger">lý do từ chối</Text> cụ thể để nhân viên biết nguyên nhân và chỉnh sửa lại bản nháp:
            </p>
          )}

          <TextArea
            rows={4}
            placeholder={
              actionType === 'APPROVE'
                ? 'Nhập nhận xét / ghi chú thêm (không bắt buộc)...'
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
