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
  Avatar,
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
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import cvApi from '../api/cvApi';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/**
 * Component Trang CV Cá Nhân (MyCvPage)
 * Thiết kế chuẩn Tờ Khai CV TopCV 2 cột theo đúng hình ảnh mẫu người dùng cung cấp
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
          <Text type="secondary">Định dạng mẫu CV doanh nghiệp chuẩn 2 cột</Text>
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
          <div style={{ display: 'flex', gap: 24, marginBottom: 24, alignItems: 'flex-start' }}>
            {/* Ảnh Đại Diện Avatar */}
            <div style={{ flexShrink: 0 }}>
              <Avatar 
                shape="square" 
                size={140} 
                src={cvData.avatarUrl} 
                icon={<UserOutlined />}
                style={{ borderRadius: 6, border: '1px solid #d9d9d9', backgroundColor: '#fafafa' }}
              />
            </div>

            {/* Thông tin Tiêu đề & Tóm tắt */}
            <div style={{ flexGrow: 1 }}>
              <Title level={2} style={{ margin: 0, color: '#1f1f1f', fontWeight: 700 }}>
                {cvData.fullName || user.username || 'Chưa nhập họ tên'}
              </Title>
              <Text strong style={{ fontSize: 16, color: '#595959', display: 'block', marginBottom: 12 }}>
                Nhân viên CV Management System (v{cvData.version || 1})
              </Text>

              {/* Box Mục tiêu & Tóm tắt */}
              <div style={{ background: '#f5f5f5', padding: '12px 16px', borderRadius: 6, borderLeft: '4px solid #1677ff' }}>
                <Text style={{ fontSize: 13, color: '#262626' }}>
                  {cvData.objective || cvData.summary || 'Chưa cập nhật tóm tắt bản thân và mục tiêu nghề nghiệp.'}
                </Text>
              </div>
            </div>
          </div>

          <Divider style={{ margin: '16px 0 24px 0' }} />

          {/* CƠ THỂ CV CHIA LÀM 2 CỘT (LEFT MAIN COLUMN - RIGHT SIDE COLUMN) */}
          <Row gutter={32}>
            {/* CỘT TRÁI CHÍNH (65% Width): HỌC VẤN & KINH NGHIỆM */}
            <Col span={15}>
              {/* PHẦN HỌC VẤN */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ 
                  background: '#1f1f1f', 
                  color: '#ffffff', 
                  padding: '6px 12px', 
                  fontWeight: 700, 
                  fontSize: 14, 
                  letterSpacing: 1, 
                  marginBottom: 12,
                  display: 'inline-block',
                  minWidth: 160
                }}>
                  HỌC VẤN
                </div>
                <div style={{ paddingLeft: 4 }}>
                  <Text style={{ whiteSpace: 'pre-line', fontSize: 14, color: '#262626' }}>
                    {cvData.educationsJson || 'Chưa có thông tin học vấn.'}
                  </Text>
                </div>
              </div>

              {/* PHẦN KINH NGHIỆM LÀM VIỆC */}
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
                  KINH NGHIỆM LÀM VIỆC
                </div>
                <div style={{ paddingLeft: 4 }}>
                  <Paragraph style={{ whiteSpace: 'pre-line', fontSize: 14, color: '#262626', lineHeight: 1.6 }}>
                    {cvData.experiencesJson || 'Chưa có thông tin kinh nghiệm làm việc.'}
                  </Paragraph>
                </div>
              </div>
            </Col>

            {/* CỘT PHẢI PHỤ (35% Width): THÔNG TIN CẢ NHÂN, KỸ NĂNG, CHỨNG CHỈ */}
            <Col span={9} style={{ borderLeft: '1px solid #f0f0f0', paddingLeft: 24 }}>
              {/* THÔNG TIN CẢ NHÂN */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ 
                  borderBottom: '2px solid #1f1f1f', 
                  paddingBottom: 4, 
                  fontWeight: 700, 
                  fontSize: 14, 
                  letterSpacing: 1, 
                  marginBottom: 12,
                  color: '#1f1f1f'
                }}>
                  THÔNG TIN CẢ NHÂN
                </div>
                <Space direction="vertical" size={8} style={{ width: '100%', fontSize: 13 }}>
                  <div><PhoneOutlined style={{ marginRight: 8, color: '#595959' }} /> {cvData.phone || 'Chưa nhập SĐT'}</div>
                  <div><MailOutlined style={{ marginRight: 8, color: '#595959' }} /> {user.email || 'email@company.com'}</div>
                  <div><EnvironmentOutlined style={{ marginRight: 8, color: '#595959' }} /> Việt Nam</div>
                </Space>
              </div>

              {/* KỸ NĂNG */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ 
                  borderBottom: '2px solid #1f1f1f', 
                  paddingBottom: 4, 
                  fontWeight: 700, 
                  fontSize: 14, 
                  letterSpacing: 1, 
                  marginBottom: 12,
                  color: '#1f1f1f'
                }}>
                  KỸ NĂNG
                </div>
                <Paragraph style={{ whiteSpace: 'pre-line', fontSize: 13, color: '#262626', lineHeight: 1.6 }}>
                  {cvData.skillsJson || 'Chưa nhập kỹ năng.'}
                </Paragraph>
              </div>

              {/* TỔNG QUAN HỒ SƠ */}
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

          <Form.Item label="Học vấn (Đơn vị, Chuyên ngành, Niên khóa...)" name="educationsJson">
            <TextArea rows={3} placeholder="Đại học TopCV - Chuyên ngành Kế toán (10/2016 - 10/2020)..." />
          </Form.Item>

          <Form.Item label="Kinh nghiệm làm việc (Tên công ty, Vị trí, Thời gian, Chi tiết công việc...)" name="experiencesJson">
            <TextArea rows={5} placeholder="Công ty A TopCV - Nhân viên Kế toán (01/2022 - Hiện tại)..." />
          </Form.Item>

          <Form.Item label="Kỹ năng chuyên môn" name="skillsJson">
            <TextArea rows={3} placeholder="Nắm vững nghiệp vụ kế toán, Am hiểu quy định pháp lý, Kỹ năng phân tích..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyCvPage;
