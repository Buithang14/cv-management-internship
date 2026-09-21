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
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import hrApi from '../../api/hrApi';

// Import sub-components CV 2 cột
import CvHeader from '../../components/cv/CvHeader';
import PersonalInfoSection from '../../components/cv/PersonalInfoSection';
import EducationSection from '../../components/cv/EducationSection';
import ExperienceSection from '../../components/cv/ExperienceSection';
import SkillsSection from '../../components/cv/SkillsSection';

const { Title, Text } = Typography;
const { TextArea } = Input;

const HrReviewPage = () => {
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState([]);

  // State cho Modal Preview CV
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState(null);

  // State cho Modal Phê duyệt / Từ chối
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState(''); // 'APPROVE' | 'REJECT'
  const [targetDraftId, setTargetDraftId] = useState(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPendingDrafts = async () => {
    setLoading(true);
    try {
      const response = await hrApi.getPendingDrafts();
      const list = response.data || response.result || response || [];
      setDrafts(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Lỗi khi tải bản nháp chờ HR duyệt:', error);
      message.error('Không thể lấy danh sách CV chờ HR duyệt.');
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
      message.warning('Vui lòng nhập lý do từ chối!');
      return;
    }

    setSubmitting(true);
    try {
      if (actionType === 'APPROVE') {
        await hrApi.approveDraft(targetDraftId, note.trim());
        message.success('Đã duyệt chót bản nháp CV và nâng Version CV chính thức thành công!');
      } else if (actionType === 'REJECT') {
        await hrApi.rejectDraft(targetDraftId, note.trim());
        message.success('Đã từ chối bản nháp CV và phản hồi lại cho nhân viên.');
      }
      setActionModalOpen(false);
      setPreviewModalOpen(false);
      fetchPendingDrafts();
    } catch (error) {
      console.error('Lỗi khi thao tác duyệt HR:', error);
      const errMsg = error.response?.data?.message || 'Thao tác phê duyệt thất bại!';
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
          <Text strong style={{ color: '#722ed1' }}>{record.fullName || name || 'Chưa cập nhật'}</Text>
          {record.phone && <div><Text type="secondary" style={{ fontSize: 12 }}>SĐT: {record.phone}</Text></div>}
        </div>
      ),
    },
    {
      title: 'Tóm Tắt Vị Trí',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
      render: (summary, record) => summary || record.objective || 'Chưa cập nhật',
    },
    {
      title: 'Ngày Đã Duyệt Trạm 1',
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
        <Tag icon={<ClockCircleOutlined />} color="processing">
          Chờ HR Duyệt Chót (Trạm 2)
        </Tag>
      ),
    },
    {
      title: 'Hành Động',
      key: 'actions',
      width: 280,
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EyeOutlined />} onClick={() => handleOpenPreview(record)}>
            Xem CV
          </Button>
          <Button
            type="primary"
            style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
            icon={<CheckOutlined />}
            onClick={() => handleOpenActionModal(record.id, 'APPROVE')}
          >
            Duyệt Chót
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
        <Title level={4} style={{ margin: 0 }}>HR — Duyệt Chót Bản Nháp CV (Trạm 2)</Title>
        <Text type="secondary">
          Danh sách bản nháp CV đã vượt qua vòng duyệt kỹ thuật của Tech Lead, đang chờ HR duyệt chót để ban hành phiên bản CV mới.
        </Text>
      </div>

      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table
          columns={columns}
          dataSource={drafts}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description="Không có CV nào đang chờ HR duyệt chót." /> }}
        />
      </Card>

      {/* MODAL XEM CHI TIẾT CV PREVIEW */}
      <Modal
        title={
          <Text strong style={{ fontSize: 16 }}>
            Phê Duyệt Chót CV — #{selectedDraft?.id} ({selectedDraft?.fullName || selectedDraft?.userFullName})
          </Text>
        }
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        width={960}
        footer={[
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
            style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
            icon={<CheckOutlined />}
            onClick={() => handleOpenActionModal(selectedDraft?.id, 'APPROVE')}
          >
            Duyệt Chót & Ban Hành CV
          </Button>,
        ]}
      >
        {selectedDraft && (
          <div style={{ padding: '12px 0' }}>
            <CvHeader
              fullName={selectedDraft.fullName || selectedDraft.userFullName}
              avatarUrl={selectedDraft.avatarUrl}
              title="Đã Duyệt Chuyên Môn Trạm 1 — Chờ HR Duyệt Chót"
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

      {/* MODAL XÁC NHẬN ACTION */}
      <Modal
        title={
          actionType === 'APPROVE'
            ? 'Xác Nhận Phê Duyệt Chót & Ban Hành CV Mới'
            : 'Xác Nhận Từ Chối Bản Nháp (Trạm 2)'
        }
        open={actionModalOpen}
        onCancel={() => setActionModalOpen(false)}
        onOk={handleExecuteAction}
        confirmLoading={submitting}
        okText={actionType === 'APPROVE' ? 'Duyệt Chót & Ban Hành' : 'Gửi Từ Chối'}
        okButtonProps={{
          danger: actionType === 'REJECT',
          style: actionType === 'APPROVE' ? { backgroundColor: '#722ed1', borderColor: '#722ed1' } : {},
        }}
      >
        <div style={{ marginTop: 16 }}>
          {actionType === 'APPROVE' ? (
            <p>
              Bạn có chắc chắn muốn <Text strong style={{ color: '#722ed1' }}>Duyệt Chót</Text> bản nháp CV này không? Hệ thống sẽ tự động cập nhật bản nháp này thành <Text strong type="success">CV Chính Thức (Tăng Version)</Text>.
            </p>
          ) : (
            <p>
              Vui lòng nhập <Text strong type="danger">lý do từ chối</Text> để nhân viên chỉnh sửa lại:
            </p>
          )}

          <TextArea
            rows={4}
            placeholder={
              actionType === 'APPROVE'
                ? 'Nhập ghi chú phê duyệt (không bắt buộc)...'
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

export default HrReviewPage;
