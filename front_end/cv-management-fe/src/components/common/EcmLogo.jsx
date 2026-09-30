import React from 'react';

/**
 * EcmLogo: Biểu tượng nhận diện thương hiệu cho ECM (Employee CV Management)
 * Tượng trưng cho Hồ sơ năng lực / Thẻ chuyên môn nhân sự (ID Profile & CV Credentials)
 */
const EcmLogo = ({ size = 36, style = {} }) => {
  const iconSize = Math.round(size * 0.58);
  const borderRadius = Math.round(size * 0.24);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: borderRadius,
        background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #3b82f6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        boxShadow: '0 2px 6px -1px rgba(29, 78, 216, 0.35)',
        flexShrink: 0,
        ...style,
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: 'block' }}
      >
        {/* Khung thẻ hồ sơ nhân sự (CV / Profile Card) */}
        <rect x="2.5" y="3.5" width="19" height="17" rx="3" />
        {/* Biểu tượng nhân viên (Employee Avatar) */}
        <circle cx="8" cy="9.5" r="2.2" />
        <path d="M 4.5 16.5 C 4.5 14.5 6 13.5 8 13.5 C 10 13.5 11.5 14.5 11.5 16.5" />
        {/* Các dòng thông tin chuyên môn / CV & Credentials */}
        <line x1="14" y1="8.5" x2="18.5" y2="8.5" />
        <line x1="14" y1="12" x2="18.5" y2="12" />
        <line x1="14" y1="15.5" x2="17" y2="15.5" />
      </svg>
    </div>
  );
};

export default EcmLogo;
