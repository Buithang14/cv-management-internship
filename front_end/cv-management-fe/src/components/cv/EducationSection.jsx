import React from 'react';
import { parseJsonField } from '../../utils/jsonUtils';

const EducationSection = ({ educationsJson }) => {
  const educations = parseJsonField(educationsJson);

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
        HỌC VẤN
      </div>

      <div>
        {educations.length === 0 ? (
          <div style={{ fontSize: 14, color: '#64748b', fontStyle: 'italic' }}>
            Chưa có thông tin học vấn trong hồ sơ.
          </div>
        ) : (
          educations.map((item, index) => {
            if (typeof item === 'object' && item !== null) {
              const schoolName = item.school || item.university || item.truong;
              const durationTime = item.year || item.duration || item.time || item.nam;
              const majorDegree = item.degree || item.major || item.chuyenNganh;
              const rankGrade = item.grade || item.xepLoai;

              return (
                <div
                  key={index}
                  style={{
                    marginBottom: 14,
                    paddingBottom: index < educations.length - 1 ? 12 : 0,
                    borderBottom: index < educations.length - 1 ? '1px dashed #e2e8f0' : 'none',
                    lineHeight: 1.7,
                  }}
                >
                  {schoolName && (
                    <div style={{ fontSize: 15 }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>Trường đại học / Cơ sở đào tạo: </span>
                      <span style={{ color: '#334155', fontWeight: 400 }}>{schoolName}</span>
                    </div>
                  )}

                  {durationTime && (
                    <div style={{ fontSize: 14.5 }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>Năm bắt đầu - kết thúc: </span>
                      <span style={{ color: '#334155', fontWeight: 400 }}>{durationTime}</span>
                    </div>
                  )}

                  {majorDegree && (
                    <div style={{ fontSize: 14.5 }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>Chuyên ngành / Bằng cấp: </span>
                      <span style={{ color: '#334155', fontWeight: 400 }}>{majorDegree}</span>
                    </div>
                  )}

                  {rankGrade && (
                    <div style={{ fontSize: 14.5 }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>Xếp loại tốt nghiệp: </span>
                      <span style={{ color: '#334155', fontWeight: 400 }}>{rankGrade}</span>
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

export default EducationSection;
