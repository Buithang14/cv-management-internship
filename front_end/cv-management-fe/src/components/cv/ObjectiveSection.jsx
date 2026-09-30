import React from 'react';

const ObjectiveSection = ({ objective, summary }) => {
  const hasSummary = summary && summary.trim();
  const hasObjective = objective && objective.trim();

  if (!hasSummary && !hasObjective) {
    return (
      <div style={{ marginBottom: 28 }}>
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
          GIỚI THIỆU & MỤC TIÊU NGHỀ NGHIỆP
        </div>
        <div style={{ fontSize: 14, color: '#64748b', fontStyle: 'italic' }}>
          Chưa cập nhật thông tin giới thiệu và mục tiêu nghề nghiệp.
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 28 }}>
      {hasSummary && (
        <div style={{ marginBottom: hasObjective ? 20 : 0 }}>
          <div
            style={{
              borderBottom: '1.5px solid #cbd5e1',
              paddingBottom: 6,
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: 0.6,
              marginBottom: 10,
              color: '#0f172a',
              textTransform: 'uppercase',
            }}
          >
            TÓM TẮT BẢN THÂN
          </div>
          <div
            style={{
              fontSize: 15,
              color: '#334155',
              lineHeight: 1.7,
              whiteSpace: 'pre-line',
            }}
          >
            {summary}
          </div>
        </div>
      )}

      {hasObjective && (
        <div>
          <div
            style={{
              borderBottom: '1.5px solid #cbd5e1',
              paddingBottom: 6,
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: 0.6,
              marginBottom: 10,
              color: '#0f172a',
              textTransform: 'uppercase',
            }}
          >
            MỤC TIÊU NGHỀ NGHIỆP
          </div>
          <div
            style={{
              fontSize: 15,
              color: '#334155',
              lineHeight: 1.7,
              whiteSpace: 'pre-line',
            }}
          >
            {objective}
          </div>
        </div>
      )}
    </div>
  );
};

export default ObjectiveSection;
