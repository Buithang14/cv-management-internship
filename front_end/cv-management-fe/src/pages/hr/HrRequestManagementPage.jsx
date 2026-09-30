import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Card,
  Typography,
  Tag,
  Button,
  Space,
  message,
  Popconfirm,
  Row,
  Col,
  Input,
  Select,
  Empty,
  Progress,
  Segmented,
  Drawer,
} from 'antd';
import {
  StopOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  SendOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import hrApi from '../../api/hrApi';
import CreateRequestModal from '../../components/hr/CreateRequestModal';

const { Title, Text } = Typography;
const { Option } = Select;

const HrRequestManagementPage = () => {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // 'BATCH' (Theo đợt) | 'FLAT' (Từng lệnh chi tiết)
  const [viewMode, setViewMode] = useState('BATCH');

  // Modal Phát Lệnh Mới
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Drawer xem chi tiết một đợt thu thập
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await hrApi.getAllUpdateRequests();
      const list = response.data || response.result || response || [];
      setRequests(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách yêu cầu cập nhật CV:', error);
      message.error('Không thể lấy danh sách yêu cầu cập nhật CV từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancelRequest = async (requestId) => {
    try {
      await hrApi.cancelUpdateRequest(requestId);
      message.success('Đã hủy lệnh yêu cầu cập nhật CV thành công!');
      fetchRequests();
    } catch (error) {
      console.error('Lỗi khi hủy yêu cầu:', error);
      message.error(error.response?.data?.message || 'Không thể hủy yêu cầu này.');
    }
  };

  // Hủy toàn bộ lệnh PENDING trong một đợt thu thập
  const handleCancelBatchPending = async (batchItems) => {
    const pendingItems = batchItems.filter((i) => i.status === 'PENDING');
    if (pendingItems.length === 0) return;

    try {
      await Promise.all(pendingItems.map((item) => hrApi.cancelUpdateRequest(item.id)));
      message.success(`Đã hủy thành công ${pendingItems.length} lệnh đang chờ trong đợt này!`);
      if (drawerOpen) setDrawerOpen(false);
      fetchRequests();
    } catch (err) {
      console.error('Lỗi khi hủy hàng loạt lệnh:', err);
      message.error('Có lỗi xảy ra khi hủy các lệnh trong đợt.');
    }
  };

  // Sao chép danh sách nhân viên chưa nộp trong đợt để HR gửi nhắc nhở qua Chat/Email
  const handleCopyUnfinishedEmployees = (batchItems) => {
    const pendingNames = batchItems
      .filter((i) => i.status === 'PENDING')
      .map((i) => i.targetUserName || `User #${i.targetUserId}`)
      .join(', ');

    if (!pendingNames) {
      message.info('Tất cả nhân sự trong đợt này đã hoàn thành nộp CV!');
      return;
    }

    navigator.clipboard.writeText(pendingNames);
    message.success(`Đã sao chép danh sách nhân sự chưa nộp vào Clipboard!`);
  };

  // Thống kê tổng quan
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === 'PENDING').length;
    const completed = requests.filter((r) => r.status === 'COMPLETED').length;
    const canceled = requests.filter((r) => r.status === 'CANCELED').length;
    return { total, pending, completed, canceled };
  }, [requests]);

  // Gom nhóm danh sách theo Đợt thu thập (Batch Grouping)
  const batchGroups = useMemo(() => {
    const map = new Map();

    requests.forEach((req) => {
      const batchName = req.batchName || 'Đợt cập nhật định kỳ';
      const createdDate = req.createdAt ? req.createdAt.slice(0, 10) : '';
      const key = `${batchName}__${createdDate}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          batchName,
          createdAt: req.createdAt,
          deadline: req.deadline,
          requestedByName: req.requestedByName,
          items: [],
          total: 0,
          pending: 0,
          completed: 0,
          canceled: 0,
        });
      }

      const group = map.get(key);
      group.items.push(req);
      group.total += 1;
      if (req.status === 'PENDING') group.pending += 1;
      else if (req.status === 'COMPLETED') group.completed += 1;
      else if (req.status === 'CANCELED') group.canceled += 1;
    });

    const list = Array.from(map.values()).map((g) => {
      const percent = g.total > 0 ? Math.round((g.completed / g.total) * 100) : 0;
      const isLate = g.deadline && new Date(g.deadline) < new Date() && g.pending > 0;
      return { ...g, percent, isLate };
    });

    // Lọc theo từ khóa tìm kiếm
    if (!searchKeyword.trim()) return list;
    const lower = searchKeyword.toLowerCase().trim();
    return list.filter((g) => g.batchName.toLowerCase().includes(lower));
  }, [requests, searchKeyword]);

  // Danh sách phẳng đã lọc
  const filteredFlatRequests = useMemo(() => {
    return requests.filter((req) => {
      if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
      if (searchKeyword.trim()) {
        const lower = searchKeyword.toLowerCase().trim();
        const userName = (req.targetUserName || '').toLowerCase();
        const batch = (req.batchName || '').toLowerCase();
        const idStr = String(req.id || '');
        const requester = (req.requestedByName || '').toLowerCase();
        return (
          userName.includes(lower) ||
          batch.includes(lower) ||
          idStr.includes(lower) ||
          requester.includes(lower)
        );
      }
      return true;
    });
  }, [requests, searchKeyword, statusFilter]);

  const handleOpenBatchDetails = (batch) => {
    setSelectedBatch(batch);
    setDrawerOpen(true);
  };

  const renderStatusTag = (status) => {
    switch (status) {
      case 'PENDING':
        return <Tag icon={<ClockCircleOutlined />} color="processing">Đang Chờ Xử Lý</Tag>;
      case 'COMPLETED':
        return <Tag icon={<CheckCircleOutlined />} color="success">Đã Hoàn Thành</Tag>;
      case 'CANCELED':
        return <Tag icon={<CloseCircleOutlined />} color="default">Đã Hủy Lệnh</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  // Cột cho BẢNG THEO ĐỢT (BATCH VIEW)
  const batchColumns = [
    {
      title: 'Tên Đợt Thu Thập / Chiến Dịch',
      dataIndex: 'batchName',
      key: 'batchName',
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>
            {name}
          </div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            Phát bởi: {record.requestedByName || 'HR Team'} • Ngày phát: {record.createdAt ? new Date(record.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'Hạn Chót Nộp (Deadline)',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 180,
      render: (deadline, record) => {
        if (!deadline) return <Text type="secondary">Không giới hạn</Text>;
        const d = new Date(deadline);
        return (
          <div>
            <div style={{ fontSize: 13, fontWeight: record.isLate ? 600 : 400, color: record.isLate ? '#dc2626' : '#0f172a' }}>
              {d.toLocaleDateString('vi-VN')} {d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </div>
            {record.isLate && (
              <Tag color="error" style={{ margin: 0, padding: '0 4px', fontSize: 11 }}>
                Đã quá hạn
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Quy Mô Đối Tượng',
      key: 'total',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <strong style={{ color: '#0f172a', fontSize: 13.5 }}>
          {record.total} nhân sự
        </strong>
      ),
    },
    {
      title: 'Tiến Độ Nộp CV',
      key: 'progress',
      width: 220,
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
            <span style={{ color: '#16a34a', fontWeight: 600 }}>{record.completed} đã nộp</span>
            <span style={{ color: '#fa8c16' }}>{record.pending} chưa nộp</span>
          </div>
          <Progress
            percent={record.percent}
            size="small"
            strokeColor={record.percent === 100 ? '#16a34a' : (record.isLate ? '#dc2626' : '#1677ff')}
          />
        </div>
      ),
    },
    {
      title: 'Trạng Thái Đợt',
      key: 'status',
      width: 150,
      align: 'center',
      render: (_, record) => {
        if (record.completed === record.total) {
          return <Tag color="success">Đã hoàn thành 100%</Tag>;
        }
        if (record.isLate) {
          return <Tag color="error">Quá hạn nộp</Tag>;
        }
        return <Tag color="processing">Đang thu thập</Tag>;
      },
    },
    {
      title: 'Thao Tác',
      key: 'action',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleOpenBatchDetails(record)}
          style={{ fontSize: 12.5, borderRadius: 4 }}
        >
          Chi Tiết Đợt
        </Button>
      ),
    },
  ];

  // Cột cho BẢNG CHI TIẾT TỪNG LỆNH (FLAT VIEW)
  const flatColumns = [
    {
      title: 'Mã Lệnh',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id) => <Tag color="blue">#REQ-{id}</Tag>,
    },
    {
      title: 'Nhân Viên Nhận Lệnh',
      dataIndex: 'targetUserName',
      key: 'targetUserName',
      render: (text, record) => (
        <div>
          <Text strong style={{ color: '#1677ff', fontSize: 13.5 }}>
            {text || 'Nhân viên'}
          </Text>
          {record.targetUserId && (
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              User ID: #{record.targetUserId}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Tên Đợt Thu Thập',
      dataIndex: 'batchName',
      key: 'batchName',
      render: (text) => <Text style={{ fontWeight: 500 }}>{text || 'Đợt cập nhật định kỳ'}</Text>,
    },
    {
      title: 'Hạn Chót (Deadline)',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 180,
      render: (deadline, record) => {
        if (!deadline) return <Text type="secondary">Không giới hạn</Text>;
        const d = new Date(deadline);
        const isLate = d < new Date() && record.status === 'PENDING';
        return (
          <div>
            <Text type={isLate ? 'danger' : undefined} strong={isLate} style={{ fontSize: 13 }}>
              {d.toLocaleDateString('vi-VN')} {d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isLate && (
              <Tag color="error" style={{ marginLeft: 6, padding: '0 4px', fontSize: 10 }}>
                Quá hạn
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (createdAt) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {createdAt ? new Date(createdAt).toLocaleDateString('vi-VN') : 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: renderStatusTag,
    },
    {
      title: 'Thao Tác',
      key: 'action',
      width: 90,
      align: 'center',
      render: (_, record) => {
        if (record.status !== 'PENDING') return <Text type="secondary">—</Text>;
        return (
          <Popconfirm
            title="Xác nhận hủy yêu cầu cập nhật?"
            description="Nhân viên sẽ không cần hoàn thành yêu cầu cập nhật này nữa."
            onConfirm={() => handleCancelRequest(record.id)}
            okText="Hủy lệnh"
            cancelText="Đóng"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<StopOutlined />} size="small" style={{ borderRadius: 4 }}>
              Hủy
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <div>
      {/* ─── Header & Primary Action ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
            Quản Lý Lệnh Yêu Cầu Cập Nhật CV
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Theo dõi tiến độ nộp hồ sơ theo đợt chiến dịch và điều phối thu thập CV toàn doanh nghiệp.
          </Text>
        </div>

        <Space>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => setCreateModalOpen(true)}
            style={{ fontWeight: 500, borderRadius: 6 }}
          >
            Phát Lệnh Cập Nhật CV Mới
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchRequests} loading={loading} style={{ borderRadius: 6 }}>
            Làm mới
          </Button>
        </Space>
      </div>

      {/* ─── Hàng Thẻ Thống Kê Chỉ Số Lệnh ─── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: 16 }}>
            <Text type="secondary" style={{ fontSize: 12.5, fontWeight: 500 }}>Tổng Số Lệnh Đã Phát</Text>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1677ff', marginTop: 4 }}>
              {stats.total} <span style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>lệnh</span>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: 16 }}>
            <Text type="secondary" style={{ fontSize: 12.5, fontWeight: 500 }}>Đang Chờ Nhân Viên Nộp</Text>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fa8c16', marginTop: 4 }}>
              {stats.pending} <span style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>chưa nộp</span>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: 16 }}>
            <Text type="secondary" style={{ fontSize: 12.5, fontWeight: 500 }}>Đã Hoàn Thành Duyệt</Text>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#16a34a', marginTop: 4 }}>
              {stats.completed} <span style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>hồ sơ</span>
            </div>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: 16 }}>
            <Text type="secondary" style={{ fontSize: 12.5, fontWeight: 500 }}>Lệnh Đã Hủy Bỏ</Text>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#64748b', marginTop: 4 }}>
              {stats.canceled} <span style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>lệnh</span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ─── Thanh Lọc & Chuyển Chế Độ Xem ─── */}
      <Card
        bordered={false}
        style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        bodyStyle={{ padding: '12px 16px' }}
      >
        <Row gutter={[16, 12]} align="middle" justify="space-between">
          <Col xs={24} md={14}>
            <Space wrap size="middle">
              <Segmented
                value={viewMode}
                onChange={setViewMode}
                options={[
                  { label: 'Theo Đợt Thu Thập', value: 'BATCH', icon: <AppstoreOutlined /> },
                  { label: 'Danh Sách Chi Tiết Từng Lệnh', value: 'FLAT', icon: <UnorderedListOutlined /> },
                ]}
              />

              <Input
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                placeholder={
                  viewMode === 'BATCH'
                    ? 'Tìm theo tên đợt thu thập...'
                    : 'Tìm nhân viên, tên đợt, mã lệnh...'
                }
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                allowClear
                style={{ width: 240, borderRadius: 6 }}
              />

              {viewMode === 'FLAT' && (
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: 170 }}
                >
                  <Option value="ALL">Tất cả trạng thái</Option>
                  <Option value="PENDING">Đang chờ xử lý</Option>
                  <Option value="COMPLETED">Đã hoàn thành</Option>
                  <Option value="CANCELED">Đã hủy</Option>
                </Select>
              )}
            </Space>
          </Col>

          <Col xs={24} md={10} style={{ textAlign: 'right' }}>
            <Text type="secondary" style={{ fontSize: 12.5 }}>
              {viewMode === 'BATCH'
                ? `Hiển thị ${batchGroups.length} đợt phát lệnh thu thập`
                : `Hiển thị ${filteredFlatRequests.length} / ${requests.length} lệnh`}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* ─── Bảng Dữ Liệu Chính ─── */}
      <Card
        bordered={false}
        style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        bodyStyle={{ padding: 0 }}
      >
        {viewMode === 'BATCH' ? (
          <Table
            columns={batchColumns}
            dataSource={batchGroups}
            rowKey="key"
            loading={loading}
            pagination={{
              pageSize: 8,
              showSizeChanger: true,
              pageSizeOptions: ['8', '16', '32'],
              showTotal: (total) => `Tổng số ${total} đợt thu thập CV`,
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    searchKeyword
                      ? 'Không tìm thấy đợt thu thập nào phù hợp với từ khóa.'
                      : 'Hiện tại chưa có đợt phát lệnh thu thập CV nào được tạo.'
                  }
                />
              ),
            }}
          />
        ) : (
          <Table
            columns={flatColumns}
            dataSource={filteredFlatRequests}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `Tổng số ${total} lệnh yêu cầu`,
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không tìm thấy yêu cầu cập nhật CV nào phù hợp bộ lọc."
                />
              ),
            }}
          />
        )}
      </Card>

      {/* ─── Drawer Chi Tiết Một Đợt Thu Thập ─── */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SendOutlined style={{ color: '#1677ff' }} />
            <span>Chi Tiết Đợt: {selectedBatch?.batchName}</span>
          </div>
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={720}
      >
        {selectedBatch && (
          <div>
            {/* Tóm tắt tình trạng đợt */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '16px',
                marginBottom: 20,
              }}
            >
              <Row gutter={[16, 12]}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Người phát lệnh:</Text>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedBatch.requestedByName || 'HR Team'}</div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Hạn chót (Deadline):</Text>
                  <div style={{ fontWeight: 600, color: selectedBatch.isLate ? '#dc2626' : '#0f172a' }}>
                    {selectedBatch.deadline ? new Date(selectedBatch.deadline).toLocaleString('vi-VN') : 'Không giới hạn'}
                    {selectedBatch.isLate && <Tag color="error" style={{ marginLeft: 6 }}>Quá hạn</Tag>}
                  </div>
                </Col>
                <Col span={24}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, marginTop: 4 }}>
                    <Text strong style={{ fontSize: 13 }}>Tiến độ nộp hồ sơ ({selectedBatch.completed} / {selectedBatch.total})</Text>
                    <Text strong style={{ color: '#1677ff' }}>{selectedBatch.percent}%</Text>
                  </div>
                  <Progress percent={selectedBatch.percent} strokeColor="#16a34a" />
                </Col>
              </Row>

              <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => handleCopyUnfinishedEmployees(selectedBatch.items)}
                >
                  Sao chép DS người chưa nộp ({selectedBatch.pending})
                </Button>

                {selectedBatch.pending > 0 && (
                  <Popconfirm
                    title="Xác nhận hủy tất cả lệnh chưa nộp trong đợt này?"
                    description={`Sẽ hủy ${selectedBatch.pending} lệnh đang ở trạng thái PENDING.`}
                    onConfirm={() => handleCancelBatchPending(selectedBatch.items)}
                    okText="Hủy tất cả"
                    cancelText="Đóng"
                    okButtonProps={{ danger: true }}
                  >
                    <Button size="small" danger icon={<StopOutlined />}>
                      Hủy các lệnh chưa nộp ({selectedBatch.pending})
                    </Button>
                  </Popconfirm>
                )}
              </div>
            </div>

            {/* Bảng danh sách nhân sự nhận lệnh trong đợt */}
            <Title level={5} style={{ marginBottom: 12, fontSize: 14 }}>
              Danh Sách Nhân Sự Nhận Lệnh ({selectedBatch.items.length})
            </Title>

            <Table
              dataSource={selectedBatch.items}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 10 }}
              columns={[
                {
                  title: 'Nhân Viên',
                  dataIndex: 'targetUserName',
                  key: 'targetUserName',
                  render: (name, rec) => (
                    <div>
                      <strong style={{ color: '#0f172a' }}>{name || `User #${rec.targetUserId}`}</strong>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>#REQ-{rec.id}</div>
                    </div>
                  ),
                },
                {
                  title: 'Trạng Thái',
                  dataIndex: 'status',
                  key: 'status',
                  width: 140,
                  render: renderStatusTag,
                },
                {
                  title: 'Thao Tác',
                  key: 'action',
                  width: 90,
                  align: 'center',
                  render: (_, rec) => {
                    if (rec.status !== 'PENDING') return <Text type="secondary">—</Text>;
                    return (
                      <Popconfirm
                        title="Hủy lệnh này?"
                        onConfirm={() => handleCancelRequest(rec.id)}
                        okText="Hủy"
                        cancelText="Đóng"
                        okButtonProps={{ danger: true }}
                      >
                        <Button danger size="small" style={{ fontSize: 11 }}>
                          Hủy
                        </Button>
                      </Popconfirm>
                    );
                  },
                },
              ]}
            />
          </div>
        )}
      </Drawer>

      {/* ─── Modal Phát Lệnh Cập Nhật CV Mới ─── */}
      <CreateRequestModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onSuccess={fetchRequests}
      />
    </div>
  );
};

export default HrRequestManagementPage;
