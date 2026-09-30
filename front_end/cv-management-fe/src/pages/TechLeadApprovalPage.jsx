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
  Segmented,
  Tabs,
  Badge,
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
  AuditOutlined,
  FileDoneOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  CommentOutlined,
} from '@ant-design/icons';
import techLeadApi from '../api/techLeadApi';
import CvApprovalHistoryModal from '../components/CvApprovalHistoryModal';
import CvDiffViewer from '../components/cv/CvDiffViewer';

// Sub-components CV 2 cột
import CvHeader from '../components/cv/CvHeader';
import PersonalInfoSection from '../components/cv/PersonalInfoSection';
import EducationSection from '../components/cv/EducationSection';
import ExperienceSection from '../components/cv/ExperienceSection';
import SkillsSection from '../components/cv/SkillsSection';
import ObjectiveSection from '../components/cv/ObjectiveSection';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const TechLeadApprovalPage = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeTab, setActiveTab] = useState('pending');

  // ── Tab Chờ Duyệt ──
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [searchText, setSearchText] = useState('');

  // ── Tab Đã Xử Lý ──
  const [processedLoading, setProcessedLoading] = useState(false);
  const [processedLogs, setProcessedLogs] = useState([]);
  const [processedSearch, setProcessedSearch] = useState('');

  // State cho Modal Preview CV
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [allActiveCvs, setAllActiveCvs] = useState([]);
  const [previewMode, setPreviewMode] = useState('DIFF'); // 'DIFF' | 'FULL'

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
      const [draftRes, cvsRes] = await Promise.allSettled([
        techLeadApi.getPendingDrafts(),
        techLeadApi.getActiveCvs(),
      ]);

      if (draftRes.status === 'fulfilled') {
        const list = draftRes.value?.data || draftRes.value?.result || draftRes.value || [];
        setDrafts(Array.isArray(list) ? list : []);
      } else {
        message.error('Không thể lấy danh sách CV chờ duyệt từ máy chủ.');
      }

      if (cvsRes.status === 'fulfilled') {
        const cList = cvsRes.value?.data || cvsRes.value?.result || cvsRes.value || [];
        setAllActiveCvs(Array.isArray(cList) ? cList : []);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách CV chờ duyệt:', error);
      message.error('Không thể lấy danh sách CV chờ duyệt từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProcessedDrafts = async () => {
    setProcessedLoading(true);
    try {
      const res = await techLeadApi.getProcessedDrafts();
      const list = res?.data || res?.result || res || [];
      setProcessedLogs(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Lỗi khi tải lịch sử xử lý:', error);
      message.error('Không thể tải lịch sử xử lý.');
    } finally {
      setProcessedLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDrafts();
  }, []);

  useEffect(() => {
    if (activeTab === 'processed') {
      fetchProcessedDrafts();
    }
  }, [activeTab]);

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

  const filteredProcessedLogs = useMemo(() => {
    if (!processedSearch.trim()) return processedLogs;
    const lower = processedSearch.toLowerCase().trim();
    return processedLogs.filter((log) => {
      const name = (log.draftUserFullName || log.approverName || '').toLowerCase();
      const idStr = String(log.draftId || '');
      return name.includes(lower) || idStr.includes(lower);
    });
  }, [processedLogs, processedSearch]);

  // CV đang hoạt động của người nộp bản nháp được chọn (dùng để Diff)
  const activeCvForSelectedDraft = useMemo(() => {
    if (!selectedDraft) return null;
    return allActiveCvs.find((c) => c.userId === selectedDraft.userId) || null;
  }, [selectedDraft, allActiveCvs]);

  const handleOpenPreview = (record) => {
    setSelectedDraft(record);
    setPreviewMode('DIFF');
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
        message.success('Đã duyệt chuyên môn bản nháp CV thành công!');
      } else if (actionType === 'REJECT') {
        await techLeadApi.rejectDraft(targetDraftId, note.trim());
        message.success('Đã từ chối bản nháp CV và gửi thông báo tới nhân viên.');
      }
      setActionModalOpen(false);
      setPreviewModalOpen(false);
      fetchPendingDrafts();
      // Nếu đang ở tab đã xử lý, refresh luôn
      if (activeTab === 'processed') fetchProcessedDrafts();
    } catch (error) {
      console.error('Lỗi khi thực hiện thao tác duyệt:', error);
      const errMsg = error.response?.data?.message || 'Thao tác không thành công!';
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Columns cho tab Chờ Duyệt ──
  const pendingColumns = [
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
      title: 'Ngôn Ngữ',
      dataIndex: 'language',
      key: 'language',
      width: 130,
      render: (lang, record) => {
        const flag = record.languageFlag || (lang === 'EN' ? '🇬🇧' : lang === 'JA' ? '🇯🇵' : '🇻🇳');
        const label = record.languageLabel || (lang === 'EN' ? 'Tiếng Anh' : lang === 'JA' ? 'Tiếng Nhật' : 'Tiếng Việt');
        const color = lang === 'EN' ? 'green' : lang === 'JA' ? 'orange' : 'blue';
        return (
          <Tag color={color} style={{ borderRadius: 4, fontWeight: 500 }}>
            <span style={{ marginRight: 4 }}>{flag}</span>
            {label}
          </Tag>
        );
      },
    },
    {
      title: 'Tóm Tắt Mục Tiêu / Chuyên Môn',
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
      title: 'Ngày Gửi Duyệt',
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

  // ── Columns cho tab Đã Xử Lý ──
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
      title: 'Ngôn Ngữ',
      dataIndex: 'language',
      key: 'language',
      width: 130,
      render: (lang, record) => {
        const flag = record.languageFlag || (lang === 'EN' ? '🇬🇧' : lang === 'JA' ? '🇯🇵' : '🇻🇳');
        const label = record.languageLabel || (lang === 'EN' ? 'Tiếng Anh' : lang === 'JA' ? 'Tiếng Nhật' : 'Tiếng Việt');
        const color = lang === 'EN' ? 'green' : lang === 'JA' ? 'orange' : 'blue';
        return (
          <Tag color={color} style={{ borderRadius: 4 }}>
            <span style={{ marginRight: 4 }}>{flag}</span>
            {label}
          </Tag>
        );
      },
    },
    {
      title: 'Kết Quả',
      dataIndex: 'action',
      key: 'action',
      width: 180,
      render: (action) => {
        if (action === 'APPROVED_BY_TECH') {
          return <Tag icon={<CheckCircleOutlined />} color="success">Đã Duyệt</Tag>;
        }
        if (action === 'REJECTED_BY_TECH') {
          return <Tag icon={<CloseCircleOutlined />} color="error">Đã Từ Chối</Tag>;
        }
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
            <div style={{
              maxWidth: 300,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: 13,
              color: '#434343',
            }}>
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
      title: 'Người Duyệt',
      dataIndex: 'approverName',
      key: 'approverName',
      width: 150,
      render: (name) => <Text style={{ fontSize: 13 }}>{name || 'N/A'}</Text>,
    },
    {
      title: '',
      key: 'historyAction',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Button
          size="small"
          icon={<HistoryOutlined />}
          onClick={() => handleOpenHistory(record.draftId)}
        >
          Chi Tiết
        </Button>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'pending',
      label: (
        <span>
          <ClockCircleOutlined style={{ marginRight: 5 }} />
          Chờ Duyệt
          {drafts.length > 0 && (
            <Badge count={drafts.length} style={{ marginLeft: 8, backgroundColor: '#fa8c16' }} />
          )}
        </span>
      ),
      children: (
        <>
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
              columns={pendingColumns}
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
                  value={processedSearch}
                  onChange={(e) => setProcessedSearch(e.target.value)}
                  allowClear
                />
              </Col>
              <Col>
                <Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Hiển thị: <strong>{filteredProcessedLogs.length}</strong> / {processedLogs.length} lượt xử lý
                  </Text>
                  <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={fetchProcessedDrafts}
                    loading={processedLoading}
                  >
                    Làm mới
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Processed Table */}
          <Card
            bordered={false}
            style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            bodyStyle={{ padding: 0 }}
          >
            <Table
              columns={processedColumns}
              dataSource={filteredProcessedLogs}
              rowKey="id"
              loading={processedLoading}
              rowClassName={(record) =>
                record.action === 'REJECTED_BY_TECH' ? 'row-rejected' : ''
              }
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (total) => `Tổng số ${total} lượt xử lý`,
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có bản nháp nào được xử lý."
                  />
                ),
              }}
            />
          </Card>
        </>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
            Thẩm Định CV
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Thẩm định kỹ năng, dự án của nhân viên trước khi chuyển HR phê duyệt.
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

      {/* Tabs chính */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ background: 'transparent' }}
      />

      {/* MODAL XEM CHI TIẾT & SO SÁNH CV */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <FileDoneOutlined style={{ color: '#1677ff', fontSize: 18 }} />
            <Text strong style={{ fontSize: 16 }}>
              Thẩm Định CV — {selectedDraft?.fullName || selectedDraft?.userFullName} (#{selectedDraft?.id})
            </Text>
            {selectedDraft?.language && (
              <Tag color={selectedDraft.language === 'EN' ? 'green' : selectedDraft.language === 'JA' ? 'orange' : 'blue'} style={{ borderRadius: 4, marginLeft: 6 }}>
                {selectedDraft.languageFlag} {selectedDraft.languageLabel}
              </Tag>
            )}
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
            style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
            icon={<CheckOutlined />}
            onClick={() => handleOpenActionModal(selectedDraft?.id, 'APPROVE')}
          >
            Duyệt Chuyên Môn
          </Button>,
        ]}
      >
        {selectedDraft && (
          <div style={{ padding: '8px 0' }}>
            {/* Chuyển đổi chế độ xem: DIFF vs FULL */}
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

            {previewMode === 'DIFF' ? (
              <CvDiffViewer activeCv={activeCvForSelectedDraft} draftCv={selectedDraft} />
            ) : (
              <div>
                <CvHeader
                  fullName={selectedDraft.fullName || selectedDraft.userFullName}
                  avatarUrl={selectedDraft.avatarUrl}
                  title={selectedDraft.departmentName || user.departmentName || 'Phòng ban chưa cập nhật'}
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
            ? 'Xác Nhận Phê Duyệt Chuyên Môn'
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
              Bạn có chắc chắn muốn <Text strong style={{ color: '#16a34a' }}>Duyệt</Text> bản nháp CV này và chuyển tiếp cho phòng Nhân sự (HR) không?
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
                ? 'Nhập nhận xét chuyên môn (không bắt buộc)...'
                : 'Nhập lý do từ chối (bắt buộc)...'
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </Modal>

      <style>{`
        .row-rejected td {
          background-color: #fff2f0 !important;
        }
      `}</style>
    </div>
  );
};

export default TechLeadApprovalPage;
