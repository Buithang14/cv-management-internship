import React from 'react';
import { PhoneOutlined, MailOutlined, EnvironmentOutlined, GlobalOutlined } from '@ant-design/icons';

const PersonalInfoSection = ({ phone, email, address, website }) => {
  const hasPhone = phone && phone.trim();
  const hasEmail = email && email.trim() && email !== 'N/A';
  const hasAddress = address && address.trim() && address !== 'Việt Nam';
  const hasWebsite = website && website.trim();

  const hasAnyInfo = hasPhone || hasEmail || hasAddress || hasWebsite;

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Section Header */}
      <div
        style={{
          borderBottom: '1.5px solid #cbd5e1',
          paddingBottom: 6,
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: 0.6,
          marginBottom: 14,
          color: '#0f172a',
          textTransform: 'uppercase',
        }}
      >
        THÔNG TIN CÁ NHÂN
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14.5, color: '#334155' }}>
        {hasPhone && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <PhoneOutlined style={{ marginRight: 10, color: '#64748b', fontSize: 15, flexShrink: 0 }} />
            <div>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>Số điện thoại: </span>
              <span style={{ color: '#334155', fontWeight: 400 }}>{phone}</span>
            </div>
          </div>
        )}

        {hasEmail && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <MailOutlined style={{ marginRight: 10, color: '#64748b', fontSize: 15, flexShrink: 0 }} />
            <div>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>Email: </span>
              <span style={{ color: '#334155', fontWeight: 400 }}>{email}</span>
            </div>
          </div>
        )}

        {hasAddress && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <EnvironmentOutlined style={{ marginRight: 10, color: '#64748b', fontSize: 15, flexShrink: 0 }} />
            <div>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>Địa chỉ: </span>
              <span style={{ color: '#334155', fontWeight: 400 }}>{address}</span>
            </div>
          </div>
        )}

        {hasWebsite && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <GlobalOutlined style={{ marginRight: 10, color: '#64748b', fontSize: 15, flexShrink: 0 }} />
            <div>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>Website: </span>
              <span style={{ color: '#334155', fontWeight: 400 }}>{website}</span>
            </div>
          </div>
        )}

        {!hasAnyInfo && (
          <div style={{ fontSize: 14, color: '#64748b', fontStyle: 'italic' }}>
            Chưa cập nhật thông tin liên hệ.
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoSection;
