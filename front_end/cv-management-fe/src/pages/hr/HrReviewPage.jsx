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
  Segmented,
  Tabs,
  Badge,
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
  FileDoneOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CommentOutlined,
  ApartmentOutlined,
  UserOutlined,
} from '@ant-design/icons';
import hrApi from '../../api/hrApi';
import cvApi from '../../api/cvApi';
import CvApprovalHistoryModal from '../../components/CvApprovalHistoryModal';
import CvDiffViewer from '../../components/cv/CvDiffViewer';

// Sub-components CV 2 cột
import CvHeader from '../../components/cv/CvHeader';
import PersonalInfoSection from '../../components/cv/PersonalInfoSection';
import EducationSection from '../../components/cv/EducationSection';
import ExperienceSection from '../../components/cv/ExperienceSection';
import SkillsSection from '../../components/cv/SkillsSection';
import ObjectiveSection from '../../components/cv/ObjectiveSection';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Danh sách các mẫu lý do từ chối nhanh dành cho HR
const REJECTION_TEMPLATES = [
  'Ảnh đại diện chưa đúng quy chuẩn (yêu cầu ảnh chân dung rõ mặt, lịch sự).',
  'Chưa cập nhật đầy đủ kinh nghiệm làm việc và dự án thực tế gần nhất.',
  'Kỹ năng chuyên môn cần nêu rõ mức độ thành thạo hoặc công nghệ cụ thể.',
  'Thông tin liên hệ (Số điện thoại / Email) chưa chính xác hoặc còn thiếu.',
  'Mô tả kinh nghiệm dự án còn quá ngắn, chưa nêu rõ vai trò và đóng góp cá nhân.',
];

const HrReviewPage = () => {
  const [activeTab, setActiveTab] = useState('pending');

  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [allActiveCvs, setAllActiveCvs] = useState([]);
  const [searchText, setSearchText] = useState('');

  // Tab Đã Xử Lý
  const [processedLoading, setProcessedLoading] = useState(false);
  const [processedLogs, setProcessedLogs] = useState([]);
  const [processedSearch, setProcessedSearch] = useState('');

  // State cho Modal Preview CV
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [previewMode, setPreviewMode] = useState('DIFF'); // 'DIFF' | 'FULL'
  const [techLeadEvaluation, setTechLeadEvaluation] = useState(null);

  // State cho Modal Lịch sử duyệt
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyDraftId, setHistoryDraftId] = useState(null);

  // State cho Modal Phê duyệt / Từ chối
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState(''); // 'APPROVE' | 'REJECT'
  const [targetDraftId, setTargetDraftId] = useState(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Tải danh sách bản nháp và kho CV hiện tại song song
  const fetchPendingDrafts = async () => {
    setLoading(true);
    try {
      const [draftRes, cvsRes] = await Promise.allSettled([
        hrApi.getPendingDrafts(),
        hrApi.getAllCvs(),
      ]);

      if (draftRes.status === 'fulfilled') {
        const list = draftRes.value?.data || draftRes.value?.result || draftRes.value || [];
        setDrafts(Array.isArray(list) ? list : []);
      } else {
        message.error('Không thể lấy danh sách CV chờ HR duyệt.');
      }

      if (cvsRes.status === 'fulfilled') {
        const cList = cvsRes.value?.data || cvsRes.value?.result || cvsRes.value || [];
        setAllActiveCvs(Array.isArray(cList) ? cList : []);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu phê duyệt HR:', error);
      message.error('Có lỗi xảy ra khi nạp dữ liệu phê duyệt.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDrafts();
  }, []);

  useEffect(() => {
    if (activeTab === 'processed') fetchProcessedDrafts();
  }, [activeTab]);

  const fetchProcessedDrafts = async () => {
    setProcessedLoading(true);
    try {
      const res = await hrApi.getProcessedDrafts();
      const list = res?.data || res?.result || res || [];
      setProcessedLogs(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Lỗi khi tải lịch sử HR:', error);
      message.error('Không thể tải lịch sử xử lý.');
    } finally {
      setProcessedLoading(false);
    }
  };

  const filteredDrafts = useMemo(() => {
    if (!searchText.trim()) return drafts;
    const lower = searchText.toLowerCase().trim();
    return drafts.filter((d) => {
      const name = (d.fullName || d.userFullName || '').toLowerCase();
      const idStr = String(d.id || '');
      const phone = (d.phone || '').toLowerCase();
      const dept = (d.departmentName || '').toLowerCase();
      return name.includes(lower) || idStr.includes(lower) || phone.includes(lower) || dept.includes(lower);
    });
  }, [drafts, searchText]);

  const filteredProcessedLogs = useMemo(() => {
    if (!processedSearch.trim()) return processedLogs;
    const lower = processedSearch.toLowerCase().trim();
    return processedLogs.filter((log) => {
      const name = (log.draftUserFullName || '').toLowerCase();
      const idStr = String(log.draftId || '');
      return name.includes(lower) || idStr.includes(lower);
    });
  }, [processedLogs, processedSearch]);

  // CV đang hoạt động của người nộp bản nháp được chọn (dùng để Diff)
  const activeCvForSelectedDraft = useMemo(() => {
    if (!selectedDraft) return null;
    return allActiveCvs.find((c) => c.userId === selectedDraft.userId) || null;
  }, [selectedDraft, allActiveCvs]);

  const handleOpenPreview = async (record) => {
    setSelectedDraft(record);
    setPreviewMode('DIFF');
    setTechLeadEvaluation(null);
    setPreviewModalOpen(true);

    // Tự động nạp ý kiến thẩm định của Tech Lead ở Trạm 1
    try {
      const res = await cvApi.getDraftLogs(record.id);
      const list = res.data || res.result || res || [];
      if (Array.isArray(list)) {
        // Tìm log của Tech Lead đã duyệt
        const tlLog = list.find((l) => l.action === 'APPROVED_BY_TECH') || list[list.length - 1];
        setTechLeadEvaluation(tlLog);
      }
    } catch (err) {
      console.error('Lỗi khi nạp ý kiến thẩm định Tech Lead:', err);
    }
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

  const handleApplyTemplate = (tmpl) => {
    setNote(tmpl);
  };

  const handleExecuteAction = async () => {
    if (actionType === 'REJECT' && !note.trim()) {
      message.warning('Vui lòng nhập lý do từ chối để nhân viên biết nguyên nhân!');
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
      if (activeTab === 'processed') fetchProcessedDrafts();
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
      title: 'Mã Nháp',
      dataIndex: 'id',
      key: 'id',
      width: 110,
      render: (id) => <Tag color="blue">#DRAFT-{id}</Tag>,
    },
    {
      title: 'Nhân Viên',
      dataIndex: 'userFullName',
      key: 'userFullName',
      render: (name, record) => (
        <div>
          <Text strong style={{ color: '#0f172a', fontSize: 13.5 }}>
            {record.fullName || name || 'Chưa cập nhật'}
          </Text>
          {record.phone && (
            <div style={{ fontSize: 12, color: '#64748b' }}>
              SĐT: {record.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Phòng Ban',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 170,
      render: (dept) => (
        <Tag icon={<ApartmentOutlined />} color="cyan" style={{ fontWeight: 500 }}>
          {dept || 'Phòng Ban Nội Bộ'}
        </Tag>
      ),
    },
    {
      title: 'Vị Trí / Mục Tiêu',
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
      title: 'Tech Lead Duyệt',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
      render: (date) => (
        <div>
          <div><Text style={{ fontSize: 13 }}>{date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'}</Text></div>
          <div><Text type="secondary" style={{ fontSize: 11 }}>{date ? new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}</Text></div>
        </div>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: () => (
        <Tag icon={<ClockCircleOutlined />} color="processing">
          Chờ HR Duyệt
        </Tag>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleOpenPreview(record)}
          style={{ fontSize: 12, borderRadius: 4 }}
        >
          Xem & Duyệt
        </Button>
      ),
    },
  ];

  // ── Columns Đã Xử Lý ──
  const processedColumns = [
    {
      title: 'Mã Bản Nháp',
      dataIndex: 'draftId',
      key: 'draftId',
      width: 120,
      render: (id) => <Tag color="blue">#DRAFT-{id}</Tag>,
    },
    {
      title: 'Nhân Viên',
      dataIndex: 'draftUserFullName',
      key: 'draftUserFullName',
      render: (name) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <UserOutlined style={{ color: '#8c8c8c' }} />
          <Text strong style={{ color: '#0f172a' }}>{name || 'Chưa cập nhật'}</Text>
        </div>
      ),
    },
    {
      title: 'Kết Quả HR',
      dataIndex: 'action',
      key: 'action',
      width: 180,
      render: (action) => {
        if (action === 'APPROVED_BY_HR') return <Tag icon={<CheckCircleOutlined />} color="success">Đã Duyệt Ban Hành</Tag>;
        if (action === 'REJECTED_BY_HR') return <Tag icon={<CloseCircleOutlined />} color="error">Đã Từ Chối</Tag>;
        return <Tag>{action}</Tag>;
      },
    },
    {
      title: 'Lý Do / Nhận Xét',
      dataIndex: 'comment',
      key: 'comment',
      render: (comment) =>
        comment ? (
          <Tooltip title={comment}>
            <div style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>
              <CommentOutlined style={{ color: '#8c8c8c', marginRight: 5 }} />
              {comment}
            </div>
          </Tooltip>
        ) : (
          <Text type="secondary" italic style={{ fontSize: 12 }}>Không có ghi chú</Text>
        ),
    },
    {
      title: 'Thời Gian Xử Lý',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date) => (
        <div>
          <div><Text style={{ fontSize: 13 }}>{date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'}</Text></div>
          <div><Text type="secondary" style={{ fontSize: 11 }}>{date ? new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}</Text></div>
        </div>
      ),
    },
    {
      title: 'Người Duyệt (HR)',
      dataIndex: 'approverName',
      key: 'approverName',
      width: 160,
      render: (name) => <Text style={{ fontSize: 13 }}>{name || 'N/A'}</Text>,
    },
    {
      title: '',
      key: 'historyAction',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Button size="small" icon={<HistoryOutlined />} onClick={() => handleOpenHistory(record.draftId)}>
          Chi Tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
            Phê Duyệt CV
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Danh sách bản nháp CV chờ HR phê duyệt để ban hành phiên bản mới.
          </Text>
        </div>

        <Space>
          <Tag color="blue" style={{ padding: '4px 12px', fontSize: 13, borderRadius: 16 }}>
            <ClockCircleOutlined style={{ marginRight: 6 }} />
            Đang chờ duyệt: <strong>{drafts.length}</strong> hồ sơ
          </Tag>
          <Button icon={<ReloadOutlined />} onClick={fetchPendingDrafts} loading={loading} style={{ borderRadius: 6 }}>
            Làm mới
          </Button>
        </Space>
      </div>

      {/* Tabs chính: Chờ Duyệt | Đã Xử Lý */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'pending',
            label: (
              <span>
                <ClockCircleOutlined style={{ marginRight: 5 }} />
                Chờ Duyệt
                {drafts.length > 0 && (
                  <Badge count={drafts.length} style={{ marginLeft: 8, backgroundColor: '#1677ff' }} />
                )}
              </span>
            ),
            children: (
              <>
                {/* Filter / Search Bar */}
                <Card bordered={false} style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: '12px 16px' }}>
                  <Row gutter={[16, 12]} align="middle" justify="space-between">
                    <Col xs={24} sm={12} md={8}>
                      <Input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        placeholder="Tìm theo tên nhân viên, phòng ban, mã bản nháp..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                        style={{ borderRadius: 6 }}
                      />
                    </Col>
                    <Col>
                      <Text type="secondary" style={{ fontSize: 12.5 }}>
                        Hiển thị: <strong>{filteredDrafts.length}</strong> / {drafts.length} bản nháp chờ duyệt
                      </Text>
                    </Col>
                  </Row>
                </Card>

                {/* Main Table */}
                <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: 0 }}>
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
                              : 'Hiện tại không có bản nháp CV nào chờ HR duyệt chót.'
                          }
                        />
                      ),
                    }}
                  />
                </Card>
              </>
            ),
          },
          {
            key: 'processed',
            label: (
              <span>
                <HistoryOutlined style={{ marginRight: 5 }} />
                Đã Xử Lý
              </span>
            ),
            children: (
              <>
                <Card bordered={false} style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: '12px 16px' }}>
                  <Row gutter={[16, 12]} align="middle" justify="space-between">
                    <Col xs={24} sm={12} md={8}>
                      <Input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        placeholder="Tìm theo tên nhân viên, mã bản nháp..."
                        value={processedSearch}
                        onChange={(e) => setProcessedSearch(e.target.value)}
                        allowClear
                        style={{ borderRadius: 6 }}
                      />
                    </Col>
                    <Col>
                      <Space>
                        <Text type="secondary" style={{ fontSize: 12.5 }}>
                          Hiển thị: <strong>{filteredProcessedLogs.length}</strong> / {processedLogs.length} lượt xử lý
                        </Text>
                        <Button size="small" icon={<ReloadOutlined />} onClick={fetchProcessedDrafts} loading={processedLoading}>Làm mới</Button>
                      </Space>
                    </Col>
                  </Row>
                </Card>
                <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: 0 }}>
                  <Table
                    columns={processedColumns}
                    dataSource={filteredProcessedLogs}
                    rowKey="id"
                    loading={processedLoading}
                    rowClassName={(record) => record.action === 'REJECTED_BY_HR' ? 'row-rejected' : ''}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      pageSizeOptions: ['10', '20', '50'],
                      showTotal: (total) => `Tổng số ${total} lượt xử lý`,
                    }}
                    locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có bản nháp nào được xử lý." /> }}
                  />
                </Card>
              </>
            ),
          },
        ]}
      />

      {/* MODAL XEM CHI TIẾT & SO SÁNH CV (DIFF & PREVIEW) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileDoneOutlined style={{ color: '#1677ff', fontSize: 18 }} />
            <Text strong style={{ fontSize: 16, color: '#0f172a' }}>
              Duyệt CV — {selectedDraft?.fullName || selectedDraft?.userFullName} (#{selectedDraft?.id})
            </Text>
          </div>
        }
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        width={1000}
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
            style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', fontWeight: 500 }}
            icon={<CheckOutlined />}
            onClick={() => handleOpenActionModal(selectedDraft?.id, 'APPROVE')}
          >
            Duyệt & Ban Hành
          </Button>,
        ]}
      >
        {selectedDraft && (
          <div style={{ padding: '8px 0' }}>
            {/* ─── BANNER NHẬN XÉT CỦA TECH LEAD ─── */}
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <CheckCircleOutlined style={{ color: '#16a34a', fontSize: 18, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <Text strong style={{ color: '#166534', fontSize: 13.5 }}>
                      Tech Lead Đã Thẩm Định Chuyên Môn
                    </Text>
                    {techLeadEvaluation?.createdAt && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(techLeadEvaluation.createdAt).toLocaleString('vi-VN')}
                      </Text>
                    )}
                  </div>

                  <div style={{ fontSize: 13, color: '#1e293b', marginTop: 4 }}>
                    <strong>Người thẩm định:</strong> {techLeadEvaluation?.approverName || 'Tech Lead phụ trách'}
                  </div>

                  <div style={{ fontSize: 13, color: '#334155', marginTop: 2, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <CommentOutlined style={{ color: '#16a34a', marginTop: 3 }} />
                    <div>
                      <strong>Đánh giá chuyên môn: </strong>
                      {techLeadEvaluation?.comment ? (
                        <span style={{ color: '#0f172a', fontWeight: 500 }}>"{techLeadEvaluation.comment}"</span>
                      ) : (
                        <span style={{ fontStyle: 'italic', color: '#64748b' }}>
                          Đã kiểm tra kỹ năng và kinh nghiệm thực tế, đạt yêu cầu chuyên môn.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── CHUYỂN ĐỔI CHẾ ĐỘ XEM: DIFF vs FULL PREVIEW ─── */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Segmented
                value={previewMode}
                onChange={setPreviewMode}
                options={[
                  {
                    label: 'So Sánh Thay Đổi',
                    value: 'DIFF',
                    icon: <AuditOutlined />,
                  },
                  {
                    label: 'Xem Bản Nháp',
                    value: 'FULL',
                    icon: <FileDoneOutlined />,
                  },
                ]}
              />

              <Text type="secondary" style={{ fontSize: 12 }}>
                {previewMode === 'DIFF' ? 'Đối chiếu với CV hiện tại' : 'Xem toàn bộ bản nháp'}
              </Text>
            </div>

            {/* NỘI DUNG HIỂN THỊ TÙY CHỌN */}
            {previewMode === 'DIFF' ? (
              <CvDiffViewer activeCv={activeCvForSelectedDraft} draftCv={selectedDraft} />
            ) : (
              <div>
                <CvHeader
                  fullName={selectedDraft.fullName || selectedDraft.userFullName}
                  avatarUrl={selectedDraft.avatarUrl}
                  title={selectedDraft.departmentName || 'Phòng ban chưa cập nhật'}
                  summary={selectedDraft.summary}
                  objective={selectedDraft.objective}
                />

                <Divider style={{ margin: '16px 0 24px 0' }} />

                <Row gutter={32}>
                  <Col span={15}>
                    <ObjectiveSection objective={selectedDraft.objective} summary={selectedDraft.summary} />
                    <EducationSection educationsJson={selectedDraft.educationsJson} />
                    <ExperienceSection experiencesJson={selectedDraft.experiencesJson} />
                  </Col>

                  <Col span={9} style={{ borderLeft: '1px solid #f0f0f0', paddingLeft: 24 }}>
                    <PersonalInfoSection
                      phone={selectedDraft.phone}
                      email={selectedDraft.email}
                    />
                    <SkillsSection skillsJson={selectedDraft.skillsJson} />

                    <div>
                      <div
                        style={{
                          borderBottom: '1.5px solid #cbd5e1',
                          paddingBottom: 6,
                          fontWeight: 600,
                          fontSize: 15,
                          letterSpacing: 0.6,
                          marginBottom: 14,
                          color: '#0f172a',
                          textTransform: 'uppercase',
                        }}
                      >
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
          </div>
        )}
      </Modal>

      {/* MODAL LỊCH SỬ DUYỆT */}
      <CvApprovalHistoryModal
        open={historyModalOpen}
        onCancel={() => setHistoryModalOpen(false)}
        draftId={historyDraftId}
        title="Lịch Sử Thẩm Định Bản Nháp CV"
      />

      {/* MODAL XÁC NHẬN ACTION (DUYỆT HOẶC TỪ CHỐI) */}
      <Modal
        title={
          actionType === 'APPROVE'
            ? 'Xác Nhận Phê Duyệt CV'
            : 'Xác Nhận Từ Chối Bản Nháp'
        }
        open={actionModalOpen}
        onCancel={() => setActionModalOpen(false)}
        onOk={handleExecuteAction}
        confirmLoading={submitting}
        okText={actionType === 'APPROVE' ? 'Phê Duyệt' : 'Gửi Từ Chối'}
        okButtonProps={{
          danger: actionType === 'REJECT',
          style: actionType === 'APPROVE' ? { backgroundColor: '#16a34a', borderColor: '#16a34a', fontWeight: 500 } : {},
        }}
        width={560}
      >
        <div style={{ marginTop: 16 }}>
          {actionType === 'APPROVE' ? (
            <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>
              Bạn có chắc chắn muốn <Text strong style={{ color: '#16a34a' }}>phê duyệt</Text> bản nháp CV này và ban hành phiên bản CV chính thức mới cho nhân viên?
            </p>
          ) : (
            <div>
              <p style={{ fontSize: 14, color: '#334155', marginBottom: 10 }}>
                Vui lòng nhập <Text strong type="danger">lý do từ chối</Text> để nhân viên chỉnh sửa lại:
              </p>

              {/* Mẫu lý do nhanh */}
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                  Gợi ý lý do phổ biến (nhấn để chọn nhanh):
                </Text>
                <Space wrap size={[6, 6]}>
                  {REJECTION_TEMPLATES.map((tmpl, index) => (
                    <Tag
                      key={index}
                      color="default"
                      style={{ cursor: 'pointer', fontSize: 12, padding: '3px 8px', borderRadius: 4 }}
                      onClick={() => handleApplyTemplate(tmpl)}
                    >
                      {tmpl.length > 40 ? `${tmpl.slice(0, 40)}...` : tmpl}
                    </Tag>
                  ))}
                </Space>
              </div>
            </div>
          )}

          <TextArea
            rows={4}
            placeholder={
              actionType === 'APPROVE'
                ? 'Nhập ghi chú phê duyệt (không bắt buộc)...'
                : 'Nhập lý do từ chối cụ thể để nhân viên bổ sung...'
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ borderRadius: 6 }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default HrReviewPage;
