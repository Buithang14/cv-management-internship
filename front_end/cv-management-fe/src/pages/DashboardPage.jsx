import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Spin,
  Alert,
  Progress,
  Typography,
  Tag,
  Space,
  Button,
  Table,
  Empty,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  ApartmentOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  SolutionOutlined,
  FileTextOutlined,
  SendOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { getDashboardStats } from '../api/dashboardApi';
import techLeadApi from '../api/techLeadApi';
import hrApi from '../api/hrApi';

const { Title, Text } = Typography;

/**
 * Trang Dashboard Thống Kê Tổng Quan
 * - Tech Lead: Ban đầu CHỈ hiển thị Bảng phòng ban quản lý. Bấm vào phòng ban sẽ hiển thị Bảng chi tiết (việc cần duyệt & thống kê), không dùng hình vẽ/biểu đồ.
 * - HR & Admin: Dashboard tổng thể toàn doanh nghiệp, biểu đồ phân bổ và tiến độ tổng công ty.
 */
const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingDrafts, setPendingDrafts] = useState([]);
  const [hrPendingDrafts, setHrPendingDrafts] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Xác định vai trò người dùng đăng nhập
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role || 'EMPLOYEE';
  const isTechLead = userRole === 'TECH_LEAD';
  const isHr = userRole === 'HR';
  const isAdmin = userRole === 'ADMIN';
  const canManageHr = isHr || isAdmin;

  // Phòng ban đang được chọn để xem chi tiết (đối với Tech Lead). Mặc định là null để chỉ hiển thị bảng phòng ban ban đầu.
  const [selectedDeptName, setSelectedDeptName] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Tải thống kê tổng quan
      const response = await getDashboardStats();
      const statsData = response.data;
      setStats(statsData);

      // 2. Nếu là Tech Lead, tải thêm danh sách hồ sơ bản nháp chờ thẩm định Trạm 1
      if (isTechLead) {
        try {
          const draftRes = await techLeadApi.getPendingDrafts();
          const list = draftRes.data || draftRes.result || draftRes || [];
          setPendingDrafts(Array.isArray(list) ? list : []);
        } catch (draftErr) {
          console.error('Lỗi khi tải bản nháp chờ duyệt của Tech Lead:', draftErr);
        }
      }

      // 3. Nếu là HR hoặc ADMIN, tải danh sách bản nháp chờ duyệt và các đợt phát lệnh
      if (canManageHr) {
        try {
          const [draftRes, reqRes] = await Promise.allSettled([
            hrApi.getPendingDrafts(),
            hrApi.getAllUpdateRequests(),
          ]);

          if (draftRes.status === 'fulfilled') {
            const list = draftRes.value?.data || draftRes.value?.result || draftRes.value || [];
            setHrPendingDrafts(Array.isArray(list) ? list : []);
          }

          if (reqRes.status === 'fulfilled') {
            const list = reqRes.value?.data || reqRes.value?.result || reqRes.value || [];
            setRecentRequests(Array.isArray(list) ? list : []);
          }
        } catch (hrErr) {
          console.error('Lỗi khi tải dữ liệu bổ sung của HR:', hrErr);
        }
      }
    } catch (err) {
      setError('Không thể tải dữ liệu thống kê từ hệ thống. Vui lòng thử lại sau.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [isTechLead, canManageHr]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Đang tải dữ liệu báo cáo thống kê..." />
      </div>
    );
  }

  if (error) {
    return <Alert message="Lỗi tải dữ liệu" description={error} type="error" showIcon style={{ marginBottom: 24 }} />;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. GIAO DIỆN DÀNH CHO TECH LEAD (Quy trình 2 bước: Bảng Phòng Ban ➔ Bảng Chi Tiết)
  // ─────────────────────────────────────────────────────────────────────────────
  if (isTechLead) {
    const deptList = stats?.byDepartment || [];

    // ──────────────────────────────────────────────────────────────
    // BƯỚC 1: MÀN HÌNH BAN ĐẦU - CHỈ HIỂN THỊ BẢNG PHÒNG BAN QUẢN LÝ
    // ──────────────────────────────────────────────────────────────
    if (!selectedDeptName) {
      const deptColumns = [
        {
          title: 'Phòng Ban Quản Lý',
          dataIndex: 'departmentName',
          key: 'departmentName',
          render: (name) => {
            const isUserMainDept = name === user.departmentName;
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ApartmentOutlined style={{ color: '#1677ff', fontSize: 16 }} />
                <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>
                  {name}
                </span>
                {isUserMainDept && (
                  <Tag color="blue" style={{ fontSize: 11, borderRadius: 10 }}>
                    Phụ trách chính
                  </Tag>
                )}
              </div>
            );
          },
        },
        {
          title: 'Tổng Nhân Sự',
          key: 'total',
          width: 140,
          align: 'center',
          render: (_, record) => {
            const total = (record.updatedCount || 0) + (record.notUpdatedCount || 0);
            return <strong style={{ color: '#1e293b' }}>{total} nhân viên</strong>;
          },
        },
        {
          title: 'CV Đã Cập Nhật',
          dataIndex: 'updatedCount',
          key: 'updatedCount',
          width: 150,
          align: 'center',
          render: (count) => (
            <Tag color="success" style={{ fontWeight: 600, fontSize: 13, padding: '2px 10px' }}>
              {count || 0} hồ sơ
            </Tag>
          ),
        },
        {
          title: 'CV Chưa Cập Nhật',
          dataIndex: 'notUpdatedCount',
          key: 'notUpdatedCount',
          width: 150,
          align: 'center',
          render: (count) => (
            <Tag color="warning" style={{ fontWeight: 600, fontSize: 13, padding: '2px 10px' }}>
              {count || 0} hồ sơ
            </Tag>
          ),
        },
        {
          title: 'Chờ Thẩm Định',
          key: 'pending',
          width: 180,
          align: 'center',
          render: (_, record) => {
            // Nếu là phòng ban phụ trách chính của Tech Lead, hiển thị số nháp đang chờ duyệt
            const isUserMainDept = !user.departmentName || record.departmentName === user.departmentName;
            const pendingCount = isUserMainDept ? pendingDrafts.length : 0;
            return (
              <Tag color="blue" style={{ fontWeight: 600, fontSize: 13, padding: '2px 10px' }}>
                {pendingCount} hồ sơ
              </Tag>
            );
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
              icon={<ArrowRightOutlined />}
              onClick={() => setSelectedDeptName(record.departmentName)}
              style={{ borderRadius: 4, fontSize: 12.5 }}
            >
              Xem Chi Tiết
            </Button>
          ),
        },
      ];

      return (
        <div>
          {/* Header Bảng Phòng Ban */}
          <div
            style={{
              marginBottom: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
                Tổng Quan Quản Lý Hồ Sơ Theo Phòng Ban
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Danh sách các phòng ban được giao phụ trách thẩm định chuyên môn CV. Nhấn vào phòng ban để xem chi tiết.
              </Text>
            </div>

            <Space>
              <button
                type="button"
                onClick={fetchStats}
                style={{
                  background: '#fff',
                  border: '1px solid #d9d9d9',
                  borderRadius: 6,
                  padding: '4px 12px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                }}
              >
                <ReloadOutlined /> Làm mới
              </button>
            </Space>
          </div>

          {/* Bảng danh sách các phòng ban quản lý */}
          <Card
            bordered={false}
            style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            bodyStyle={{ padding: '20px' }}
          >
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ApartmentOutlined style={{ color: '#1677ff', fontSize: 18 }} />
                <span style={{ fontWeight: 600, fontSize: 15, color: '#0f172a' }}>
                  Danh Sách Phòng Ban Quản Lý ({deptList.length})
                </span>
              </div>
              <Text type="secondary" style={{ fontSize: 12.5 }}>
                Bấm vào dòng hoặc nút "Xem Chi Tiết" để kiểm tra hồ sơ phòng ban đó
              </Text>
            </div>

            <Table
              dataSource={deptList}
              columns={deptColumns}
              rowKey="departmentName"
              pagination={false}
              onRow={(record) => ({
                onClick: () => setSelectedDeptName(record.departmentName),
                style: { cursor: 'pointer' },
              })}
              style={{ borderRadius: 8, overflow: 'hidden' }}
            />
          </Card>
        </div>
      );
    }

    // ──────────────────────────────────────────────────────────────
    // BƯỚC 2: MÀN HÌNH CHI TIẾT KHI ĐÃ CHỌN 1 PHÒNG BAN
    // Không dùng hình vẽ, biểu đồ; Chỉ dùng BẢNG dữ liệu rõ ràng.
    // ──────────────────────────────────────────────────────────────
    const activeDept = deptList.find((d) => d.departmentName === selectedDeptName) || {
      departmentName: selectedDeptName,
      updatedCount: 0,
      notUpdatedCount: 0,
    };

    const deptTotal = (activeDept.updatedCount || 0) + (activeDept.notUpdatedCount || 0);
    const deptUpdated = activeDept.updatedCount || 0;
    const deptNotUpdated = activeDept.notUpdatedCount || 0;
    const isUserMainDept = !user.departmentName || activeDept.departmentName === user.departmentName;
    const deptPending = isUserMainDept ? pendingDrafts.length : 0;

    // Cột Bảng 1: Danh sách bản nháp chờ thẩm định (Việc cần làm ngay)
    const draftColumns = [
      {
        title: 'Mã Bản Nháp',
        dataIndex: 'id',
        key: 'id',
        width: 120,
        render: (id) => <Tag color="blue">#DRAFT-{id}</Tag>,
      },
      {
        title: 'Nhân Viên Nộp Hồ Sơ',
        dataIndex: 'userFullName',
        key: 'userFullName',
        render: (name, record) => (
          <Text strong style={{ color: '#0f172a', fontSize: 13.5 }}>
            {record.fullName || name || 'Chưa cập nhật'}
          </Text>
        ),
      },
      {
        title: 'Kỹ Năng / Mục Tiêu Chuyên Môn Khai Báo',
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
        width: 130,
        render: (date) => (
          <Text type="secondary" style={{ fontSize: 12.5 }}>
            {date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'}
          </Text>
        ),
      },
      {
        title: 'Trạng Thái',
        key: 'status',
        width: 140,
        render: () => (
          <Tag color="processing" style={{ fontWeight: 500 }}>
            Chờ Tech Lead duyệt
          </Tag>
        ),
      },
      {
        title: 'Thao Tác',
        key: 'action',
        width: 120,
        align: 'center',
        render: () => (
          <Button
            type="primary"
            size="small"
            onClick={() => navigate('/techlead/evaluations')}
            style={{ fontSize: 12.5, borderRadius: 4 }}
          >
            Thẩm Định Ngay
          </Button>
        ),
      },
    ];

    // Dữ liệu cho Bảng 2: Thống kê trạng thái nhân sự trong phòng ban (Phương án 2)
    const summaryTableData = [
      {
        key: 'updated',
        category: 'CV Đã Cập Nhật',
        description: 'Hồ sơ đã được thẩm định chuyên môn và HR ban hành chính thức',
        count: `${deptUpdated} / ${deptTotal}`,
      },
      {
        key: 'not_updated',
        category: 'CV Chưa Cập Nhật',
        description: 'Nhân viên chưa nộp hoặc cần bổ sung thông tin kỹ năng mới',
        count: `${deptNotUpdated} / ${deptTotal}`,
      },
      {
        key: 'pending',
        category: 'Bản Nháp Chờ Thẩm Định',
        description: 'Hồ sơ nhân viên đã nộp lên đang đợi Tech Lead phê duyệt',
        count: `${deptPending} / ${deptTotal}`,
      },
      {
        key: 'total',
        category: 'Tổng Nhân Sự Phòng Ban',
        description: 'Tổng số nhân viên thuộc biên chế phòng ban này',
        count: `${deptTotal} nhân viên`,
      },
    ];

    const summaryTableColumns = [
      {
        title: 'Hạng Mục Hồ Sơ',
        dataIndex: 'category',
        key: 'category',
        width: 240,
        render: (text) => <strong style={{ color: '#0f172a' }}>{text}</strong>,
      },
      {
        title: 'Mô Tả Trạng Thái',
        dataIndex: 'description',
        key: 'description',
        render: (text) => <Text type="secondary">{text}</Text>,
      },
      {
        title: 'Số Lượng',
        dataIndex: 'count',
        key: 'count',
        width: 160,
        align: 'center',
        render: (text) => <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{text}</span>,
      },
    ];

    return (
      <div>
        {/* Header Chi Tiết Phòng Ban + Nút Quay Lại */}
        <div
          style={{
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => setSelectedDeptName(null)}
              style={{ borderRadius: 6, fontWeight: 500 }}
            >
              Quay lại
            </Button>
            <div>
              <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
                {activeDept.departmentName}
              </Title>
            </div>
          </div>

          <Space>
            <button
              type="button"
              onClick={fetchStats}
              style={{
                background: '#fff',
                border: '1px solid #d9d9d9',
                borderRadius: 6,
                padding: '4px 12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
              }}
            >
              <ReloadOutlined /> Làm mới
            </button>
          </Space>
        </div>

        {/* ─── Stat Cards Phòng Ban ─── */}
        <Row gutter={[16, 12]} style={{ marginBottom: 20 }}>
          {/* Card 1: Tổng Nhân Sự */}
          <Col xs={12} sm={6}>
            <div style={{ background: '#fff', borderRadius: 8, padding: '16px 20px', borderTop: '3px solid #1677ff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>Tổng Nhân Sự</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#1677ff', lineHeight: 1 }}>{deptTotal}</div>
              <div style={{ fontSize: 12, color: '#bfbfbf', marginTop: 4 }}>nhân viên</div>
            </div>
          </Col>

          {/* Card 2: CV Đã Cập Nhật */}
          <Col xs={12} sm={6}>
            <div style={{ background: '#fff', borderRadius: 8, padding: '16px 20px', borderTop: '3px solid #52c41a', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>CV Đã Cập Nhật</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#52c41a', lineHeight: 1 }}>
                {deptUpdated} <span style={{ fontSize: 14, fontWeight: 400, color: '#bfbfbf' }}>/ {deptTotal}</span>
              </div>
              <div style={{ fontSize: 12, color: '#bfbfbf', marginTop: 4 }}>
                {deptTotal > 0 ? Math.round((deptUpdated / deptTotal) * 100) : 0}% hoàn thành
              </div>
            </div>
          </Col>

          {/* Card 3: CV Chưa Cập Nhật */}
          <Col xs={12} sm={6}>
            <div style={{ background: '#fff', borderRadius: 8, padding: '16px 20px', borderTop: '3px solid #fa8c16', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>CV Chưa Cập Nhật</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#fa8c16', lineHeight: 1 }}>
                {deptNotUpdated} <span style={{ fontSize: 14, fontWeight: 400, color: '#bfbfbf' }}>/ {deptTotal}</span>
              </div>
              <div style={{ fontSize: 12, color: '#bfbfbf', marginTop: 4 }}>cần cập nhật</div>
            </div>
          </Col>

          {/* Card 4: Chờ Thẩm Định */}
          <Col xs={12} sm={6}>
            <div style={{ background: '#fff', borderRadius: 8, padding: '16px 20px', borderTop: '3px solid #722ed1', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>Chờ Thẩm Định</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#722ed1', lineHeight: 1 }}>
                {deptPending} <span style={{ fontSize: 14, fontWeight: 400, color: '#bfbfbf' }}>/ {deptTotal}</span>
              </div>
              <div style={{ fontSize: 12, color: '#bfbfbf', marginTop: 4 }}>hồ sơ cần duyệt</div>
            </div>
          </Col>
        </Row>

        {/* ─── BẢNG 1: Danh Sách CV Đang Chờ Thẩm Định (Việc Cần Làm Ngay) ─── */}
        <Card
          bordered={false}
          style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 20 }}
          bodyStyle={{ padding: 20 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SolutionOutlined style={{ color: '#1677ff', fontSize: 18 }} />
              <span style={{ fontWeight: 600, fontSize: 15, color: '#0f172a' }}>
                Hồ Sơ Bản Nháp Đang Chờ Thẩm Định Chuyên Môn
              </span>
              <Tag color={deptPending > 0 ? 'blue' : 'default'} style={{ borderRadius: 10 }}>
                {deptPending} hồ sơ cần duyệt
              </Tag>
            </div>
          </div>

          {deptPending === 0 ? (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px dashed #cbd5e1',
              }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Hiện không có bản nháp CV nào đang chờ duyệt trong phòng ban này."
              />
            </div>
          ) : (
            <Table
              dataSource={pendingDrafts}
              columns={draftColumns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5, size: 'small', showTotal: (total) => `Tổng ${total} hồ sơ` }}
              style={{ borderRadius: 8, overflow: 'hidden' }}
            />
          )}
        </Card>

        {/* ─── BẢNG 2: Bảng Thống Kê Tiến Độ Hồ Sơ Phòng Ban ─── */}
        <Card
          bordered={false}
          style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          bodyStyle={{ padding: 20 }}
        >
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileTextOutlined style={{ color: '#1677ff', fontSize: 18 }} />
            <span style={{ fontWeight: 600, fontSize: 15, color: '#0f172a' }}>
              Bảng Thống Kê Trạng Thái Hồ Sơ Nhân Sự Trong Phòng Ban
            </span>
          </div>

          <Table
            dataSource={summaryTableData}
            columns={summaryTableColumns}
            pagination={false}
            size="middle"
            style={{ borderRadius: 8, overflow: 'hidden' }}
          />
        </Card>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. GIAO DIỆN DÀNH CHO HR VÀ ADMIN (Enterprise Control Plane - Table-First)
  // ─────────────────────────────────────────────────────────────────────────────
  const totalCvs = (stats?.cvUpdatedCount || 0) + (stats?.cvNotUpdatedCount || 0);
  const updatedPercent = totalCvs > 0 ? Math.round((stats.cvUpdatedCount / totalCvs) * 100) : 0;
  const deptList = stats?.byDepartment || [];

  // Cột cho BẢNG 1: Thống kê tình trạng CV theo phòng ban
  const deptTableColumns = [
    {
      title: 'Phòng Ban Doanh Nghiệp',
      dataIndex: 'departmentName',
      key: 'departmentName',
      render: (name) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ApartmentOutlined style={{ color: '#1677ff', fontSize: 16 }} />
          <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 13.5 }}>{name}</span>
        </div>
      ),
    },
    {
      title: 'Tổng Nhân Sự Có CV',
      key: 'total',
      width: 150,
      align: 'center',
      render: (_, record) => {
        const total = (record.updatedCount || 0) + (record.notUpdatedCount || 0);
        return <strong style={{ color: '#1e293b' }}>{total} nhân viên</strong>;
      },
    },
    {
      title: 'CV Đã Cập Nhật',
      dataIndex: 'updatedCount',
      key: 'updatedCount',
      width: 160,
      align: 'center',
      render: (count) => (
        <Tag color="success" style={{ fontWeight: 600, fontSize: 12.5, padding: '2px 10px' }}>
          {count || 0} hồ sơ
        </Tag>
      ),
    },
    {
      title: 'CV Chưa Cập Nhật',
      dataIndex: 'notUpdatedCount',
      key: 'notUpdatedCount',
      width: 180,
      align: 'center',
      render: (count) => (
        <Tag color={count > 0 ? 'warning' : 'default'} style={{ fontWeight: 600, fontSize: 12.5, padding: '2px 10px' }}>
          {count || 0} hồ sơ
        </Tag>
      ),
    },
    {
      title: 'Tỷ Lệ Hoàn Thành',
      key: 'percent',
      width: 190,
      align: 'center',
      render: (_, record) => {
        const total = (record.updatedCount || 0) + (record.notUpdatedCount || 0);
        const percent = total > 0 ? Math.round(((record.updatedCount || 0) / total) * 100) : 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Progress
              percent={percent}
              size="small"
              strokeColor={percent === 100 ? '#16a34a' : '#1677ff'}
              style={{ width: 110, margin: 0 }}
            />
          </div>
        );
      },
    },
    {
      title: 'Trạng Thái',
      key: 'status',
      width: 140,
      align: 'center',
      render: (_, record) => {
        const total = (record.updatedCount || 0) + (record.notUpdatedCount || 0);
        if (total === 0) return <Tag color="default">Chưa có dữ liệu</Tag>;
        if ((record.notUpdatedCount || 0) === 0) {
          return <Tag color="success">100% Hoàn thành</Tag>;
        }
        return <Tag color="processing">Đang thu thập</Tag>;
      },
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate('/hr/cv-list', { state: { departmentName: record.departmentName } })}
          style={{ fontSize: 12, borderRadius: 4 }}
        >
          Xem Kho CV
        </Button>
      ),
    },
  ];

  // Cột cho BẢNG 2: Danh sách bản nháp chờ HR duyệt chót (Trạm 2)
  const hrPendingColumns = [
    {
      title: 'Mã Bản Nháp',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id) => <Tag color="blue">#DRAFT-{id}</Tag>,
    },
    {
      title: 'Nhân Viên Nộp Hồ Sơ',
      dataIndex: 'userFullName',
      key: 'userFullName',
      render: (name, record) => (
        <div>
          <Text strong style={{ color: '#0f172a', fontSize: 13.5 }}>
            {record.fullName || name || 'Chưa cập nhật'}
          </Text>
          {record.phone && (
            <div style={{ fontSize: 12, color: '#64748b' }}>SĐT: {record.phone}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Phòng Ban',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 180,
      render: (dept) => (
        <Tag color="cyan" style={{ fontWeight: 500 }}>
          {dept || 'Phòng Ban Nội Bộ'}
        </Tag>
      ),
    },
    {
      title: 'Tóm Tắt Kỹ Năng / Mục Tiêu',
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
      title: 'Ngày Tech Lead Duyệt',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 140,
      render: (date) => (
        <Text type="secondary" style={{ fontSize: 12.5 }}>
          {date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Trạng Thái',
      key: 'status',
      width: 170,
      render: () => (
        <Tag color="processing" icon={<ClockCircleOutlined />}>
          Chờ HR Duyệt Chót
        </Tag>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'action',
      width: 120,
      align: 'center',
      render: () => (
        <Button
          type="primary"
          size="small"
          icon={<ArrowRightOutlined />}
          onClick={() => navigate('/hr/cv-review')}
          style={{ fontSize: 12.5, borderRadius: 4 }}
        >
          Xử Lý Duyệt
        </Button>
      ),
    },
  ];

  // Cột cho BẢNG 3: Lệnh yêu cầu cập nhật CV gần đây
  const recentRequestColumns = [
    {
      title: 'Mã Lệnh',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id) => <Tag color="blue">#REQ-{id}</Tag>,
    },
    {
      title: 'Tên Đợt Thu Thập',
      dataIndex: 'batchName',
      key: 'batchName',
      render: (name) => <strong style={{ color: '#0f172a' }}>{name || 'Đợt cập nhật định kỳ'}</strong>,
    },
    {
      title: 'Nhân Viên Nhận Lệnh',
      dataIndex: 'targetUserName',
      key: 'targetUserName',
      width: 180,
      render: (name, record) => (
        <Text strong style={{ color: '#1677ff', fontSize: 13 }}>
          {name || `User #${record.targetUserId}`}
        </Text>
      ),
    },
    {
      title: 'Hạn Chót (Deadline)',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 170,
      render: (deadline, record) => {
        if (!deadline) return <Text type="secondary">Không giới hạn</Text>;
        const d = new Date(deadline);
        const isLate = d < new Date() && record.status === 'PENDING';
        return (
          <Space size={4}>
            <Text type={isLate ? 'danger' : undefined} strong={isLate} style={{ fontSize: 12.5 }}>
              {d.toLocaleDateString('vi-VN')} {d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isLate && <Tag color="error" style={{ margin: 0, padding: '0 4px', fontSize: 10 }}>Quá hạn</Tag>}
          </Space>
        );
      },
    },
    {
      title: 'Trạng Thái Lệnh',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      align: 'center',
      render: (status) => {
        switch (status) {
          case 'PENDING':
            return <Tag color="warning" icon={<ClockCircleOutlined />}>Đang Chờ Nộp</Tag>;
          case 'COMPLETED':
            return <Tag color="success" icon={<CheckCircleOutlined />}>Đã Hoàn Thành</Tag>;
          case 'CANCELED':
            return <Tag color="default">Đã Hủy Lệnh</Tag>;
          default:
            return <Tag color="default">{status}</Tag>;
        }
      },
    },
    {
      title: 'Thao Tác',
      key: 'action',
      width: 110,
      align: 'center',
      render: () => (
        <Button
          size="small"
          onClick={() => navigate('/hr/requests')}
          style={{ fontSize: 12, borderRadius: 4 }}
        >
          Quản Lý
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* ─── Header HR / Admin ─────────────────────────────────────── */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
            Tổng Quan Quản Trị Hồ Sơ Năng Lực
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Báo cáo tiến độ chuẩn hóa CV và danh sách hồ sơ chờ duyệt.
          </Text>
        </div>

        <Space wrap>
          {canManageHr && hrPendingDrafts.length > 0 && (
            <Button
              type="primary"
              icon={<SolutionOutlined />}
              onClick={() => navigate('/hr/cv-review')}
              style={{ fontWeight: 500, borderRadius: 6 }}
            >
              Duyệt CV Chờ Xử Lý ({hrPendingDrafts.length})
            </Button>
          )}
          {canManageHr && (
            <Button
              icon={<SendOutlined />}
              onClick={() => navigate('/hr/requests')}
              style={{ fontWeight: 500, borderRadius: 6 }}
            >
              Quản Lý Lệnh Cập Nhật
            </Button>
          )}
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchStats}
            style={{ borderRadius: 6 }}
          >
            Làm mới
          </Button>
        </Space>
      </div>

      {/* ─── Stat Cards Toàn Doanh Nghiệp ─── */}
      <Row gutter={[16, 12]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <div style={{ background: '#fff', borderRadius: 8, padding: '16px 20px', borderTop: '3px solid #1677ff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>Tổng Nhân Sự</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#1677ff', lineHeight: 1 }}>{stats?.totalEmployees || 0}</div>
            <div style={{ fontSize: 12, color: '#bfbfbf', marginTop: 4 }}>tài khoản hoạt động</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div style={{ background: '#fff', borderRadius: 8, padding: '16px 20px', borderTop: '3px solid #52c41a', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>CV Đã Cập Nhật</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#52c41a', lineHeight: 1 }}>
              {stats?.cvUpdatedCount || 0} <span style={{ fontSize: 14, fontWeight: 400, color: '#bfbfbf' }}>/ {totalCvs} ({updatedPercent}%)</span>
            </div>
            <div style={{ fontSize: 12, color: '#bfbfbf', marginTop: 4 }}>hồ sơ hoạt động (Active)</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div style={{ background: '#fff', borderRadius: 8, padding: '16px 20px', borderTop: '3px solid #fa8c16', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>CV Chưa Cập Nhật</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#fa8c16', lineHeight: 1 }}>
              {stats?.cvNotUpdatedCount || 0} <span style={{ fontSize: 14, fontWeight: 400, color: '#bfbfbf' }}>/ {totalCvs}</span>
            </div>
            <div style={{ fontSize: 12, color: '#bfbfbf', marginTop: 4 }}>cần bổ sung / làm mới</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div style={{ background: '#fff', borderRadius: 8, padding: '16px 20px', borderTop: '3px solid #722ed1', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>Chờ HR Duyệt</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#722ed1', lineHeight: 1 }}>
              {canManageHr ? hrPendingDrafts.length : (stats?.pendingApprovalCount || 0)} <span style={{ fontSize: 14, fontWeight: 400, color: '#bfbfbf' }}>hồ sơ</span>
            </div>
            <div style={{ fontSize: 12, color: '#bfbfbf', marginTop: 4 }}>chờ xử lý</div>
          </div>
        </Col>
      </Row>


      {/* ─── BẢNG 1: Bảng Giám Sát Hồ Sơ CV Theo Từng Phòng Ban ──────── */}
      <Card
        bordered={false}
        style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 20 }}
        bodyStyle={{ padding: 20 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ApartmentOutlined style={{ color: '#1677ff', fontSize: 18 }} />
            <span style={{ fontWeight: 600, fontSize: 15, color: '#0f172a' }}>
              Tiến Độ Cập Nhật CV Theo Từng Phòng Ban ({deptList.length})
            </span>
          </div>
          <Text type="secondary" style={{ fontSize: 12.5 }}>
            Theo dõi chi tiết số lượng và tỷ lệ hoàn thiện hồ sơ của các bộ phận
          </Text>
        </div>

        <Table
          dataSource={deptList}
          columns={deptTableColumns}
          rowKey="departmentName"
          pagination={false}
          size="middle"
          style={{ borderRadius: 8, overflow: 'hidden' }}
          locale={{ emptyText: <Empty description="Chưa có dữ liệu phòng ban nào trong hệ thống." /> }}
        />
      </Card>

      {/* ─── BẢNG 2: Bảng Việc Cần Làm Ngay — Bản Nháp Đang Chờ HR Duyệt Chót (Trạm 2) ─── */}
      {canManageHr && (
        <Card
          bordered={false}
          style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 20 }}
          bodyStyle={{ padding: 20 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SolutionOutlined style={{ color: '#1677ff', fontSize: 18 }} />
              <span style={{ fontWeight: 600, fontSize: 15, color: '#0f172a' }}>
                Bản Nháp Đang Chờ HR Phê Duyệt
              </span>
              <Tag color={hrPendingDrafts.length > 0 ? 'blue' : 'default'} style={{ borderRadius: 10 }}>
                {hrPendingDrafts.length} hồ sơ cần duyệt
              </Tag>
            </div>
            {hrPendingDrafts.length > 0 && (
              <Button type="link" onClick={() => navigate('/hr/cv-review')} style={{ padding: 0, fontSize: 13 }}>
                Xem tất cả tại trang duyệt &rarr;
              </Button>
            )}
          </div>

          {hrPendingDrafts.length === 0 ? (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px dashed #cbd5e1',
              }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Hiện tại không có bản nháp CV nào đang chờ HR duyệt chót."
              />
            </div>
          ) : (
            <Table
              dataSource={hrPendingDrafts}
              columns={hrPendingColumns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5, size: 'small', showTotal: (total) => `Tổng ${total} hồ sơ` }}
              style={{ borderRadius: 8, overflow: 'hidden' }}
            />
          )}
        </Card>
      )}

      {/* ─── BẢNG 3: Bảng Tình Trạng Các Đợt Phát Lệnh Thu Thập CV Gần Đây ─── */}
      {canManageHr && recentRequests.length > 0 && (
        <Card
          bordered={false}
          style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          bodyStyle={{ padding: 20 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SendOutlined style={{ color: '#1677ff', fontSize: 18 }} />
              <span style={{ fontWeight: 600, fontSize: 15, color: '#0f172a' }}>
                Tiến Độ Các Đợt Phát Lệnh Thu Thập CV Gần Đây
              </span>
              <Tag color="cyan" style={{ borderRadius: 10 }}>
                {recentRequests.length} lệnh phát
              </Tag>
            </div>
            <Button type="link" onClick={() => navigate('/hr/requests')} style={{ padding: 0, fontSize: 13 }}>
              Xem toàn bộ lệnh thu thập &rarr;
            </Button>
          </div>

          <Table
            dataSource={recentRequests.slice(0, 5)}
            columns={recentRequestColumns}
            rowKey="id"
            size="small"
            pagination={false}
            style={{ borderRadius: 8, overflow: 'hidden' }}
          />
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
