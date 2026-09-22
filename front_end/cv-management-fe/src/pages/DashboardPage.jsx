import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, Alert, Progress } from 'antd';
import {
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
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

/**
 * Trang Dashboard Thống Kê Tổng Quan
 * Hiển thị: thẻ thống kê (số nhân viên, CV đã/chưa cập nhật, đang chờ duyệt)
 * + biểu đồ cột tỷ lệ CV theo phòng ban
 */
const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getDashboardStats();
        // axiosClient đã unwrap response.data (ApiResponse)
        // response = { success: true, data: DashboardStatsDTO }
        setStats(response.data);
      } catch (err) {
        setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" showIcon style={{ margin: 24 }} />;
  }

  // Tính tỷ lệ CV đã cập nhật
  const totalCvs = (stats?.cvUpdatedCount || 0) + (stats?.cvNotUpdatedCount || 0);
  const updatedPercent = totalCvs > 0 ? Math.round((stats.cvUpdatedCount / totalCvs) * 100) : 0;

  // Chuẩn bị dữ liệu cho biểu đồ Recharts
  const chartData = (stats?.byDepartment || []).map((dept) => ({
    name: dept.departmentName,
    'Đã cập nhật': dept.updatedCount,
    'Chưa cập nhật': dept.notUpdatedCount,
  }));

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* ─── Tiêu đề ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>
          📊 Dashboard Thống Kê Tổng Quan
        </h2>
        <p style={{ margin: '4px 0 0', color: '#888' }}>
          Tổng hợp tình trạng CV và quy trình duyệt của toàn công ty
        </p>
      </div>

      {/* ─── Hàng thẻ thống kê ─────────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Thẻ 1: Tổng nhân viên */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              borderTop: '4px solid #1677ff',
            }}
          >
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#555' }}>Tổng Nhân Viên</span>}
              value={stats?.totalEmployees || 0}
              prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff', fontWeight: 700, fontSize: 28 }}
            />
          </Card>
        </Col>

        {/* Thẻ 2: CV đã cập nhật */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              borderTop: '4px solid #52c41a',
            }}
          >
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#555' }}>CV Đã Cập Nhật</span>}
              value={stats?.cvUpdatedCount || 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontWeight: 700, fontSize: 28 }}
              suffix={<span style={{ fontSize: 14, color: '#52c41a' }}>({updatedPercent}%)</span>}
            />
          </Card>
        </Col>

        {/* Thẻ 3: CV chưa cập nhật */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              borderTop: '4px solid #ff4d4f',
            }}
          >
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#555' }}>CV Chưa Cập Nhật</span>}
              value={stats?.cvNotUpdatedCount || 0}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f', fontWeight: 700, fontSize: 28 }}
            />
          </Card>
        </Col>

        {/* Thẻ 4: Đang chờ duyệt */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              borderTop: '4px solid #faad14',
            }}
          >
            <Statistic
              title={<span style={{ fontWeight: 600, color: '#555' }}>Đang Chờ Duyệt</span>}
              value={stats?.pendingApprovalCount || 0}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14', fontWeight: 700, fontSize: 28 }}
            />
          </Card>
        </Col>
      </Row>

      {/* ─── Thanh tiến độ tổng thể ─────────────────────────────────── */}
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          marginBottom: 24,
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: '#333' }}>
            Tỷ lệ CV đã cập nhật toàn công ty
          </span>
          <span style={{ float: 'right', color: '#888', fontSize: 13 }}>
            {stats?.cvUpdatedCount || 0} / {totalCvs} CV
          </span>
        </div>
        <Progress
          percent={updatedPercent}
          strokeColor={{ '0%': '#52c41a', '100%': '#73d13d' }}
          trailColor="#ffccc7"
          strokeWidth={14}
          status={updatedPercent === 100 ? 'success' : 'active'}
        />
      </Card>

      {/* ─── Biểu đồ cột theo phòng ban ─────────────────────────────── */}
      <Card
        title={
          <span style={{ fontWeight: 700, fontSize: 16 }}>
            📈 Tỷ lệ CV theo Phòng Ban
          </span>
        }
        style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
      >
        {chartData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
            Chưa có dữ liệu phòng ban
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
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
              />
              <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13 }} />
              <Bar
                dataKey="Đã cập nhật"
                fill="#52c41a"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              />
              <Bar
                dataKey="Chưa cập nhật"
                fill="#ff4d4f"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;
