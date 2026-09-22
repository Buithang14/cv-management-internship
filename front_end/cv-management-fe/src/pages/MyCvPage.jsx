import React, { useState, useEffect } from 'react';
import {
  Card,
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
} from '@ant-design/icons';
import cvApi from '../api/cvApi';

// Import cac sub-component
import CvHeader from '../components/cv/CvHeader';
import PersonalInfoSection from '../components/cv/PersonalInfoSection';
import EducationSection from '../components/cv/EducationSection';
import ExperienceSection from '../components/cv/ExperienceSection';
import SkillsSection from '../components/cv/SkillsSection';

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

// ─── Component chinh ──────────────────────────────────────────────────────────
const MyCvPage = () => {
  const [loading, setLoading] = useState(false);
  const [cvData, setCvData] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftData, setDraftData] = useState(null);
  const [draftLoading, setDraftLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
  
  // State Lịch sử duyệt
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [approvalLogs, setApprovalLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState('');

  const [form] = Form.useForm();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchMyCv = async () => {
    setLoading(true);
    try {
      const response = await cvApi.getMyCv();
      const data = response.data || response.result || response;
      setCvData(data);
    } catch (error) {
      console.error('Lỗi lấy thông tin CV:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCv();
  }, []);

    const handleOpenLogs = async () => {
    setLogsModalOpen(true);
    setLoadingLogs(true);
    try {
      // Vì API getDraftLogs cần draftId, ta lấy draft hiện tại trước
      const response = await cvApi.initDraft();
      const draft = response.data || response.result || response;
      
      const logResp = await cvApi.getDraftLogs(draft.id);
      const logs = logResp.data || logResp.result || logResp || [];
      setApprovalLogs(Array.isArray(logs) ? logs : []);
    } catch (error) {
      console.error('Lỗi lấy lịch sử duyệt:', error);
      message.error('Không thể lấy lịch sử duyệt CV. Có thể bạn chưa từng nộp bản nháp nào!');
      setLogsModalOpen(false);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleOpenDraftModal = async () => {
    setDraftLoading(true);
    try {
      const response = await cvApi.initDraft();
      const draft = response.data || response.result || response;
      setDraftData(draft);

      const initialAvatar = draft.avatarUrl || cvData?.avatarUrl || '';
      setAvatarPreview(initialAvatar);

      // Parse JSON strings -> arrays cho Form.List
      const educations = parseJsonSafe(draft.educationsJson || cvData?.educationsJson);
      const experiences = parseJsonSafe(draft.experiencesJson || cvData?.experiencesJson);
      const skills = parseJsonSafe(draft.skillsJson || cvData?.skillsJson);

      form.setFieldsValue({
        fullName: draft.fullName || cvData?.fullName || '',
        avatarUrl: initialAvatar,
        phone: draft.phone || cvData?.phone || '',
        objective: draft.objective || cvData?.objective || '',
        summary: draft.summary || cvData?.summary || '',
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        message.error('Kích thước ảnh không được vượt quá 2MB!');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Url = uploadEvent.target.result;
        form.setFieldsValue({ avatarUrl: base64Url });
        setAvatarPreview(base64Url);
        message.success('Đã tải ảnh lên thành công!');
      };
      reader.readAsDataURL(file);
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
      fetchMyCv();
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
        return <Tag icon={<CheckCircleOutlined />} color="success">Đã duyệt (Active)</Tag>;
      case 'PENDING_TECH_LEAD':
        return <Tag icon={<ClockCircleOutlined />} color="warning">Chờ Tech Lead duyệt</Tag>;
      case 'PENDING_HR':
        return <Tag icon={<ClockCircleOutlined />} color="processing">Chờ HR duyệt</Tag>;
      case 'REJECTED':
      case 'REJECTED_BY_TECH':
      case 'REJECTED_BY_HR':
        return <Tag icon={<CloseCircleOutlined />} color="error">Bị từ chối</Tag>;
      default:
        return <Tag color="default">Chưa cập nhật</Tag>;
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
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* THANH TIEU DE & THAO TAC */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>HỒ SƠ CV CÁ NHÂN</Title>
          <Text type="secondary">Phiên bản hiện tại: v{cvData?.version || 1}</Text>
        </div>
        <Space>
          {cvData && renderStatusTag(cvData.overallStatus)}
          <Button
            icon={<HistoryOutlined />}
            onClick={handleOpenLogs}
          >
            Lịch sử duyệt
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleOpenDraftModal}
            loading={draftLoading}
          >
            Chỉnh Sửa / Tạo Bản Nháp
          </Button>
        </Space>
      </div>

      {/* KHUNG CV 2 COT */}
      {cvData ? (
        <Card
          bordered={true}
          style={{
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            borderRadius: 8,
            background: '#ffffff',
            padding: 12
          }}
        >
          <CvHeader
            fullName={cvData.fullName || user.username}
            avatarUrl={cvData.avatarUrl}
            title={user.departmentName || 'Phòng Công Nghệ Thông Tin'}
            summary={cvData.summary}
            objective={cvData.objective}
          />
          <Divider style={{ margin: '16px 0 24px 0' }} />
          <Row gutter={32}>
            <Col span={15}>
              <EducationSection educationsJson={cvData.educationsJson} />
              <ExperienceSection experiencesJson={cvData.experiencesJson} />
            </Col>
            <Col span={9} style={{ borderLeft: '1px solid #f0f0f0', paddingLeft: 24 }}>
              <PersonalInfoSection
                phone={cvData.phone}
                email={user.email}
                address="Việt Nam"
              />
              <SkillsSection skillsJson={cvData.skillsJson} />
              <div>
                <div style={{
                  borderBottom: '2px solid #1f1f1f',
                  paddingBottom: 4,
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: 1,
                  marginBottom: 12,
                  color: '#1f1f1f'
                }}>
                  THÔNG TIN BỔ SUNG
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Ngày tạo CV: {cvData.createdAt ? new Date(cvData.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      ) : (
        <Empty
          description="Bạn chưa có CV chính thức nào trong hệ thống. Bấm nút Soạn Thảo bên trên để tạo mới!"
          style={{ padding: 60, background: '#fff', borderRadius: 8 }}
        />
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
          <span style={{ fontSize: 16, fontWeight: 700 }}>
            ✏️ Soạn Thảo Bản Nháp CV
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={800}
        styles={{ body: { maxHeight: '75vh', overflowY: 'auto', paddingRight: 8 } }}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Huy
          </Button>,
          <Button key="save" icon={<SaveOutlined />} onClick={handleSaveDraft} loading={draftLoading}>
            Luu Nhap
          </Button>,
          <Button key="submit" type="primary" icon={<SendOutlined />} onClick={handleSubmitDraft} loading={submitting}>
            Nop Bai & Gui Duyet
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>

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
                  onClick={() => document.getElementById('avatar-file-input').click()}
                >
                  Chọn Ảnh Từ Máy Tính
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

          <Form.Item label="Mục tiêu nghề nghiệp & Tóm tắt bản thân" name="objective">
            <TextArea rows={3} placeholder="Mô tả mục tiêu nghề nghiệp, tóm tắt kinh nghiệm..." />
          </Form.Item>

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
                      fields.length > 1 && (
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
                          <Input placeholder="VD: ĐH Bách Khoa Hà Nội" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'degree']}
                          label="Bằng cấp / Chuyên ngành"
                          style={{ marginBottom: 8 }}
                        >
                          <Input placeholder="VD: Kỹ sư Công nghệ thông tin" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      {...restField}
                      name={[name, 'year']}
                      label="Năm học"
                      style={{ marginBottom: 0 }}
                    >
                      <Input placeholder="VD: 2019 - 2023" style={{ width: '50%' }} />
                    </Form.Item>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add({ school: '', degree: '', year: '' })}
                  icon={<PlusOutlined />}
                  style={{ width: '100%', marginBottom: 20, color: '#1677ff', borderColor: '#1677ff' }}
                >
                  + Thêm Trường Học
                </Button>
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
                      fields.length > 1 && (
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
                          <Input placeholder="VD: FPT Software" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'role']}
                          label="Vị trí / Chức danh"
                          style={{ marginBottom: 8 }}
                        >
                          <Input placeholder="VD: Java Backend Developer" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      {...restField}
                      name={[name, 'duration']}
                      label="Thời gian làm việc"
                      style={{ marginBottom: 8 }}
                    >
                      <Input placeholder="VD: 2 năm (01/2022 - 12/2023)" style={{ width: '60%' }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      label="Mô tả công việc"
                      style={{ marginBottom: 0 }}
                    >
                      <TextArea
                        rows={3}
                        placeholder="Mô tả nhiệm vụ, thành tích đạt được..."
                      />
                    </Form.Item>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add({ company: '', role: '', duration: '', description: '' })}
                  icon={<PlusOutlined />}
                  style={{ width: '100%', marginBottom: 20, color: '#fa8c16', borderColor: '#fa8c16' }}
                >
                  + Thêm Công Ty / Dự Án
                </Button>
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
                        background: '#f0f7ff',
                        border: '1px solid #91caff',
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
                      {fields.length > 1 && (
                        <DeleteOutlined
                          onClick={() => remove(name)}
                          style={{ color: '#ff4d4f', cursor: 'pointer', fontSize: 13 }}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="dashed"
                  onClick={() => add({ name: '', level: 'Trung bình' })}
                  icon={<PlusOutlined />}
                  style={{ width: '100%', marginBottom: 8, color: '#722ed1', borderColor: '#722ed1' }}
                >
                  + Thêm Kỹ Năng
                </Button>
              </>
            )}
          </Form.List>

        </Form>
      </Modal>
    </div>
  );
};

export default MyCvPage;

