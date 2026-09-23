import React, { useState, useEffect } from 'react';
import { Modal, Timeline, Tag, Typography, Spin, Empty, Alert } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CommentOutlined,
} from '@ant-design/icons';
import cvApi from '../api/cvApi';

const { Text, Paragraph } = Typography;

const CvApprovalHistoryModal = ({ open, onCancel, draftId, title = 'Lịch Sử Phê Duyệt Bản Nháp' }) => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (open && draftId) {
      fetchLogs();
    } else {
      setLogs([]);
      setErrorMsg('');
    }
  }, [open, draftId]);

  const fetchLogs = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await cvApi.getDraftLogs(draftId);
      const list = response.data || response.result || response || [];
      setLogs(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Lỗi khi tải lịch sử phê duyệt:', err);
      setErrorMsg(err.response?.data?.message || 'Không thể tải lịch sử phê duyệt.');
    } finally {
      setLoading(false);
    }
  };

  const getActionMeta = (action) => {
    switch (action) {
      case 'APPROVED_BY_TECH':
        return {
          color: 'green',
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          label: 'Tech Lead Đã Duyệt (Trạm 1)',
        };
      case 'REJECTED_BY_TECH':
        return {
          color: 'red',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          label: 'Tech Lead Từ Chối (Trạm 1)',
        };
      case 'APPROVED_BY_HR':
        return {
          color: 'blue',
          icon: <CheckCircleOutlined style={{ color: '#1677ff' }} />,
          label: 'HR Đã Duyệt Chót (Trạm 2)',
        };
      case 'REJECTED_BY_HR':
        return {
          color: 'red',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          label: 'HR Từ Chối (Trạm 2)',
        };
      default:
        return {
          color: 'default',
          icon: <ClockCircleOutlined />,
          label: action || 'Thao tác',
        };
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ClockCircleOutlined style={{ color: '#1677ff' }} />
          <span>{title} {draftId ? `— #DRAFT-${draftId}` : ''}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <div style={{ marginTop: 16, minHeight: 180 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin tip="Đang tải lịch sử thẩm định..." />
          </div>
        ) : errorMsg ? (
          <Alert message="Thông báo" description={errorMsg} type="info" showIcon />
        ) : logs.length === 0 ? (
          <Empty description="Bản nháp này chưa có ghi nhận lịch sử phê duyệt nào." />
        ) : (
          <Timeline
            mode="left"
            items={logs.map((log) => {
              const meta = getActionMeta(log.action);
              const dateStr = log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN') : 'N/A';

              return {
                dot: meta.icon,
                children: (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Tag color={meta.color}>{meta.label}</Tag>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dateStr}
                      </Text>
                    </div>

                    <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <UserOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
                      <Text strong style={{ fontSize: 13 }}>
                        {log.approverName || `User #${log.approverId || 'N/A'}`}
                      </Text>
                    </div>

                    {log.comment ? (
                      <div
                        style={{
                          marginTop: 6,
                          background: '#f9f9f9',
                          border: '1px solid #f0f0f0',
                          borderRadius: 6,
                          padding: '8px 12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                          <CommentOutlined style={{ color: '#8c8c8c', marginTop: 3 }} />
                          <Paragraph style={{ margin: 0, fontSize: 13, color: '#434343' }}>
                            {log.comment}
                          </Paragraph>
                        </div>
                      </div>
                    ) : (
                      <Text type="secondary" italic style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                        Không có ghi chú thêm
                      </Text>
                    )}
                  </div>
                ),
              };
            })}
          />
        )}
      </div>
    </Modal>
  );
};

export default CvApprovalHistoryModal;
