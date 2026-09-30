import React, { useState, useEffect } from 'react';
import {
  Card,
  Alert,
  Typography,
  Tag,
  Button,
  Spin,
  Modal,
  Form,
  Input,
  message,
  Row,
  Col,
  Space,
  Empty,
  Divider,
  Avatar,
  Select,
  Timeline,
  Radio,
  Tooltip,
  Badge,
} from 'antd';
import {
  EditOutlined,
  SendOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UploadOutlined,
  UserOutlined,
  PlusOutlined,
  HistoryOutlined,
  DeleteOutlined,
  BookOutlined,
  ToolOutlined,
  BankOutlined,
  GlobalOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import cvApi from '../api/cvApi';

// Import cac sub-component
import CvHeader from '../components/cv/CvHeader';
import PersonalInfoSection from '../components/cv/PersonalInfoSection';
import EducationSection from '../components/cv/EducationSection';
import ExperienceSection from '../components/cv/ExperienceSection';
import SkillsSection from '../components/cv/SkillsSection';
import ObjectiveSection from '../components/cv/ObjectiveSection';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ─── Helper: parse JSON string an toan sang array ─────────────────────────────
const parseJsonSafe = (jsonStr) => {
  if (!jsonStr) return [];
  try {
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// ─── Section label style ──────────────────────────────────────────────────────
const SectionLabel = ({ icon, children }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    fontWeight: 700, fontSize: 15, color: '#1a1a2e',
    borderBottom: '2px solid #e8f4ff', paddingBottom: 8, marginBottom: 16, marginTop: 8,
  }}>
    <span style={{ color: '#1677ff', fontSize: 16 }}>{icon}</span>
    {children}
  </div>
);

// ─── Các ngôn ngữ hỗ trợ ───────────────────────────────────────────────────
const LANGUAGES = [
  { key: 'VI', label: 'Tiếng Việt', flag: '🇻🇳', isMaster: true },
  { key: 'EN', label: 'English', flag: '🇬🇧', isMaster: false },
  { key: 'JA', label: '日本語', flag: '🇯🇵', isMaster: false },
];

// ─── Component chinh ──────────────────────────────────────────────────────────
const MyCvPage = () => {
  const [loading, setLoading] = useState(false);
  const [cvData, setCvData] = useState(null);

  // State ngôn ngữ hiện tại
  const [selectedLanguage, setSelectedLanguage] = useState('VI');
  const [activeLanguages, setActiveLanguages] = useState(['VI']);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftData, setDraftData] = useState(null);
  const [draftLoading, setDraftLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // State Lịch sử duyệt
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [approvalLogs, setApprovalLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // State yêu cầu cập nhật CV
  const [updateRequests, setUpdateRequests] = useState([]);

  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [form] = Form.useForm();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchUpdateRequests = async () => {
    try {
      const response = await cvApi.getMyUpdateRequests();
      const list = response.data || response.result || response || [];
      setUpdateRequests(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Lỗi lấy danh sách yêu cầu cập nhật:', error);
    }
  };

  const fetchActiveLanguages = async () => {
    try {
      const res = await cvApi.getMyActiveLanguages();
      const list = res.data || res.result || res || [];
      setActiveLanguages(Array.isArray(list) ? list : ['VI']);
    } catch (err) {
      console.error('Lỗi lấy danh sách ngôn ngữ active:', err);
    }
  };

  const fetchMyCv = async (lang = selectedLanguage) => {
    setLoading(true);
    try {
      const response = await cvApi.getMyCv(lang);
      const data = response.data || response.result || response;
      setCvData(data);
    } catch (error) {
      // 404 có nghĩa là ngôn ngữ này chưa có CV active được duyệt
      console.log('Chưa có CV active cho ngôn ngữ:', lang);
      setCvData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    fetchMyCv(lang);
  };

  useEffect(() => {
    fetchMyCv('VI');
    fetchActiveLanguages();
    fetchUpdateRequests();
  }, []);

  const handleOpenLogs = async () => {
    setLogsModalOpen(true);
    setLoadingLogs(true);
    try {
      // Lấy lịch sử phê duyệt theo ngôn ngữ đang chọn
      const logResp = await cvApi.getMyDraftLogs(selectedLanguage);
      const logs = logResp.data || logResp.result || logResp || [];
      setApprovalLogs(Array.isArray(logs) ? logs : []);
    } catch (error) {
      console.error('Lỗi lấy lịch sử duyệt:', error);
      message.error(error.response?.data?.message || 'Không thể lấy lịch sử duyệt CV.');
      setLogsModalOpen(false);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleOpenDraftModal = async () => {
    setDraftLoading(true);
    try {
      const response = await cvApi.initDraft(selectedLanguage);
      const draft = response.data || response.result || response;
      setDraftData(draft);

      const initialAvatar = draft.avatarUrl || cvData?.avatarUrl || '';
      setAvatarPreview(initialAvatar);

      // Parse JSON strings -> arrays cho Form.List
      const educations = parseJsonSafe(draft.educationsJson || cvData?.educationsJson);
      const experiences = parseJsonSafe(draft.experiencesJson || cvData?.experiencesJson);
      const skills = parseJsonSafe(draft.skillsJson || cvData?.skillsJson);

      form.setFieldsValue({
        fullName: (draft.fullName || cvData?.fullName || '').replace(/\s*\(Senior\)/gi, '').trim(),
        avatarUrl: initialAvatar,
        phone: draft.phone || cvData?.phone || '',
        summary: draft.summary || '',
        objective: draft.objective || '',
        // Dynamic lists
        educations: educations.length > 0 ? educations : [{ school: '', degree: '', year: '' }],
        experiences: experiences.length > 0 ? experiences : [{ company: '', role: '', duration: '', description: '' }],
        skills: skills.length > 0 ? skills.map(s => (typeof s === 'string' ? { name: s, level: 'Trung bình' } : s)) : [{ name: '', level: 'Trung bình' }],
      });

      setIsModalOpen(true);
    } catch (error) {
      console.error('Lỗi khởi tạo bản nháp:', error);
      message.error(error.response?.data?.message || 'Không thể khởi tạo bản nháp CV!');
    } finally {
      setDraftLoading(false);
    }
  };

  // Đồng bộ lại khung cấu trúc từ CV Tiếng Việt
  const handleSyncSkeleton = async () => {
    if (!draftData?.id) return;
    try {
      setDraftLoading(true);
      const res = await cvApi.syncSkeleton(draftData.id);
      const updated = res.data || res.result || res;
      setDraftData(updated);

      const educations = parseJsonSafe(updated.educationsJson);
      const experiences = parseJsonSafe(updated.experiencesJson);
      const skills = parseJsonSafe(updated.skillsJson);

      form.setFieldsValue({
        educations,
        experiences,
        skills: skills.map(s => (typeof s === 'string' ? { name: s, level: 'Trung bình' } : s)),
      });

      message.success('Đã đồng bộ lại khung cấu trúc từ CV Tiếng Việt thành công!');
    } catch (err) {
      console.error('Lỗi đồng bộ:', err);
      message.error(err.response?.data?.message || 'Không thể đồng bộ cấu trúc!');
    } finally {
      setDraftLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        message.error('Kích thước ảnh không được vượt quá 5MB!');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      setAvatarUploading(true);
      try {
        const response = await cvApi.uploadAvatar(formData);
        const resData = response.data || response.result || response;
        const uploadedUrl = resData.url || resData;

        form.setFieldsValue({ avatarUrl: uploadedUrl });
        setAvatarPreview(uploadedUrl);
        message.success('Đã tải ảnh đại diện lên máy chủ thành công!');
      } catch (error) {
        console.error('Lỗi tải ảnh lên:', error);
        message.error(error.response?.data?.message || 'Tải ảnh lên máy chủ thất bại!');
      } finally {
        setAvatarUploading(false);
        e.target.value = '';
      }
    }
  };

  // Convert form values -> payload cho backend (array -> JSON string)
  const buildPayload = (values) => {
    const { educations, experiences, skills, ...rest } = values;

    const educationsJson = JSON.stringify(
      (educations || []).filter(e => e && e.school)
    );
    const experiencesJson = JSON.stringify(
      (experiences || []).filter(e => e && e.company)
    );
    const skillsJson = JSON.stringify(
      (skills || []).filter(s => s && s.name).map(s => s.name)
    );

    return { ...rest, educationsJson, experiencesJson, skillsJson };
  };

  const handleSaveDraft = async () => {
    try {
      const values = await form.validateFields();
      setDraftLoading(true);

      const payload = buildPayload(values);
      const response = await cvApi.updateDraft(draftData.id, payload);
      const updatedDraft = response.data || response.result || response;
      setDraftData(updatedDraft);

      message.success('Đã lưu bản nháp thành công!');
    } catch (error) {
      console.error('Lỗi lưu bản nháp:', error);
      message.error(error.response?.data?.message || 'Lưu bản nháp thất bại!');
    } finally {
      setDraftLoading(false);
    }
  };

  const handleSubmitDraft = async () => {
    try {
      await handleSaveDraft();
      setSubmitting(true);
      await cvApi.submitDraft(draftData.id);
      message.success('Đã nộp bản nháp và gửi yêu cầu phê duyệt thành công!');
      setIsModalOpen(false);
      fetchMyCv(selectedLanguage);
      fetchActiveLanguages();
    } catch (error) {
      console.error('Lỗi nộp bản nháp:', error);
      message.error(error.response?.data?.message || 'Nộp bản nháp thất bại!');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusTag = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'UPDATED':
        return <Tag icon={<CheckCircleOutlined />} color="success" style={{ borderRadius: 4 }}>Đã cập nhật</Tag>;
      case 'NOT_UPDATED':
        return <Tag icon={<ClockCircleOutlined />} color="warning" style={{ borderRadius: 4 }}>Chưa cập nhật</Tag>;
      case 'REQUEST_CANCELED':
        return <Tag style={{ borderRadius: 4, color: '#64748b' }}>Đã hủy</Tag>;
      case 'PENDING_TECH_LEAD':
        return <Tag icon={<ClockCircleOutlined />} color="warning" style={{ borderRadius: 4 }}>Chờ Tech Lead duyệt</Tag>;
      case 'PENDING_HR':
        return <Tag icon={<ClockCircleOutlined />} color="processing" style={{ borderRadius: 4 }}>Chờ HR duyệt</Tag>;
      case 'REJECTED':
      case 'REJECTED_BY_TECH':
      case 'REJECTED_BY_HR':
        return <Tag icon={<CloseCircleOutlined />} color="error" style={{ borderRadius: 4 }}>Bị từ chối</Tag>;
      default:
        return <Tag style={{ borderRadius: 4, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0' }}>Chưa cập nhật</Tag>;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" tip="Đang tải dữ liệu CV..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 40 }}>
      {/* ─── THANH CHUYỂN ĐỔI NGÔN NGỮ (LOCALIZATION TABS) ─── */}
      <div style={{
        background: '#fff',
        borderRadius: 10,
        padding: '12px 18px',
        marginBottom: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
            <GlobalOutlined style={{ color: '#1677ff', fontSize: 16 }} />
            Ngôn ngữ CV:
          </span>
          <Radio.Group
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            buttonStyle="solid"
          >
            {LANGUAGES.map((lang) => {
              const hasCv = activeLanguages.includes(lang.key);
              return (
                <Radio.Button key={lang.key} value={lang.key} style={{ padding: '0 16px' }}>
                  <span style={{ marginRight: 6 }}>{lang.flag}</span>
                  {lang.label}
                  {lang.isMaster && (
                    <Tag color="blue" style={{ marginLeft: 6, fontSize: 10, lineHeight: '16px', padding: '0 4px', borderRadius: 4 }}>
                      Gốc
                    </Tag>
                  )}
                  {hasCv && !lang.isMaster && (
                    <Tag color="green" style={{ marginLeft: 6, fontSize: 10, lineHeight: '16px', padding: '0 4px', borderRadius: 4 }}>
                      Đã có
                    </Tag>
                  )}
                </Radio.Button>
              );
            })}
          </Radio.Group>
        </div>

      </div>

      {/* THANH TIEU DE & THAO TAC */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
            HỒ SƠ CV CÁ NHÂN ({LANGUAGES.find(l => l.key === selectedLanguage)?.label})
          </h2>
          <span style={{ fontSize: 13.5, color: '#64748b' }}>
            Phiên bản hiện tại: {cvData?.version ? `v${cvData.version}` : 'Chưa ban hành'} • Ngôn ngữ: {LANGUAGES.find(l => l.key === selectedLanguage)?.flag} {LANGUAGES.find(l => l.key === selectedLanguage)?.label}
          </span>
        </div>
        <Space size="middle">
          {cvData && renderStatusTag(cvData.overallStatus)}
          <Button
            icon={<HistoryOutlined />}
            onClick={handleOpenLogs}
            style={{ fontSize: 13.5 }}
          >
            Lịch sử duyệt
          </Button>
          <Tooltip
            title={selectedLanguage !== 'VI' && !activeLanguages.includes('VI') ? '⚠️ Bạn cần có CV Tiếng Việt chính thức trước khi soạn bản dịch.' : null}
          >
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleOpenDraftModal}
              loading={draftLoading}
              disabled={selectedLanguage !== 'VI' && !activeLanguages.includes('VI')}
              style={{ fontSize: 13.5 }}
            >
              {cvData ? 'Chỉnh Sửa / Tạo Bản Nháp' : 'Soạn Thảo Bản Dịch Mới'}
            </Button>
          </Tooltip>
        </Space>
      </div>

      {/* BANNER THÔNG BÁO YÊU CẦU CẬP NHẬT TỪ HR (NẾU CÓ) */}
      {(() => {
        const activeReq = updateRequests.find(r => r.status === 'PENDING');
        if (!activeReq) return null;
        const deadlineDate = activeReq.deadline ? new Date(activeReq.deadline) : null;
        const isOverdue = deadlineDate && deadlineDate < new Date();
        return (
          <Alert
            type={isOverdue ? 'error' : 'warning'}
            showIcon
            style={{ marginBottom: 20, borderRadius: 6, border: isOverdue ? '1px solid #fecaca' : '1px solid #fde68a' }}
            message={
              <Text strong style={{ fontSize: 14 }}>
                {isOverdue ? '⚠️ Cảnh Báo Trễ Hạn: ' : '📢 Yêu Cầu Cập Nhật CV: '}
                {activeReq.batchName || 'Đợt Cập Nhật CV Định Kỳ'}
              </Text>
            }
            description={
              <div style={{ marginTop: 4 }}>
                <div>
                  Người yêu cầu: <b>{activeReq.requestedByName || 'Phòng Nhân Sự (HR)'}</b>
                  {deadlineDate && (
                    <span> — Hạn chót nộp bài: <b style={{ color: isOverdue ? '#dc2626' : '#d97706' }}>{deadlineDate.toLocaleString('vi-VN')} {isOverdue && '(Đã quá hạn)'}</b></span>
                  )}
                </div>
                <div style={{ marginTop: 8 }}>
                  <Button
                    type="primary"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={handleOpenDraftModal}
                    loading={draftLoading}
                  >
                    Soạn Thảo & Nộp CV Ngay
                  </Button>
                </div>
              </div>
            }
          />
        );
      })()}

      {/* KHUNG CV 2 COT */}
      {cvData ? (
        <Card
          bordered={true}
          style={{
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
            borderRadius: 10,
            borderColor: '#e2e8f0',
            background: '#ffffff',
            padding: 24
          }}
        >
          <CvHeader
            fullName={cvData.fullName || user.fullName || user.username}
            avatarUrl={cvData.avatarUrl}
            title={cvData.departmentName || user.departmentName || 'Phòng ban chưa cập nhật'}
            summary={cvData.summary}
            objective={cvData.objective}
          />
          <Divider style={{ margin: '18px 0 24px 0', borderColor: '#e2e8f0' }} />
          <Row gutter={36}>
            <Col span={15}>
              <ObjectiveSection objective={cvData.objective} summary={cvData.summary} />
              <EducationSection educationsJson={cvData.educationsJson} />
              <ExperienceSection experiencesJson={cvData.experiencesJson} />
            </Col>
            <Col span={9} style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: 24 }}>
              <PersonalInfoSection
                phone={cvData.phone}
                email={cvData.email || user.email}
              />
              <SkillsSection skillsJson={cvData.skillsJson} />
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
                <div style={{ fontSize: 14.5, marginBottom: 10, display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>Ngôn ngữ: </span>
                  <span style={{ color: '#334155', fontWeight: 500, marginLeft: 6 }}>
                    {cvData.languageFlag || LANGUAGES.find(l => l.key === selectedLanguage)?.flag} {cvData.languageLabel || LANGUAGES.find(l => l.key === selectedLanguage)?.label}
                  </span>
                </div>
                <div style={{ fontSize: 14.5, marginBottom: 10, display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>Phiên bản CV: </span>
                  <span style={{ color: '#334155', fontWeight: 400, marginLeft: 4 }}>v{cvData.version || 1}</span>
                </div>
                <div style={{ fontSize: 14.5, marginBottom: 10, display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>Ngày tạo hồ sơ: </span>
                  <span style={{ color: '#334155', fontWeight: 400, marginLeft: 4 }}>{cvData.createdAt ? new Date(cvData.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                </div>
                {cvData.updatedAt && (
                  <div style={{ fontSize: 14.5, display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>Cập nhật lần cuối: </span>
                    <span style={{ color: '#334155', fontWeight: 400, marginLeft: 4 }}>{new Date(cvData.updatedAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Card>
      ) : (
        <Card
          style={{
            borderRadius: 10,
            textAlign: 'center',
            padding: '48px 24px',
            marginBottom: 20,
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            border: '1px dashed #cbd5e1'
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 12 }}>
            {LANGUAGES.find(l => l.key === selectedLanguage)?.flag || '🌐'}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
            Chưa có CV chính thức bằng {LANGUAGES.find(l => l.key === selectedLanguage)?.label}
          </h3>
          <p style={{ color: '#64748b', maxWidth: 540, margin: '0 auto 24px', fontSize: 14, lineHeight: 1.6 }}>
            {selectedLanguage === 'VI'
              ? 'Bạn chưa có hồ sơ CV nào trong hệ thống. Nhấn nút bên dưới để tạo bản nháp đầu tiên.'
              : `Hệ thống sẽ tự động sao chép cấu trúc công ty, trường học và mốc thời gian từ CV Tiếng Việt gốc sang. Bạn chỉ việc dịch chức danh, mô tả công việc và mục tiêu sang ${LANGUAGES.find(l => l.key === selectedLanguage)?.label}.`}
          </p>
          <Tooltip
            title={selectedLanguage !== 'VI' && !activeLanguages.includes('VI') ? '⚠️ Bạn cần hoàn thành CV Tiếng Việt trước khi soạn bản dịch.' : null}
          >
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="large"
              onClick={handleOpenDraftModal}
              loading={draftLoading}
              disabled={selectedLanguage !== 'VI' && !activeLanguages.includes('VI')}
              style={{ borderRadius: 6, paddingLeft: 24, paddingRight: 24 }}
            >
              {selectedLanguage === 'VI' ? 'Tạo Bản Nháp Tiếng Việt' : `Soạn Thảo Bản Dịch (${LANGUAGES.find(l => l.key === selectedLanguage)?.label})`}
            </Button>
          </Tooltip>
        </Card>
      )}

      {/* ═══════════════════════════════════════════════════════════
           MODAL LỊCH SỬ DUYỆT (APPROVAL LOGS)
      ══════════════════════════════════════════════════════════════ */}
      <Modal
        title={
          <span style={{ fontSize: 16, fontWeight: 700 }}>
            <HistoryOutlined /> Lịch Sử Phê Duyệt CV
          </span>
        }
        open={logsModalOpen}
        onCancel={() => setLogsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setLogsModalOpen(false)}>
            Đóng
          </Button>
        ]}
      >
        {loadingLogs ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin tip="Đang tải lịch sử..." />
          </div>
        ) : approvalLogs.length === 0 ? (
          <Empty description="Chưa có lịch sử phê duyệt nào cho bản nháp này." />
        ) : (
          <Timeline
            mode="left"
            style={{ marginTop: 20 }}
            items={approvalLogs.map(log => {
              let color = 'gray';
              let actionText = log.action;
              if (log.action?.includes('REJECT')) {
                color = 'red';
                actionText = 'Bị Từ Chối';
              } else if (log.action?.includes('APPROVE')) {
                color = 'green';
                actionText = 'Đã Duyệt';
              } else if (log.action === 'SUBMITTED') {
                color = 'blue';
                actionText = 'Nộp Bản Nháp';
              }

              return {
                color: color,
                children: (
                  <div>
                    <div style={{ fontWeight: 600, color: color === 'gray' ? '#333' : color }}>
                      {actionText} - {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </div>
                    {log.approverName && (
                      <div style={{ fontSize: 13, color: '#555' }}>
                        Người duyệt: <b>{log.approverName}</b>
                      </div>
                    )}
                    {log.comment && (
                      <div style={{ 
                        marginTop: 4, padding: 8, background: '#f5f5f5', 
                        borderRadius: 4, fontSize: 13, fontStyle: 'italic',
                        borderLeft: `3px solid ${color}`
                      }}>
                        "{log.comment}"
                      </div>
                    )}
                  </div>
                )
              }
            })}
          />
        )}
      </Modal>

      {/* ═══════════════════════════════════════════════════════════
           MODAL SOAN THAO BAN NHAP CV — DYNAMIC FORM
      ══════════════════════════════════════════════════════════════ */}
      <Modal
        title={
          <span style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>✏️ Soạn Thảo Bản Nháp CV</span>
            <Tag color={selectedLanguage === 'VI' ? 'blue' : selectedLanguage === 'EN' ? 'green' : 'orange'} style={{ borderRadius: 4, fontWeight: 600, fontSize: 13, padding: '2px 8px' }}>
              {LANGUAGES.find(l => l.key === selectedLanguage)?.flag} {LANGUAGES.find(l => l.key === selectedLanguage)?.label}
              {selectedLanguage === 'VI' ? ' (Bản Gốc)' : ' (Bản Dịch)'}
            </Tag>
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={800}
        styles={{ body: { maxHeight: '75vh', overflowY: 'auto', paddingRight: 8 } }}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Hủy
          </Button>,
          <Button key="save" icon={<SaveOutlined />} onClick={handleSaveDraft} loading={draftLoading}>
            Lưu Nháp
          </Button>,
          <Button key="submit" type="primary" icon={<SendOutlined />} onClick={handleSubmitDraft} loading={submitting}>
            Nộp Bài & Gửi Duyệt
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {/* ── BANNER DỊCH THUẬT NẾU ĐANG Ở BẢN DỊCH (EN/JA) ── */}
          {selectedLanguage !== 'VI' && (
            <Alert
              message={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <strong>Đang soạn bản dịch {LANGUAGES.find(l => l.key === selectedLanguage)?.label}:</strong> Số lượng công ty, trường học và mốc thời gian được cố định theo bản Tiếng Việt gốc.
                  </div>
                  <Button
                    size="small"
                    type="primary"
                    ghost
                    icon={<SyncOutlined />}
                    onClick={handleSyncSkeleton}
                    loading={draftLoading}
                  >
                    Đồng bộ lại từ Tiếng Việt
                  </Button>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16, borderRadius: 8 }}
            />
          )}

          {/* ── AVATAR ─────────────────────────────────────────────── */}
          <Form.Item label="Ảnh Đại Diện Avatar" name="avatarUrl">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar
                shape="square"
                size={80}
                src={avatarPreview}
                icon={<UserOutlined />}
                style={{ borderRadius: 6, border: '1px solid #d9d9d9', backgroundColor: '#fafafa', flexShrink: 0 }}
              />
              <div style={{ flexGrow: 1 }}>
                <input
                  type="file"
                  accept="image/*"
                  id="avatar-file-input"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <Button
                  icon={<UploadOutlined />}
                  loading={avatarUploading}
                  onClick={() => document.getElementById('avatar-file-input').click()}
                >
                  {avatarUploading ? 'Đang Tải Ảnh Lên...' : 'Chọn Ảnh Từ Máy Tính'}
                </Button>
                <div style={{ marginTop: 8 }}>
                  <Input
                    placeholder="Hoặc dán đường dẫn ảnh URL..."
                    value={avatarPreview}
                    onChange={(e) => {
                      const val = e.target.value;
                      form.setFieldsValue({ avatarUrl: val });
                      setAvatarPreview(val);
                    }}
                  />
                </div>
              </div>
            </div>
          </Form.Item>

          {/* ── THONG TIN CO BAN ───────────────────────────────────── */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Họ và Tên" name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                <Input placeholder="Nhap Họ và Tên day du" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Số điện thoại" name="phone">
                <Input placeholder="Nhap Số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Tóm tắt bản thân (Summary)" name="summary">
                <TextArea rows={3} placeholder="Mô tả tóm tắt về năng lực, điểm mạnh và kinh nghiệm nổi bật..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Mục tiêu nghề nghiệp (Objective)" name="objective">
                <TextArea rows={3} placeholder="Mô tả mục tiêu nghề nghiệp ngắn hạn và dài hạn..." />
              </Form.Item>
            </Col>
          </Row>

          {/* ══════════════════════════════════════════════════════════
               HOC VAN — Dynamic Form List
          ═══════════════════════════════════════════════════════════ */}
          <SectionLabel icon={<BookOutlined />}>Học Vấn</SectionLabel>

          <Form.List name="educations">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    size="small"
                    style={{
                      marginBottom: 12,
                      background: '#fafeff',
                      border: '1px solid #d6e8ff',
                      borderRadius: 8,
                    }}
                    extra={
                      fields.length > 1 && selectedLanguage === 'VI' && (
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
                      )
                    }
                    title={<span style={{ fontSize: 13, color: '#666' }}>Trường học #{name + 1}</span>}
                  >
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'school']}
                          label="Tên trường"
                          rules={[{ required: true, message: 'Nhập tên trường!' }]}
                          style={{ marginBottom: 8 }}
                        >
                          <Input placeholder="VD: ĐH Bách Khoa Hà Nội" disabled={selectedLanguage !== 'VI'} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'degree']}
                          label="Bằng cấp / Chuyên ngành"
                          style={{ marginBottom: 8 }}
                        >
                          <Input placeholder={selectedLanguage === 'VI' ? "VD: Kỹ sư Công nghệ thông tin" : "Dịch bằng cấp / chuyên ngành..."} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      {...restField}
                      name={[name, 'year']}
                      label="Năm học"
                      style={{ marginBottom: 0 }}
                    >
                      <Input placeholder="VD: 2019 - 2023" style={{ width: '50%' }} disabled={selectedLanguage !== 'VI'} />
                    </Form.Item>
                  </Card>
                ))}
                {selectedLanguage === 'VI' ? (
                  <Button
                    type="dashed"
                    onClick={() => add({ school: '', degree: '', year: '' })}
                    icon={<PlusOutlined />}
                    style={{ width: '100%', marginBottom: 20, color: '#1677ff', borderColor: '#1677ff' }}
                  >
                    + Thêm Trường Học
                  </Button>
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, marginBottom: 20, background: '#f8fafc', padding: 8, borderRadius: 6 }}>
                    ℹ️ Danh sách trường học & năm học được đồng bộ cố định từ bản Tiếng Việt gốc.
                  </div>
                )}
              </>
            )}
          </Form.List>

          {/* ══════════════════════════════════════════════════════════
               KINH NGHIEM LAM VIEC — Dynamic Form List
          ═══════════════════════════════════════════════════════════ */}
          <SectionLabel icon={<BankOutlined />}>Kinh Nghiệm Làm Việc</SectionLabel>

          <Form.List name="experiences">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    size="small"
                    style={{
                      marginBottom: 12,
                      background: '#fffcfa',
                      border: '1px solid #ffe7ba',
                      borderRadius: 8,
                    }}
                    extra={
                      fields.length > 1 && selectedLanguage === 'VI' && (
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
                      )
                    }
                    title={<span style={{ fontSize: 13, color: '#666' }}>Công ty #{name + 1}</span>}
                  >
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'company']}
                          label="Tên công ty"
                          rules={[{ required: true, message: 'Nhập tên công ty!' }]}
                          style={{ marginBottom: 8 }}
                        >
                          <Input placeholder="VD: FPT Software" disabled={selectedLanguage !== 'VI'} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'role']}
                          label="Vị trí / Chức danh"
                          style={{ marginBottom: 8 }}
                        >
                          <Input placeholder={selectedLanguage === 'VI' ? "VD: Java Backend Developer" : "Dịch chức danh (VD: Software Engineer)..."} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      {...restField}
                      name={[name, 'duration']}
                      label="Thời gian làm việc"
                      style={{ marginBottom: 8 }}
                    >
                      <Input placeholder="VD: 2 năm (01/2022 - 12/2023)" style={{ width: '60%' }} disabled={selectedLanguage !== 'VI'} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      label="Mô tả công việc"
                      style={{ marginBottom: 0 }}
                    >
                      <TextArea
                        rows={3}
                        placeholder={selectedLanguage === 'VI' ? "Mô tả nhiệm vụ, thành tích đạt được..." : "Dịch nội dung mô tả công việc sang " + LANGUAGES.find(l => l.key === selectedLanguage)?.label + "..."}
                      />
                    </Form.Item>
                  </Card>
                ))}
                {selectedLanguage === 'VI' ? (
                  <Button
                    type="dashed"
                    onClick={() => add({ company: '', role: '', duration: '', description: '' })}
                    icon={<PlusOutlined />}
                    style={{ width: '100%', marginBottom: 20, color: '#fa8c16', borderColor: '#fa8c16' }}
                  >
                    + Thêm Công Ty / Dự Án
                  </Button>
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, marginBottom: 20, background: '#f8fafc', padding: 8, borderRadius: 6 }}>
                    ℹ️ Danh sách công ty & thời gian làm việc được đồng bộ cố định từ bản Tiếng Việt gốc.
                  </div>
                )}
              </>
            )}
          </Form.List>

          {/* ══════════════════════════════════════════════════════════
               KY NANG — Dynamic Form List
          ═══════════════════════════════════════════════════════════ */}
          <SectionLabel icon={<ToolOutlined />}>Kỹ Năng Chuyên Môn</SectionLabel>

          <Form.List name="skills">
            {(fields, { add, remove }) => (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {fields.map(({ key, name, ...restField }) => (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: selectedLanguage !== 'VI' ? '#f8fafc' : '#f0f7ff',
                        border: `1px solid ${selectedLanguage !== 'VI' ? '#e2e8f0' : '#91caff'}`,
                        borderRadius: 6,
                        padding: '4px 8px',
                        minWidth: 220,
                        flex: '1 1 220px',
                      }}
                    >
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        style={{ margin: 0, flex: 1 }}
                      >
                        <Input
                          placeholder="Tên kỹ năng (VD: Java, Spring Boot)"
                          size="small"
                          bordered={false}
                          disabled={selectedLanguage !== 'VI'}
                          style={{ background: 'transparent', padding: '0 4px' }}
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'level']}
                        style={{ margin: 0, width: 110 }}
                      >
                        <Select
                          size="small"
                          bordered={false}
                          disabled={selectedLanguage !== 'VI'}
                          style={{ width: 110 }}
                          options={[
                            { value: 'Cơ bản', label: 'Cơ bản' },
                            { value: 'Trung bình', label: 'Trung bình' },
                            { value: 'Khá', label: 'Khá' },
                            { value: 'Thành thạo', label: 'Thành thạo' },
                            { value: 'Chuyên gia', label: 'Chuyên gia' },
                          ]}
                        />
                      </Form.Item>
                      {fields.length > 1 && selectedLanguage === 'VI' && (
                        <DeleteOutlined
                          onClick={() => remove(name)}
                          style={{ color: '#ff4d4f', cursor: 'pointer', fontSize: 13 }}
                        />
                      )}
                    </div>
                  ))}
                </div>
                {selectedLanguage === 'VI' ? (
                  <Button
                    type="dashed"
                    onClick={() => add({ name: '', level: 'Trung bình' })}
                    icon={<PlusOutlined />}
                    style={{ width: '100%', marginBottom: 8 }}
                  >
                    + Thêm Kỹ Năng
                  </Button>
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, marginBottom: 8, background: '#f8fafc', padding: 8, borderRadius: 6 }}>
                    ℹ️ Danh sách kỹ năng được đồng bộ cố định từ bản Tiếng Việt gốc.
                  </div>
                )}
              </>
            )}
          </Form.List>

        </Form>
      </Modal>
    </div>
  );
};

export default MyCvPage;

