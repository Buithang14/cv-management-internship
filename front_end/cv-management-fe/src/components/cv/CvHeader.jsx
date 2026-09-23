import React from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const CvHeader = ({ fullName, avatarUrl, title, summary, objective, position }) => {
  // Loại bỏ các hậu tố (Senior), (Employee) trong tên
  const cleanFullName = (fullName || 'Chưa cập nhật họ tên')
    .replace(/\s*\(Senior\)/gi, '')
    .replace(/\s*\(Employee\)/gi, '')
    .trim();

  // Chức vụ (Position)
  const jobPosition = position || summary || (objective && objective.length <= 60 ? objective : 'Technical Architect');

  return (
    <div style={{ display: 'flex', gap: 24, marginBottom: 18, alignItems: 'center' }}>
      {/* Ảnh Đại Diện Avatar */}
      <div style={{ flexShrink: 0 }}>
        <Avatar
          shape="square"
          size={112}
          src={avatarUrl}
          icon={<UserOutlined style={{ fontSize: 44, color: '#94a3b8' }} />}
          style={{ borderRadius: 8, border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}
        />
      </div>

      {/* Họ tên, Phòng ban, Chức vụ */}
      <div style={{ flexGrow: 1 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#0f172a', letterSpacing: -0.4, lineHeight: 1.25 }}>
          {cleanFullName}
        </h1>

        {title && (
          <div style={{ fontSize: 15.5, color: '#475569', fontWeight: 500, marginTop: 5, lineHeight: 1.4 }}>
            {title}
          </div>
        )}

        {/* Dòng Chức vụ */}
        <div style={{ fontSize: 14.5, color: '#334155', marginTop: 5, lineHeight: 1.4 }}>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>Chức vụ: </span>
          <span style={{ fontWeight: 400, color: '#334155' }}>
            {jobPosition}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CvHeader;
