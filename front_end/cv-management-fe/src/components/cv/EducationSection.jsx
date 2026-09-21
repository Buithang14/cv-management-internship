import React from 'react';
import { Typography } from 'antd';
import { parseJsonField } from '../../utils/jsonUtils';

const { Text, Paragraph } = Typography;

const EducationSection = ({ educationsJson }) => {
  const educations = parseJsonField(educationsJson);

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Section Header Block */}
      <div style={{ 
        background: '#1f1f1f', 
        color: '#ffffff', 
        padding: '6px 12px', 
        fontWeight: 700, 
        fontSize: 14, 
        letterSpacing: 1, 
        marginBottom: 16,
        display: 'inline-block',
        minWidth: 160
      }}>
        HỌC VẤN
      </div>

      <div style={{ paddingLeft: 4 }}>
        {educations.length === 0 ? (
          <Text type="secondary">Chưa có thông tin học vấn.</Text>
        ) : (
          educations.map((item, index) => {
            // Trường hợp 1: Dữ liệu dạng Object { school, degree, year/duration, grade }
            if (typeof item === 'object' && item !== null) {
              return (
                <div key={index} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <Text strong style={{ fontSize: 15, color: '#1f1f1f' }}>
                      {item.school || item.university || item.truong || 'Trường học'}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.year || item.duration || item.time || item.nam || ''}
                    </Text>
                  </div>
                  {item.degree && (
                    <Text style={{ fontSize: 13, color: '#595959', display: 'block' }}>
                      Chuyên ngành: {item.degree || item.major}
                    </Text>
                  )}
                  {item.grade && (
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                      Xếp loại: {item.grade}
                    </Text>
                  )}
                </div>
              );
            }

            // Trường hợp 2: Dữ liệu dạng String (chuỗi text thường)
            return (
              <Paragraph key={index} style={{ whiteSpace: 'pre-line', fontSize: 14, color: '#262626', marginBottom: 8 }}>
                {String(item)}
              </Paragraph>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EducationSection;
