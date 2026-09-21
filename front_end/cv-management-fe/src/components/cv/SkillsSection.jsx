import React from 'react';
import { Typography } from 'antd';
import { parseJsonField } from '../../utils/jsonUtils';

const { Text, Paragraph } = Typography;

const SkillsSection = ({ skillsJson }) => {
  const skills = parseJsonField(skillsJson);

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Section Header */}
      <div style={{ 
        borderBottom: '2px solid #1f1f1f', 
        paddingBottom: 4, 
        fontWeight: 700, 
        fontSize: 14, 
        letterSpacing: 1, 
        marginBottom: 12,
        color: '#1f1f1f'
      }}>
        KỸ NĂNG
      </div>

      <div>
        {skills.length === 0 ? (
          <Text type="secondary">Chưa cập nhật kỹ năng.</Text>
        ) : (
          <ul style={{ paddingLeft: 18, margin: 0, color: '#262626', fontSize: 13, lineHeight: 1.6 }}>
            {skills.map((skill, index) => {
              const skillText = typeof skill === 'object' ? (skill.name || skill.skill || JSON.stringify(skill)) : String(skill);
              return <li key={index}>{skillText}</li>;
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SkillsSection;
