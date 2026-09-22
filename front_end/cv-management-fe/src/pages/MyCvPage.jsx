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
      console.error('Loi lay thong tin CV:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCv();
  }, []);

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
      console.error('Loi khoi tao ban nhap:', error);
      message.error(error.response?.data?.message || 'Khong the khoi tao ban nhap CV!');
    } finally {
      setDraftLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        message.error('Kich thuoc anh khong duoc vuot qua 2MB!');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Url = uploadEvent.target.result;
        form.setFieldsValue({ avatarUrl: base64Url });
        setAvatarPreview(base64Url);
        message.success('Da tai anh len thanh cong!');
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

      message.success('Da luu ban nhap thanh cong!');
    } catch (error) {
      console.error('Loi luu ban nhap:', error);
      message.error(error.response?.data?.message || 'Luu ban nhap that bai!');
    } finally {
      setDraftLoading(false);
    }
  };

  const handleSubmitDraft = async () => {
    try {
      await handleSaveDraft();
      setSubmitting(true);
      await cvApi.submitDraft(draftData.id);
      message.success('Da nop ban nhap va gui yeu cau phe duyet thanh cong!');
      setIsModalOpen(false);
      fetchMyCv();
    } catch (error) {
      console.error('Loi nop ban nhap:', error);
      message.error(error.response?.data?.message || 'Nop ban nhap that bai!');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusTag = (status) => {
    switch (status) {
      case 'APPROVED':
        return <Tag icon={<CheckCircleOutlined />} color="success">Da duyet (Active)</Tag>;
      case 'PENDING_TECH_LEAD':
        return <Tag icon={<ClockCircleOutlined />} color="warning">Cho Tech Lead duyet</Tag>;
      case 'PENDING_HR':
        return <Tag icon={<ClockCircleOutlined />} color="processing">Cho HR duyet</Tag>;
      case 'REJECTED':
      case 'REJECTED_BY_TECH':
      case 'REJECTED_BY_HR':
        return <Tag icon={<CloseCircleOutlined />} color="error">Bi tu choi</Tag>;
      default:
        return <Tag color="default">Chua cap nhat</Tag>;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" tip="Dang tai du lieu CV..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* THANH TIEU DE & THAO TAC */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>HO SO CV CA NHAN</Title>
          <Text type="secondary">Phien ban hien tai: v{cvData?.version || 1}</Text>
        </div>
        <Space>
          {cvData && renderStatusTag(cvData.overallStatus)}
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleOpenDraftModal}
            loading={draftLoading}
          >
            Chinh Sua / Tao Ban Nhap
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
            title={user.departmentName || 'Phong Cong Nghe Thong Tin'}
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
                address="Viet Nam"
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
                  THONG TIN BO SUNG
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Ngay tao CV: {cvData.createdAt ? new Date(cvData.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      ) : (
        <Empty
          description="Ban chua co CV chinh thuc nao trong he thong. Bam nut Soan Thao ben tren de tao moi!"
          style={{ padding: 60, background: '#fff', borderRadius: 8 }}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════
           MODAL SOAN THAO BAN NHAP CV — DYNAMIC FORM
      ══════════════════════════════════════════════════════════════ */}
      <Modal
        title={
          <span style={{ fontSize: 16, fontWeight: 700 }}>
            ✏️ Soan Thao Ban Nhap CV
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
          <Form.Item label="Anh Dai Dien Avatar" name="avatarUrl">
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
                  Chon Anh Tu May Tinh
                </Button>
                <div style={{ marginTop: 8 }}>
                  <Input
                    placeholder="Hoac dan duong dan anh URL..."
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
              <Form.Item label="Ho va Ten" name="fullName" rules={[{ required: true, message: 'Vui long nhap ho ten!' }]}>
                <Input placeholder="Nhap ho va ten day du" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="So dien thoai" name="phone">
                <Input placeholder="Nhap so dien thoai" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Muc tieu nghe nghiep & Tom tat ban than" name="objective">
            <TextArea rows={3} placeholder="Mo ta muc tieu nghe nghiep, tom tat kinh nghiem..." />
          </Form.Item>

          {/* ══════════════════════════════════════════════════════════
               HOC VAN — Dynamic Form List
          ═══════════════════════════════════════════════════════════ */}
          <SectionLabel icon={<BookOutlined />}>Hoc Van</SectionLabel>

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
                    title={<span style={{ fontSize: 13, color: '#666' }}>Truong hoc #{name + 1}</span>}
                  >
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'school']}
                          label="Ten truong"
                          rules={[{ required: true, message: 'Nhap ten truong!' }]}
                          style={{ marginBottom: 8 }}
                        >
                          <Input placeholder="VD: DH Bach Khoa Ha Noi" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'degree']}
                          label="Bang cap / Chuyen nganh"
                          style={{ marginBottom: 8 }}
                        >
                          <Input placeholder="VD: Ky su Cong nghe thong tin" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      {...restField}
                      name={[name, 'year']}
                      label="Nam hoc"
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
                  + Them Truong Hoc
                </Button>
              </>
            )}
          </Form.List>

          {/* ══════════════════════════════════════════════════════════
               KINH NGHIEM LAM VIEC — Dynamic Form List
          ═══════════════════════════════════════════════════════════ */}
          <SectionLabel icon={<BankOutlined />}>Kinh Nghiem Lam Viec</SectionLabel>

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
                    title={<span style={{ fontSize: 13, color: '#666' }}>Cong ty #{name + 1}</span>}
                  >
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'company']}
                          label="Ten cong ty"
                          rules={[{ required: true, message: 'Nhap ten cong ty!' }]}
                          style={{ marginBottom: 8 }}
                        >
                          <Input placeholder="VD: FPT Software" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'role']}
                          label="Vi tri / Chuc danh"
                          style={{ marginBottom: 8 }}
                        >
                          <Input placeholder="VD: Java Backend Developer" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      {...restField}
                      name={[name, 'duration']}
                      label="Thoi gian lam viec"
                      style={{ marginBottom: 8 }}
                    >
                      <Input placeholder="VD: 2 nam (01/2022 - 12/2023)" style={{ width: '60%' }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      label="Mo ta cong viec"
                      style={{ marginBottom: 0 }}
                    >
                      <TextArea
                        rows={3}
                        placeholder="Mo ta nhiem vu, thanh tich dat duoc..."
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
                  + Them Cong Ty / Du An
                </Button>
              </>
            )}
          </Form.List>

          {/* ══════════════════════════════════════════════════════════
               KY NANG — Dynamic Form List
          ═══════════════════════════════════════════════════════════ */}
          <SectionLabel icon={<ToolOutlined />}>Ky Nang Chuyen Mon</SectionLabel>

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
                          placeholder="Ten ky nang (VD: Java, Spring Boot)"
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
                            { value: 'Co ban', label: 'Co ban' },
                            { value: 'Trung binh', label: 'Trung binh' },
                            { value: 'Kha', label: 'Kha' },
                            { value: 'Thanh thao', label: 'Thanh thao' },
                            { value: 'Chuyen gia', label: 'Chuyen gia' },
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
                  onClick={() => add({ name: '', level: 'Trung binh' })}
                  icon={<PlusOutlined />}
                  style={{ width: '100%', marginBottom: 8, color: '#722ed1', borderColor: '#722ed1' }}
                >
                  + Them Ky Nang
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
