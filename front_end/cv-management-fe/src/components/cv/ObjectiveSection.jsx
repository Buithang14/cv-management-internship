import React from 'react';

const ObjectiveSection = ({ objective, summary }) => {
  const content = objective || summary;

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
        MỤC TIÊU NGHỀ NGHIỆP & TÓM TẮT BẢN THÂN
      </div>

      <div>
        {content ? (
          <div
            style={{
              fontSize: 15,
              color: '#334155',
              lineHeight: 1.7,
              whiteSpace: 'pre-line',
            }}
          >
            {content}
          </div>
        ) : (
          <div style={{ fontSize: 14, color: '#64748b', fontStyle: 'italic' }}>
            Chưa cập nhật mục tiêu nghề nghiệp và tóm tắt bản thân.
          </div>
        )}
      </div>
    </div>
  );
};

export default ObjectiveSection;
