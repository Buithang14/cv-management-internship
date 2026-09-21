import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Tag,
  Button,
  Descriptions,
  Spin,
  Modal,
  Form,
  Input,
  message,
  Space,
  Empty,
  Divider,
} from 'antd';
import {
  FileTextOutlined,
  EditOutlined,
  SendOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import cvApi from '../api/cvApi';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/**
 * Component Trang CV Cá Nhân dành cho User / Intern
 * Báo sát quy tắc nguyenTacDesign.txt: Tối giản, tập trung vào dữ liệu CV, hiển thị badge rõ ràng
 */
const MyCvPage = () => {
  const [loading, setLoading] = useState(false);
  const [cvData, setCvData] = useState(null);
  
  // State quản lý Modal bản nháp
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftData, setDraftData] = useState(null);
  const [draftLoading, setDraftLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form] = Form.useForm();

  // 1. Tải thông tin CV chính thức hiện tại (GET /api/v1/cvs/me)
  const fetchMyCv = async () => {
    setLoading(true);
    try {
      const response = await cvApi.getMyCv();
      const data = response.data || response.result || response;
      setCvData(data);
    } catch (error) {
      console.error('Lỗi lấy thông tin CV:', error);
      // Nếu chưa có CV -> cvData vẫn là null
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCv();
  }, []);

  // 2. Xử lý mở Modal Chỉnh sửa / Khởi tạo bản nháp (POST /api/v1/cv-drafts/init)
  const handleOpenDraftModal = async () => {
    setDraftLoading(true);
    try {
      const response = await cvApi.initDraft();
      const draft = response.data || response.result || response;
      setDraftData(draft);

      // Điền sẵn dữ liệu bản nháp vào Form
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

  // 3. Xử lý Lưu Nháp (PUT /api/v1/cv-drafts/{id})
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

  // 4. Xử lý Nộp Bài Gửi Duyệt (POST /api/v1/cv-drafts/{id}/submit)
  const handleSubmitDraft = async () => {
    try {
      // Lưu lại trước khi submit
      await handleSaveDraft();

      setSubmitting(true);
      await cvApi.submitDraft(draftData.id);

      message.success('Đã nộp bản nháp và gửi yêu cầu phê duyệt thành công!');
      setIsModalOpen(false);
      
      // Tải lại dữ liệu CV mới
      fetchMyCv();
    } catch (error) {
      console.error('Lỗi gửi duyệt:', error);
      message.error(error.response?.data?.message || 'Gửi duyệt bản nháp thất bại!');
    } finally {
      setSubmitting(false);
    }
  };

  // Hàm trả về Tag Trạng thái CV chuẩn semantic
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
        <Spin size="large" tip="Đang tải thông tin CV..." />
      </div>
    );
  }

  return (
    <div>
      {/* HEADER MÀN HÌNH */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>CV CÁ NHÂN</Title>
          <Text type="secondary">Xem thông tin CV hiện tại và khởi tạo bản nháp cập nhật</Text>
        </div>
        
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={handleOpenDraftModal}
          loading={draftLoading}
        >
          Soạn Thảo / Sửa CV Nháp
        </Button>
      </div>

      {/* NỘI DUNG CV CHÍNH THỨC */}
      {cvData ? (
        <Card bordered={true} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>{cvData.fullName || 'Chưa cập nhật họ tên'}</Title>
              <Text type="secondary">Phiên bản CV: v{cvData.version || 1}</Text>
            </div>
            <div>{renderStatusTag(cvData.overallStatus)}</div>
          </div>

          <Divider />

          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Số điện thoại">{cvData.phone || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Ngày cập nhật cuối">
              {cvData.updatedAt ? new Date(cvData.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">Mục Tiêu Nghề Nghiệp</Divider>
          <Paragraph>{cvData.objective || 'Chưa có thông tin mục tiêu nghề nghiệp.'}</Paragraph>

          <Divider orientation="left">Tóm Tắt Bản Thân</Divider>
          <Paragraph>{cvData.summary || 'Chưa có tóm tắt bản thân.'}</Paragraph>

          <Divider orientation="left">Kỹ Năng Kỹ Thuật (Skills)</Divider>
          <Paragraph>{cvData.skillsJson || 'Chưa cập nhật kỹ năng.'}</Paragraph>

          <Divider orientation="left">Học Vấn (Education)</Divider>
          <Paragraph>{cvData.educationsJson || 'Chưa cập nhật học vấn.'}</Paragraph>

          <Divider orientation="left">Kinh Nghiệm Làm Việc (Experience)</Divider>
          <Paragraph>{cvData.experiencesJson || 'Chưa cập nhật kinh nghiệm.'}</Paragraph>
        </Card>
      ) : (
        <Empty
          description="Bạn chưa có CV chính thức nào. Hãy bấm nút Soạn Thảo bên trên để tạo mới!"
          style={{ padding: 40 }}
        />
      )}

      {/* MODAL SOẠN THẢO BẢN NHÁP CV */}
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
          <Form.Item label="Họ và Tên" name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
            <Input placeholder="Nhập họ và tên đầy đủ" />
          </Form.Item>

          <Form.Item label="Số điện thoại" name="phone">
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item label="Mục tiêu nghề nghiệp" name="objective">
            <TextArea rows={3} placeholder="Mô tả mục tiêu nghề nghiệp của bạn..." />
          </Form.Item>

          <Form.Item label="Tóm tắt bản thân" name="summary">
            <TextArea rows={3} placeholder="Tóm tắt ngắn gọn về điểm mạnh..." />
          </Form.Item>

          <Form.Item label="Kỹ năng chuyên môn" name="skillsJson">
            <TextArea rows={3} placeholder="Ví dụ: Java, Spring Boot, ReactJS, MariaDB..." />
          </Form.Item>

          <Form.Item label="Học vấn" name="educationsJson">
            <TextArea rows={3} placeholder="Ví dụ: ĐH Bách Khoa - Ngành CNTT (2020-2024)..." />
          </Form.Item>

          <Form.Item label="Kinh nghiệm làm việc" name="experiencesJson">
            <TextArea rows={3} placeholder="Ví dụ: Thực tập sinh Java tại Công ty A..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyCvPage;
