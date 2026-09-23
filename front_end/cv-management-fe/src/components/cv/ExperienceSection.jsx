import React from 'react';
import { parseJsonField } from '../../utils/jsonUtils';

const ExperienceSection = ({ experiencesJson }) => {
  const experiences = parseJsonField(experiencesJson);

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
        KINH NGHIỆM LÀM VIỆC
      </div>

      <div>
        {experiences.length === 0 ? (
          <div style={{ fontSize: 14, color: '#64748b', fontStyle: 'italic' }}>
            Chưa có thông tin kinh nghiệm làm việc trong hồ sơ.
          </div>
        ) : (
          experiences.map((item, index) => {
            if (typeof item === 'object' && item !== null) {
              const companyName = item.company || item.congTy || item.workplace;
              const durationTime = item.duration || item.durationYears || item.year || item.time || item.thoiGian;
              const roleTitle = item.role || item.chucVu || item.position || item.viTri;

              const descriptionLines = Array.isArray(item.description)
                ? item.description
                : typeof item.description === 'string'
                ? item.description.split('\n')
                : [];

              return (
                <div
                  key={index}
                  style={{
                    marginBottom: 16,
                    paddingBottom: index < experiences.length - 1 ? 14 : 0,
                    borderBottom: index < experiences.length - 1 ? '1px dashed #e2e8f0' : 'none',
                    lineHeight: 1.7,
                  }}
                >
                  {companyName && (
                    <div style={{ fontSize: 15 }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>Công ty / Đơn vị công tác: </span>
                      <span style={{ color: '#334155', fontWeight: 400 }}>{companyName}</span>
                    </div>
                  )}

                  {durationTime && (
                    <div style={{ fontSize: 14.5 }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>Thời gian làm việc: </span>
                      <span style={{ color: '#334155', fontWeight: 400 }}>{durationTime}</span>
                    </div>
                  )}

                  {roleTitle && (
                    <div style={{ fontSize: 14.5 }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>Vị trí / Chức danh: </span>
                      <span style={{ color: '#334155', fontWeight: 400 }}>{roleTitle}</span>
                    </div>
                  )}

                  {descriptionLines.length > 0 && (
                    <div style={{ marginTop: 6 }}>
                      <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>Mô tả công việc & Đóng góp:</span>
                      <ul style={{ paddingLeft: 18, margin: '4px 0 0 0', color: '#334155', fontSize: 14, lineHeight: 1.7, fontWeight: 400 }}>
                        {descriptionLines.map((line, lIndex) => (
                          line.trim() && <li key={lIndex}>{line.replace(/^•\s*/, '')}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div
                key={index}
                style={{ fontSize: 14.5, color: '#334155', lineHeight: 1.7, marginBottom: 8 }}
              >
                {String(item)}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ExperienceSection;
