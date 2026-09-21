import React from 'react';
import { Typography } from 'antd';
import { parseJsonField } from '../../utils/jsonUtils';

const { Text, Paragraph } = Typography;

const ExperienceSection = ({ experiencesJson }) => {
  const experiences = parseJsonField(experiencesJson);

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Section Header */}
      <div style={{ 
        borderBottom: '2px solid #1f1f1f', 
        paddingBottom: 4, 
        fontWeight: 700, 
        fontSize: 14, 
        letterSpacing: 1, 
        marginBottom: 16,
        color: '#1f1f1f'
      }}>
        KINH NGHIỆM LÀM VIỆC
      </div>

      <div style={{ paddingLeft: 4 }}>
        {experiences.length === 0 ? (
          <Text type="secondary">Chưa có thông tin kinh nghiệm làm việc.</Text>
        ) : (
          experiences.map((item, index) => {
            // Trường hợp 1: Dữ liệu dạng Object { company, role, duration/year, description }
            if (typeof item === 'object' && item !== null) {
              const descriptionLines = Array.isArray(item.description)
                ? item.description
                : typeof item.description === 'string'
                ? item.description.split('\n')
                : [];

              return (
                <div key={index} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <Text strong style={{ fontSize: 15, color: '#1f1f1f' }}>
                      {item.company || item.congTy || 'Tên công ty'}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      ( {item.duration || item.durationYears || item.year || item.time || 'Hiện tại'} )
                    </Text>
                  </div>

                  {item.role && (
                    <Text strong style={{ fontSize: 13, color: '#434343', display: 'block', marginBottom: 6 }}>
                      {item.role || item.chucVu}
                    </Text>
                  )}

                  {descriptionLines.length > 0 && (
                    <ul style={{ paddingLeft: 18, margin: '6px 0 0 0', color: '#262626', fontSize: 13, lineHeight: 1.6 }}>
                      {descriptionLines.map((line, lIndex) => (
                        line.trim() && <li key={lIndex}>{line.replace(/^•\s*/, '')}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            }

            // Trường hợp 2: Dữ liệu dạng String (chuỗi text thường)
            return (
              <Paragraph key={index} style={{ whiteSpace: 'pre-line', fontSize: 14, color: '#262626', lineHeight: 1.6, marginBottom: 12 }}>
                {String(item)}
              </Paragraph>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ExperienceSection;
