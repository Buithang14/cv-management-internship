import React from 'react';
import { Typography, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const CvHeader = ({ fullName, avatarUrl, title, summary, objective }) => {
  const displaySummary = summary || objective || 'Chưa cập nhật mục tiêu nghề nghiệp và tóm tắt bản thân.';

  return (
    <div style={{ display: 'flex', gap: 24, marginBottom: 24, alignItems: 'flex-start' }}>
      {/* Ảnh Đại Diện Avatar */}
      <div style={{ flexShrink: 0 }}>
        <Avatar
          shape="square"
          size={140}
          src={avatarUrl}
          icon={<UserOutlined />}
          style={{ borderRadius: 6, border: '1px solid #d9d9d9', backgroundColor: '#fafafa' }}
        />
      </div>

      {/* Họ tên & Tiêu đề công việc */}
      <div style={{ flexGrow: 1 }}>
        <Title level={2} style={{ margin: 0, color: '#1f1f1f', fontWeight: 700, letterSpacing: -0.5 }}>
          {fullName || 'Chưa cập nhật họ tên'}
        </Title>

        {title && (
          <Text strong style={{ fontSize: 16, color: '#595959', display: 'block', marginBottom: 12 }}>
            {title}
          </Text>
        )}

        {/* Box Tóm tắt / Mục tiêu */}
        <div style={{ background: '#f8f9fa', padding: '12px 16px', borderRadius: 6, borderLeft: '4px solid #1f1f1f' }}>
          <Paragraph style={{ margin: 0, fontSize: 13, color: '#262626', lineHeight: 1.6 }}>
            {displaySummary}
          </Paragraph>
        </div>
      </div>
    </div>
  );
};

export default CvHeader;
