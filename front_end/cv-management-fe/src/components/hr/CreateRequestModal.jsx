import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Radio,
  Select,
  Button,
  Space,
  Tag,
  Typography,
  message,
  Alert,
  Avatar,
  Divider,
} from 'antd';
import {
  SendOutlined,
  UserOutlined,
  TeamOutlined,
  ApartmentOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import hrApi from '../../api/hrApi';
import adminApi from '../../api/adminApi';

const { Text } = Typography;
const { Option } = Select;

const BATCH_NAME_SUGGESTIONS = [
  'Rà soát hồ sơ CV Quý 3/2026',
  'Cập nhật kỹ năng chuẩn bị cho Dự án mới',
  'Chuẩn hóa hồ sơ năng lực định kỳ năm 2026',
  'Bổ sung chứng chỉ và kinh nghiệm mới nhất',
];

const CreateRequestModal = ({ open, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [cvList, setCvList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // 'ALL' | 'DEPARTMENT' | 'CUSTOM'
  const [targetScope, setTargetScope] = useState('ALL');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // Tải danh sách nhân sự từ Kho CV và danh sách phòng ban
  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [cvsRes, deptsRes] = await Promise.allSettled([
        hrApi.getAllCvs(),
        adminApi.getAllDepartments(),
      ]);

      if (cvsRes.status === 'fulfilled') {
        const list = cvsRes.value?.data || cvsRes.value?.result || cvsRes.value || [];
        setCvList(Array.isArray(list) ? list : []);
      }

      if (deptsRes.status === 'fulfilled') {
        const dList = deptsRes.value?.data || deptsRes.value?.result || deptsRes.value || [];
        setDepartments(Array.isArray(dList) ? dList : []);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu khởi tạo modal phát lệnh:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadInitialData();
      form.resetFields();
      setTargetScope('ALL');
      setSelectedDepartmentId(null);
      setSelectedUserIds([]);
      // Mặc định chọn deadline 7 ngày tới lúc 17:00
      const defaultDeadline = dayjs().add(7, 'day').hour(17).minute(0).second(0);
      form.setFieldsValue({
        batchName: BATCH_NAME_SUGGESTIONS[0],
        deadline: defaultDeadline,
      });
    }
  }, [open]);

  // Danh sách các nhân viên duy nhất có trong hệ thống
  const employees = useMemo(() => {
    const map = new Map();
    cvList.forEach((cv) => {
      const uId = cv.userId;
      if (uId && !map.has(uId)) {
        map.set(uId, {
          userId: uId,
          fullName: cv.fullName || cv.userFullName || `User #${uId}`,
          phone: cv.phone,
          avatarUrl: cv.avatarUrl,
          departmentId: cv.departmentId,
          departmentName: cv.departmentName,
        });
      }
    });
    return Array.from(map.values());
  }, [cvList]);

  // Helper lọc nhân viên theo phòng ban
  const getDepartmentEmployees = (deptId) => {
    if (!deptId) return [];
    const deptObj = departments.find((d) => d.id === deptId);
    return employees.filter(
      (e) => e.departmentId === deptId || (deptObj && e.departmentName === deptObj.name)
    );
  };

  // Cập nhật selectedUserIds khi chọn 'ALL'
  useEffect(() => {
    if (targetScope === 'ALL') {
      setSelectedUserIds(employees.map((e) => e.userId));
    }
  }, [targetScope, employees]);

  const handleSelectAll = () => {
    setSelectedUserIds(employees.map((e) => e.userId));
  };

  const handleDeselectAll = () => {
    setSelectedUserIds([]);
  };

  const handleSubmit = async (values) => {
    let finalTargetUserIds = [];

    if (targetScope === 'ALL') {
      finalTargetUserIds = employees.map((e) => e.userId);
    } else if (targetScope === 'DEPARTMENT') {
      if (!selectedDepartmentId) {
        message.warning('Vui lòng chọn phòng ban cần phát lệnh!');
        return;
      }
      const deptEmps = getDepartmentEmployees(selectedDepartmentId);
      finalTargetUserIds = deptEmps.map((e) => e.userId);
      if (finalTargetUserIds.length === 0) {
        message.warning('Phòng ban được chọn chưa có nhân sự nào trong hệ thống!');
        return;
      }
    } else {
      finalTargetUserIds = selectedUserIds;
    }

    if (!finalTargetUserIds || finalTargetUserIds.length === 0) {
      message.error('Vui lòng chọn ít nhất 1 nhân viên để phát lệnh yêu cầu nộp CV!');
      return;
    }

    if (!values.deadline) {
      message.error('Vui lòng chọn thời hạn chót (Deadline)!');
      return;
    }

    if (values.deadline.isBefore(dayjs())) {
      message.error('Thời hạn chót (Deadline) phải là thời điểm trong tương lai!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        batchName: values.batchName.trim(),
        deadline: values.deadline.format('YYYY-MM-DDTHH:mm:ss'),
        targetUserIds: finalTargetUserIds,
        departmentId: targetScope === 'DEPARTMENT' ? selectedDepartmentId : undefined,
      };

      await hrApi.createUpdateRequests(payload);
      message.success(
        `Đã phát lệnh yêu cầu cập nhật CV thành công tới ${finalTargetUserIds.length} nhân sự!`
      );
      if (onSuccess) onSuccess();
      onCancel();
    } catch (error) {
      console.error('Lỗi khi phát lệnh cập nhật CV:', error);
      const errMsg = error.response?.data?.message || 'Phát lệnh yêu cầu cập nhật CV thất bại!';
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const disabledDate = (current) => {
    // Không cho chọn ngày trong quá khứ
    return current && current < dayjs().startOf('day');
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SendOutlined style={{ color: '#1677ff', fontSize: 18 }} />
          <Text strong style={{ fontSize: 16, color: '#0f172a' }}>
            Phát Lệnh Yêu Cầu Cập Nhật CV (HR Campaign)
          </Text>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={640}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
        {/* Tên đợt thu thập */}
        <Form.Item
          label={<span style={{ fontWeight: 600 }}>Tên Đợt Thu Thập / Chiến Dịch Rà Soát</span>}
          name="batchName"
          rules={[{ required: true, message: 'Vui lòng nhập tên đợt thu thập!' }]}
        >
          <Input placeholder="Ví dụ: Rà soát CV Quý 3/2026..." style={{ borderRadius: 6 }} />
        </Form.Item>

        {/* Gợi ý tên đợt nhanh */}
        <div style={{ marginTop: -14, marginBottom: 16 }}>
          <Text type="secondary" style={{ fontSize: 11.5, display: 'block', marginBottom: 4 }}>
            Mẫu tên phổ biến (nhấn để chọn nhanh):
          </Text>
          <Space wrap size={[6, 6]}>
            {BATCH_NAME_SUGGESTIONS.map((name, idx) => (
              <Tag
                key={idx}
                color="default"
                style={{ cursor: 'pointer', fontSize: 11.5, padding: '2px 8px', borderRadius: 4 }}
                onClick={() => form.setFieldsValue({ batchName: name })}
              >
                {name}
              </Tag>
            ))}
          </Space>
        </div>

        {/* Hạn chót (Deadline) */}
        <Form.Item
          label={<span style={{ fontWeight: 600 }}>Hạn Chót Nộp Hồ Sơ (Deadline)</span>}
          name="deadline"
          rules={[{ required: true, message: 'Vui lòng chọn ngày và giờ hạn chót!' }]}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            disabledDate={disabledDate}
            style={{ width: '100%', borderRadius: 6 }}
            placeholder="Chọn ngày và giờ hết hạn nộp bài"
          />
        </Form.Item>

        {/* Chọn phạm vi đối tượng nhận lệnh */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#0f172a' }}>
            Phạm Vi Đối Tượng Nhận Lệnh:
          </div>
          <Radio.Group
            value={targetScope}
            onChange={(e) => setTargetScope(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio value="ALL">
                <Space>
                  <TeamOutlined style={{ color: '#1677ff' }} />
                  <span style={{ fontWeight: 500 }}>Toàn bộ nhân sự trong công ty</span>
                  <Tag color="blue" style={{ borderRadius: 10 }}>
                    {employees.length} nhân viên
                  </Tag>
                </Space>
              </Radio>

              <Radio value="DEPARTMENT">
                <Space>
                  <ApartmentOutlined style={{ color: '#0891b2' }} />
                  <span style={{ fontWeight: 500 }}>Theo phòng ban cụ thể</span>
                  <Tag color="cyan" style={{ borderRadius: 10 }}>
                    {departments.length} phòng ban
                  </Tag>
                </Space>
              </Radio>

              <Radio value="CUSTOM">
                <Space>
                  <UserOutlined style={{ color: '#16a34a' }} />
                  <span style={{ fontWeight: 500 }}>Chọn đích danh từng nhân viên cụ thể</span>
                </Space>
              </Radio>
            </Space>
          </Radio.Group>
        </div>

        {/* Khu vực chọn phòng ban nếu chọn DEPARTMENT */}
        {targetScope === 'DEPARTMENT' && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: 14,
              marginBottom: 16,
            }}
          >
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ fontSize: 13, color: '#0f172a' }}>
                Chọn Phòng Ban Nhận Lệnh:
              </Text>
            </div>

            <Select
              placeholder="Chọn phòng ban cần phát lệnh..."
              value={selectedDepartmentId}
              onChange={(deptId) => setSelectedDepartmentId(deptId)}
              style={{ width: '100%', marginBottom: 10 }}
              allowClear
            >
              {departments.map((d) => {
                const count = getDepartmentEmployees(d.id).length;
                return (
                  <Option key={d.id} value={d.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 500 }}>{d.name}</span>
                      <Tag color="cyan" style={{ fontSize: 11, borderRadius: 10 }}>
                        {count} nhân viên
                      </Tag>
                    </div>
                  </Option>
                );
              })}
            </Select>

            {selectedDepartmentId && (
              <div style={{ fontSize: 12.5, color: '#475569' }}>
                {(() => {
                  const deptEmps = getDepartmentEmployees(selectedDepartmentId);
                  if (deptEmps.length === 0) {
                    return (
                      <span style={{ color: '#ea580c' }}>
                        Phòng ban này hiện chưa có nhân sự nào trong hệ thống.
                      </span>
                    );
                  }
                  return (
                    <div>
                      <span>Nhân sự sẽ nhận thông báo ({deptEmps.length}): </span>
                      <Space wrap size={[4, 4]} style={{ marginTop: 4 }}>
                        {deptEmps.map((emp) => (
                          <Tag key={emp.userId} color="blue" style={{ fontSize: 12 }}>
                            {emp.fullName}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Khu vực chọn nhân viên cụ thể nếu chọn CUSTOM */}
        {targetScope === 'CUSTOM' && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: 14,
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong style={{ fontSize: 13 }}>
                Danh sách nhân sự được chọn ({selectedUserIds.length} / {employees.length})
              </Text>
              <Space size={4}>
                <Button type="link" size="small" onClick={handleSelectAll} style={{ padding: 0 }}>
                  Chọn tất cả
                </Button>
                <Divider type="vertical" />
                <Button type="link" size="small" onClick={handleDeselectAll} style={{ padding: 0 }}>
                  Bỏ chọn tất cả
                </Button>
              </Space>
            </div>

            <Select
              mode="multiple"
              placeholder="Tìm kiếm và chọn nhân viên theo tên hoặc SĐT..."
              value={selectedUserIds}
              onChange={setSelectedUserIds}
              style={{ width: '100%' }}
              filterOption={(input, option) =>
                (option?.label || '').toLowerCase().includes(input.toLowerCase().trim())
              }
            >
              {employees.map((emp) => (
                <Option
                  key={emp.userId}
                  value={emp.userId}
                  label={`${emp.fullName} ${emp.phone || ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Space size={8}>
                      <Avatar size="small" icon={<UserOutlined />} src={emp.avatarUrl} />
                      <span style={{ fontWeight: 500 }}>{emp.fullName}</span>
                    </Space>
                    <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                      {emp.phone ? `SĐT: ${emp.phone}` : `User #${emp.userId}`}
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          </div>
        )}

        {/* Tóm tắt số lượng */}
        <div
          style={{
            padding: '10px 14px',
            background: '#eff6ff',
            borderRadius: 6,
            border: '1px solid #bfdbfe',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircleOutlined style={{ color: '#1677ff', fontSize: 16 }} />
            <Text style={{ fontSize: 13, color: '#1e3a8a' }}>
              Số lượng nhân sự sẽ nhận thông báo cập nhật CV:
            </Text>
          </div>
          <strong style={{ fontSize: 15, color: '#1677ff' }}>
            {(() => {
              if (targetScope === 'ALL') return employees.length;
              if (targetScope === 'DEPARTMENT') {
                return getDepartmentEmployees(selectedDepartmentId).length;
              }
              return selectedUserIds.length;
            })()}{' '}
            người
          </strong>
        </div>

        {/* Nút hành động */}
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={onCancel} style={{ borderRadius: 6 }}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={submitting}
              style={{ borderRadius: 6, fontWeight: 500 }}
            >
              Phát Lệnh Ngay
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateRequestModal;
