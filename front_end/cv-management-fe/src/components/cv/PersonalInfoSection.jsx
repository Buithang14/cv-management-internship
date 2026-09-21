import React from 'react';
import { Space } from 'antd';
import { PhoneOutlined, MailOutlined, EnvironmentOutlined, GlobalOutlined } from '@ant-design/icons';

const PersonalInfoSection = ({ phone, email, address, website }) => {
  return (
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
      <Space direction="vertical" size={10} style={{ width: '100%', fontSize: 13, color: '#262626' }}>
        {phone && <div><PhoneOutlined style={{ marginRight: 8, color: '#595959' }} /> {phone}</div>}
        {email && <div><MailOutlined style={{ marginRight: 8, color: '#595959' }} /> {email}</div>}
        <div><EnvironmentOutlined style={{ marginRight: 8, color: '#595959' }} /> {address || 'Việt Nam'}</div>
        {website && <div><GlobalOutlined style={{ marginRight: 8, color: '#595959' }} /> {website}</div>}
      </Space>
    </div>
  );
};

export default PersonalInfoSection;
