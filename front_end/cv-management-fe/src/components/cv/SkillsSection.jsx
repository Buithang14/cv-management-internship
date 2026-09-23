import React from 'react';
import { Typography, Tag } from 'antd';
import { parseJsonField } from '../../utils/jsonUtils';

const { Text } = Typography;

const SkillsSection = ({ skillsJson }) => {
  const skills = parseJsonField(skillsJson);

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
        KỸ NĂNG CHUYÊN MÔN
      </div>

      <div>
        {skills.length === 0 ? (
          <div style={{ fontSize: 14, color: '#64748b', fontStyle: 'italic' }}>
            Chưa cập nhật kỹ năng.
          </div>
        ) : (
          <ul style={{ paddingLeft: 18, margin: 0, color: '#64748b', fontSize: 14.5, lineHeight: 1.9 }}>
            {skills.map((skill, index) => {
              if (typeof skill === 'object' && skill !== null) {
                const skillName = skill.name || skill.skill || JSON.stringify(skill);
                const skillLevel = skill.level || skill.trinhDo;
                return (
                  <li key={index} style={{ marginBottom: 4 }}>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>{skillName}</span>
                    {skillLevel && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 11.5,
                          padding: '2px 7px',
                          borderRadius: 4,
                          background: '#f1f5f9',
                          color: '#64748b',
                          border: '1px solid #e2e8f0',
                          fontWeight: 400,
                        }}
                      >
                        {skillLevel}
                      </span>
                    )}
                  </li>
                );
              }

              return (
                <li key={index} style={{ marginBottom: 4 }}>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{String(skill)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SkillsSection;
