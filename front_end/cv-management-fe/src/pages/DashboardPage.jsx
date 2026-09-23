import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Statistic,
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
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  BarChartOutlined,
  ApartmentOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  SolutionOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getDashboardStats } from '../api/dashboardApi';
import techLeadApi from '../api/techLeadApi';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Xác định vai trò người dùng đăng nhập
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role || 'EMPLOYEE';
  const isTechLead = userRole === 'TECH_LEAD';

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
    } catch (err) {
      setError('Không thể tải dữ liệu thống kê từ hệ thống. Vui lòng thử lại sau.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [isTechLead]);

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
    const deptPercent = deptTotal > 0 ? Math.round((deptUpdated / deptTotal) * 100) : 0;
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

        {/* ─── Thanh Tóm Tắt Tình Trạng Phòng Ban (Thẻ Phẳng Gọn Gàng) ─── */}
        <Card
          bordered={false}
          style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 20 }}
          bodyStyle={{ padding: '16px 20px', background: '#f8fafc' }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={12} sm={6}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Tổng Nhân Sự</Text>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>{deptTotal} nhân viên</div>
            </Col>
            <Col xs={12} sm={6}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>CV Đã Đạt Chuẩn</Text>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
                {deptUpdated} <span style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>/ {deptTotal}</span>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>CV Chưa Cập Nhật</Text>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
                {deptNotUpdated} <span style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>/ {deptTotal}</span>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Chờ Thẩm Định</Text>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
                {deptPending} <span style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>/ {deptTotal}</span>
              </div>
            </Col>
          </Row>
        </Card>

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
  // 2. GIAO DIỆN DÀNH CHO HR VÀ ADMIN (Company-wide Dashboard)
  // ─────────────────────────────────────────────────────────────────────────────
  const totalCvs = (stats?.cvUpdatedCount || 0) + (stats?.cvNotUpdatedCount || 0);
  const updatedPercent = totalCvs > 0 ? Math.round((stats.cvUpdatedCount / totalCvs) * 100) : 0;

  // Chuẩn bị dữ liệu cho biểu đồ Recharts
  const chartData = (stats?.byDepartment || []).map((dept) => ({
    name: dept.departmentName,
    'Đã cập nhật': dept.updatedCount,
    'Chưa cập nhật': dept.notUpdatedCount,
  }));

  return (
    <div>
      {/* ─── Header HR / Admin ─────────────────────────────────────── */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
            Tổng Quan Thống Kê
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Báo cáo tổng hợp tình trạng cập nhật hồ sơ năng lực và quy trình duyệt CV toàn doanh nghiệp.
          </Text>
        </div>

        <Space>
          <Tag color="blue" style={{ padding: '4px 12px', fontSize: 13, borderRadius: 16 }}>
            Tỷ lệ hoàn thành: <strong>{updatedPercent}%</strong>
          </Tag>
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

      {/* ─── Hàng Thẻ Chỉ Số KPI Toàn Doanh Nghiệp ──────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {/* Thẻ 1: Tổng nhân viên */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            bodyStyle={{ padding: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
                  Tổng Nhân Viên
                </Text>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#1677ff', marginTop: 4 }}>
                  {stats?.totalEmployees || 0}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Tài khoản trong hệ thống
                </Text>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  backgroundColor: '#e6f4ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TeamOutlined style={{ fontSize: 22, color: '#1677ff' }} />
              </div>
            </div>
          </Card>
        </Col>

        {/* Thẻ 2: CV đã cập nhật */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            bodyStyle={{ padding: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
                  CV Đã Cập Nhật
                </Text>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#16a34a', marginTop: 4 }}>
                  {stats?.cvUpdatedCount || 0}
                </div>
                <Text style={{ fontSize: 12, color: '#16a34a' }}>
                  {updatedPercent}% tổng số hồ sơ
                </Text>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  backgroundColor: '#f6ffed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircleOutlined style={{ fontSize: 22, color: '#16a34a' }} />
              </div>
            </div>
          </Card>
        </Col>

        {/* Thẻ 3: CV chưa cập nhật */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            bodyStyle={{ padding: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
                  CV Chưa Cập Nhật
                </Text>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#fa8c16', marginTop: 4 }}>
                  {stats?.cvNotUpdatedCount || 0}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Cần bổ sung / làm mới
                </Text>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  backgroundColor: '#fff7e6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CloseCircleOutlined style={{ fontSize: 22, color: '#fa8c16' }} />
              </div>
            </div>
          </Card>
        </Col>

        {/* Thẻ 4: Đang chờ duyệt */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            bodyStyle={{ padding: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
                  Đang Chờ Thẩm Định
                </Text>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#0958d9', marginTop: 4 }}>
                  {stats?.pendingApprovalCount || 0}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Tech Lead & HR
                </Text>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  backgroundColor: '#e6f4ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ClockCircleOutlined style={{ fontSize: 22, color: '#0958d9' }} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ─── Thanh Tiến Độ Tổng Thể ─────────────────────────────────── */}
      <Card
        bordered={false}
        style={{
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          marginBottom: 20,
        }}
        bodyStyle={{ padding: 20 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <Text strong style={{ fontSize: 14 }}>
              Tiến Độ Cập Nhật CV Toàn Công Ty
            </Text>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              Dựa trên tỷ lệ nhân viên đã cập nhật và được duyệt phiên bản CV mới nhất
            </div>
          </div>
          <Text strong style={{ fontSize: 14, color: '#1677ff' }}>
            {stats?.cvUpdatedCount || 0} / {totalCvs} CV ({updatedPercent}%)
          </Text>
        </div>
        <Progress
          percent={updatedPercent}
          strokeColor="#16a34a"
          trailColor="#f0f0f0"
          strokeWidth={10}
          status={updatedPercent === 100 ? 'success' : 'active'}
        />
      </Card>

      {/* ─── Biểu Đồ Cột Theo Phòng Ban ─────────────────────────────── */}
      <Card
        bordered={false}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChartOutlined style={{ color: '#1677ff' }} />
            <span style={{ fontWeight: 600, fontSize: 15 }}>
              Tỷ Lệ Hồ Sơ CV Theo Từng Phòng Ban
            </span>
          </div>
        }
        style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        bodyStyle={{ padding: '24px 20px' }}
      >
        {chartData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#8c8c8c' }}>
            Chưa có dữ liệu phòng ban để hiển thị biểu đồ.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 13 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e8e8e8', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
              <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13 }} />
              <Bar
                dataKey="Đã cập nhật"
                fill="#16a34a"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Bar
                dataKey="Chưa cập nhật"
                fill="#fa8c16"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;
