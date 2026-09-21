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
} from 'antd';
import {
  EditOutlined,
  SendOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import cvApi from '../api/cvApi';

// Import các component con đã bóc tách & helper parse JSON
import CvHeader from '../components/cv/CvHeader';
import PersonalInfoSection from '../components/cv/PersonalInfoSection';
import EducationSection from '../components/cv/EducationSection';
import ExperienceSection from '../components/cv/ExperienceSection';
import SkillsSection from '../components/cv/SkillsSection';

const { Title, Text } = Typography;
const { TextArea } = Input;

/**
 * Component Trang CV Cá Nhân (MyCvPage)
 * Đã Refactor theo đúng yêu cầu:
 * - Parse JSON an toàn bằng parseJsonField
 * - Tách thành các Component chuyên biệt (CvHeader, EducationSection, ExperienceSection...)
 * - Bố cục 2 cột TopCV chuẩn Doanh Nghiệp (Không hiển thị chuỗi JSON thô)
 */
const MyCvPage = () => {
  const [loading, setLoading] = useState(false);
  const [cvData, setCvData] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftData, setDraftData] = useState(null);
  const [draftLoading, setDraftLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const handleOpenDraftModal = async () => {
    setDraftLoading(true);
    try {
      const response = await cvApi.initDraft();
      const draft = response.data || response.result || response;
      setDraftData(draft);

      form.setFieldsValue({
        fullName: draft.fullName || cvData?.fullName || '',
        phone: draft.phone || cvData?.phone || '',
        objective: draft.objective || cvData?.objective || '',
        summary: draft.summary || cvData?.summary || '',
        skillsJson: draft.skillsJson || cvData?.skillsJson || '',
        educationsJson: draft.educationsJson || cvData?.educationsJson || '',
        experiencesJson: draft.experiencesJson || cvData?.experiencesJson || '',
      });

      setIsModalOpen(true);
    } catch (error) {
      console.error('Lỗi khởi tạo bản nháp:', error);
      message.error(error.response?.data?.message || 'Không thể khởi tạo bản nháp CV!');
    } finally {
      setDraftLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const values = await form.validateFields();
      setDraftLoading(true);

      const response = await cvApi.updateDraft(draftData.id, values);
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
      console.error('Lỗi gửi duyệt:', error);
      message.error(error.response?.data?.message || 'Gửi duyệt bản nháp thất bại!');
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
      {/* 1. THANH TIÊU ĐỀ THAO TÁC TRÊN CÙNG */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>HỒ SƠ CV CÁ NHÂN</Title>
          <Text type="secondary">Phiên bản hiện tại: v{cvData?.version || 1}</Text>
        </div>
        
        <Space>
          {cvData && renderStatusTag(cvData.overallStatus)}
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

      {/* 2. KHUNG CV DẠNG TỜ TÀI LIỆU TOPCV 2 CỘT */}
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
          {/* HEADER: AVATAR + HỌ TÊN + TÓM TẮT MỤC TIÊU */}
          <CvHeader
            fullName={cvData.fullName || user.username}
            avatarUrl={cvData.avatarUrl}
            title={`Nhân viên CV Management System (v${cvData.version || 1})`}
            summary={cvData.summary}
            objective={cvData.objective}
          />

          <Divider style={{ margin: '16px 0 24px 0' }} />

          {/* CƠ THỂ CV CHIA LÀM 2 CỘT (LEFT MAIN COLUMN - RIGHT SIDE COLUMN) */}
          <Row gutter={32}>
            {/* CỘT TRÁI CHÍNH (65% Width): HỌC VẤN & KINH NGHIỆM */}
            <Col span={15}>
              <EducationSection educationsJson={cvData.educationsJson} />
              <ExperienceSection experiencesJson={cvData.experiencesJson} />
            </Col>

            {/* CỘT PHẢI PHỤ (35% Width): THÔNG TIN CẢ NHÂN, KỸ NĂNG, BỔ SUNG */}
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

      {/* 3. MODAL SOẠN THẢO BẢN NHÁP CV */}
      <Modal
        title="Soạn Thảo Bản Nháp CV"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={720}
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Họ và Tên" name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                <Input placeholder="Nhập họ và tên đầy đủ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Số điện thoại" name="phone">
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mục tiêu nghề nghiệp & Tóm tắt bản thân" name="objective">
            <TextArea rows={3} placeholder="Mô tả mục tiêu nghề nghiệp, tóm tắt kinh nghiệm..." />
          </Form.Item>

          <Form.Item label="Học vấn (JSON hoặc Chuỗi text)" name="educationsJson">
            <TextArea rows={3} placeholder='Ví dụ JSON: [{"school":"ĐH Công Nghệ","degree":"Kỹ sư CNTT","year":"2020-2024"}]' />
          </Form.Item>

          <Form.Item label="Kinh nghiệm làm việc (JSON hoặc Chuỗi text)" name="experiencesJson">
            <TextArea rows={5} placeholder='Ví dụ JSON: [{"company":"Tech Corp","role":"Senior Dev","duration":"2 years","description":"• Phát triển API\n• Tối ưu DB"}]' />
          </Form.Item>

          <Form.Item label="Kỹ năng chuyên môn (JSON hoặc Chuỗi text)" name="skillsJson">
            <TextArea rows={3} placeholder='Ví dụ JSON: ["Java", "Spring Boot", "Docker", "Kubernetes", "AWS"]' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyCvPage;
