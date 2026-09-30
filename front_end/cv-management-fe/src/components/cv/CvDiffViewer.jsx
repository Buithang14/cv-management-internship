import React from 'react';
import { Card, Row, Col, Tag, Typography, Alert, Space } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { parseJsonField } from '../../utils/jsonUtils';

const { Text } = Typography;

/**
 * Component So Sánh CV Cũ (Active) và Bản Nháp Mới (Draft) - Diff Viewer
 * Giúp người duyệt (Tech Lead / HR) phát hiện ngay lập tức các điểm thay đổi
 */
const CvDiffViewer = ({ activeCv, draftCv }) => {
  if (!draftCv) return null;

  // Trường hợp nhân viên mới toanh, chưa có CV cũ
  if (!activeCv) {
    return (
      <div style={{ padding: '20px 0' }}>
        <Alert
          message="Hồ Sơ CV Khởi Tạo Lần Đầu (Phiên Bản v1)"
          description="Nhân sự này chưa có phiên bản CV chính thức trước đó để so sánh thay đổi. Toàn bộ nội dung bản nháp này là thông tin mới hoàn toàn. Vui lòng chuyển sang tab 'Xem Toàn Bộ CV' để kiểm tra chi tiết."
          type="info"
          showIcon
        />
      </div>
    );
  }

  // 1. Phân tích Kỹ Năng
  const oldSkills = parseJsonField(activeCv.skillsJson).map((s) =>
    typeof s === 'object' && s !== null ? (s.name || s.skill || JSON.stringify(s)) : String(s)
  );
  const newSkills = parseJsonField(draftCv.skillsJson).map((s) =>
    typeof s === 'object' && s !== null ? (s.name || s.skill || JSON.stringify(s)) : String(s)
  );

  const addedSkills = newSkills.filter((s) => !oldSkills.includes(s));
  const removedSkills = oldSkills.filter((s) => !newSkills.includes(s));

  // 2. Phân tích Kinh Nghiệm
  const oldExps = parseJsonField(activeCv.experiencesJson);
  const newExps = parseJsonField(draftCv.experiencesJson);

  // 3. Phân tích Học Vấn
  const oldEdus = parseJsonField(activeCv.educationsJson);
  const newEdus = parseJsonField(draftCv.educationsJson);

  // Kiểm tra xem trường text có thay đổi không
  const isPhoneChanged = (activeCv.phone || '').trim() !== (draftCv.phone || '').trim();
  const isSummaryChanged = (activeCv.summary || '').trim() !== (draftCv.summary || '').trim();
  const isObjectiveChanged = (activeCv.objective || '').trim() !== (draftCv.objective || '').trim();
  const isFullNameChanged = (activeCv.fullName || '').trim() !== (draftCv.fullName || '').trim();

  const totalChanges =
    (isPhoneChanged ? 1 : 0) +
    (isSummaryChanged ? 1 : 0) +
    (isObjectiveChanged ? 1 : 0) +
    (isFullNameChanged ? 1 : 0) +
    addedSkills.length +
    removedSkills.length +
    Math.abs(newExps.length - oldExps.length) +
    Math.abs(newEdus.length - oldEdus.length);

  return (
    <div style={{ padding: '8px 0' }}>
      {/* Banner Tổng kết điểm thay đổi */}
      <div
        style={{
          background: totalChanges > 0 ? '#eff6ff' : '#f8fafc',
          border: `1px solid ${totalChanges > 0 ? '#bfdbfe' : '#e2e8f0'}`,
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SwapOutlined style={{ fontSize: 18, color: '#2563eb' }} />
          <div>
            <Text strong style={{ fontSize: 14, color: '#1e3a8a' }}>
              Bản đối chiếu thay đổi (v{activeCv.version || 1} &rarr; v{(activeCv.version || 1) + 1})
            </Text>
            <div style={{ fontSize: 12.5, color: '#475569' }}>
              Phát hiện khoảng <strong>{totalChanges}</strong> mục có sự cập nhật hoặc thêm mới trong bản nháp.
            </div>
          </div>
        </div>

        <Space wrap>
          {addedSkills.length > 0 && (
            <Tag color="success" style={{ fontWeight: 600 }}>
              +{addedSkills.length} kỹ năng mới
            </Tag>
          )}
          {newExps.length > oldExps.length && (
            <Tag color="processing" style={{ fontWeight: 600 }}>
              +{newExps.length - oldExps.length} kinh nghiệm mới
            </Tag>
          )}
          {isSummaryChanged && (
            <Tag color="warning" style={{ fontWeight: 600 }}>
              Cập nhật mục tiêu / tóm tắt
            </Tag>
          )}
        </Space>
      </div>

      {/* Header 2 Cột Đối Chiếu */}
      <Row gutter={16} style={{ marginBottom: 12 }}>
        <Col span={12}>
          <div
            style={{
              padding: '8px 12px',
              background: '#f1f5f9',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text strong style={{ fontSize: 13, color: '#334155' }}>
              PHIÊN BẢN CŨ ĐANG HOẠT ĐỘNG (v{activeCv.version || 1})
            </Text>
            <Tag color="default">Đang Active</Tag>
          </div>
        </Col>

        <Col span={12}>
          <div
            style={{
              padding: '8px 12px',
              background: '#ecfdf5',
              borderRadius: 6,
              border: '1px solid #a7f3d0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text strong style={{ fontSize: 13, color: '#065f46' }}>
              BẢN NHÁP MỚI ĐỀ XUẤT (v{(activeCv.version || 1) + 1})
            </Text>
            <Tag color="success">Bản Nộp Mới</Tag>
          </div>
        </Col>
      </Row>

      {/* ─── 1. THÔNG TIN LIÊN LẠC & CÁ NHÂN ─── */}
      <Card
        size="small"
        bordered
        title={<span style={{ fontWeight: 600, fontSize: 13.5 }}>1. THÔNG TIN CÁ NHÂN & LIÊN LẠC</span>}
        style={{ marginBottom: 16, borderRadius: 6 }}
      >
        <Row gutter={16} align="middle" style={{ padding: '6px 0', borderBottom: '1px dashed #f1f5f9' }}>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Họ và tên:</Text>
            <Text strong style={{ fontSize: 13.5 }}>{activeCv.fullName || activeCv.userFullName || '—'}</Text>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Họ và tên mới:</Text>
            <Text
              strong
              style={{
                fontSize: 13.5,
                color: isFullNameChanged ? '#16a34a' : '#0f172a',
                background: isFullNameChanged ? '#dcfce7' : 'transparent',
                padding: isFullNameChanged ? '2px 6px' : 0,
                borderRadius: 4,
              }}
            >
              {draftCv.fullName || draftCv.userFullName || '—'}
            </Text>
          </Col>
        </Row>

        <Row gutter={16} align="middle" style={{ padding: '6px 0', borderBottom: '1px dashed #f1f5f9' }}>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Email liên hệ:</Text>
            <Text style={{ fontSize: 13.5 }}>{activeCv.email || draftCv.email || 'Chưa cập nhật'}</Text>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Email:</Text>
            <Text style={{ fontSize: 13.5 }}>{draftCv.email || activeCv.email || 'Chưa cập nhật'}</Text>
          </Col>
        </Row>

        <Row gutter={16} align="middle" style={{ padding: '6px 0' }}>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Số điện thoại:</Text>
            <Text style={{ fontSize: 13.5 }}>{activeCv.phone || 'Chưa cập nhật'}</Text>
          </Col>
          <Col span={12}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Số điện thoại mới:</Text>
            <span
              style={{
                fontSize: 13.5,
                fontWeight: isPhoneChanged ? 600 : 400,
                color: isPhoneChanged ? '#16a34a' : '#0f172a',
                background: isPhoneChanged ? '#dcfce7' : 'transparent',
                padding: isPhoneChanged ? '2px 6px' : 0,
                borderRadius: 4,
              }}
            >
              {draftCv.phone || 'Chưa cập nhật'}
              {isPhoneChanged && <Tag color="success" style={{ marginLeft: 8, fontSize: 11 }}>Đã sửa</Tag>}
            </span>
          </Col>
        </Row>
      </Card>

      {/* ─── 2. TÓM TẮT & MỤC TIÊU NGHỀ NGHIỆP ─── */}
      <Card
        size="small"
        bordered
        title={<span style={{ fontWeight: 600, fontSize: 13.5 }}>2. TÓM TẮT BẢN THÂN & MỤC TIÊU NGHỀ NGHIỆP</span>}
        style={{ marginBottom: 16, borderRadius: 6 }}
      >
        <Row gutter={16} style={{ marginBottom: 12, paddingBottom: 10, borderBottom: '1px dashed #f1f5f9' }}>
          <Col span={12} style={{ borderRight: '1px solid #f1f5f9', paddingRight: 16 }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tóm tắt bản thân (Cũ):</Text>
            <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
              {activeCv.summary || <Text italic type="secondary">Chưa có thông tin</Text>}
            </div>
          </Col>
          <Col span={12} style={{ paddingLeft: 16 }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              Tóm tắt bản thân (Mới) {isSummaryChanged && <Tag color="warning" style={{ fontSize: 11, margin: 0 }}>Đã sửa</Tag>}
            </Text>
            <div
              style={{
                fontSize: 13,
                color: isSummaryChanged ? '#0f172a' : '#475569',
                background: isSummaryChanged ? '#fefce8' : 'transparent',
                padding: isSummaryChanged ? '6px 10px' : 0,
                borderRadius: 4,
                border: isSummaryChanged ? '1px dashed #fde047' : 'none',
                lineHeight: 1.6,
              }}
            >
              {draftCv.summary || <Text italic type="secondary">Chưa có thông tin</Text>}
            </div>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12} style={{ borderRight: '1px solid #f1f5f9', paddingRight: 16 }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Mục tiêu nghề nghiệp (Cũ):</Text>
            <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
              {activeCv.objective || <Text italic type="secondary">Chưa có thông tin</Text>}
            </div>
          </Col>
          <Col span={12} style={{ paddingLeft: 16 }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              Mục tiêu nghề nghiệp (Mới) {isObjectiveChanged && <Tag color="warning" style={{ fontSize: 11, margin: 0 }}>Đã sửa</Tag>}
            </Text>
            <div
              style={{
                fontSize: 13,
                color: isObjectiveChanged ? '#0f172a' : '#475569',
                background: isObjectiveChanged ? '#fefce8' : 'transparent',
                padding: isObjectiveChanged ? '6px 10px' : 0,
                borderRadius: 4,
                border: isObjectiveChanged ? '1px dashed #fde047' : 'none',
                lineHeight: 1.6,
              }}
            >
              {draftCv.objective || <Text italic type="secondary">Chưa có thông tin</Text>}
            </div>
          </Col>
        </Row>
      </Card>

      {/* ─── 3. KỸ NĂNG CHUYÊN MÔN (DIFF SKILLS) ─── */}
      <Card
        size="small"
        bordered
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 13.5 }}>3. KỸ NĂNG CHUYÊN MÔN (SKILLS)</span>
            <Space size={6}>
              {addedSkills.length > 0 && <Tag color="success">+{addedSkills.length} mới</Tag>}
              {removedSkills.length > 0 && <Tag color="error">-{removedSkills.length} bỏ</Tag>}
            </Space>
          </div>
        }
        style={{ marginBottom: 16, borderRadius: 6 }}
      >
        <Row gutter={16}>
          <Col span={12} style={{ borderRight: '1px solid #f1f5f9', paddingRight: 16 }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
              Kỹ năng bản cũ ({oldSkills.length}):
            </Text>
            <div>
              {oldSkills.length === 0 ? (
                <Text type="secondary" italic>Chưa có kỹ năng nào</Text>
              ) : (
                oldSkills.map((s, idx) => (
                  <Tag
                    key={idx}
                    color={removedSkills.includes(s) ? 'default' : 'blue'}
                    style={{
                      marginBottom: 6,
                      textDecoration: removedSkills.includes(s) ? 'line-through' : 'none',
                      opacity: removedSkills.includes(s) ? 0.6 : 1,
                    }}
                  >
                    {s}
                  </Tag>
                ))
              )}
            </div>
          </Col>

          <Col span={12} style={{ paddingLeft: 16 }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
              Kỹ năng bản mới ({newSkills.length}):
            </Text>
            <div>
              {newSkills.length === 0 ? (
                <Text type="secondary" italic>Chưa có kỹ năng nào</Text>
              ) : (
                newSkills.map((s, idx) => {
                  const isNew = addedSkills.includes(s);
                  return (
                    <Tag
                      key={idx}
                      color={isNew ? 'success' : 'blue'}
                      style={{
                        marginBottom: 6,
                        fontWeight: isNew ? 600 : 400,
                        borderWidth: isNew ? 1.5 : 1,
                      }}
                    >
                      {isNew ? `+ ${s} (Mới)` : s}
                    </Tag>
                  );
                })
              )}
            </div>
          </Col>
        </Row>
      </Card>

      {/* ─── 4. KINH NGHIỆM LÀM VIỆC ─── */}
      <Card
        size="small"
        bordered
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 13.5 }}>4. KINH NGHIỆM LÀM VIỆC & DỰ ÁN</span>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Cũ: {oldExps.length} mục | Mới: {newExps.length} mục
            </Text>
          </div>
        }
        style={{ marginBottom: 16, borderRadius: 6 }}
      >
        <Row gutter={16}>
          <Col span={12} style={{ borderRight: '1px solid #f1f5f9', paddingRight: 16 }}>
            {oldExps.length === 0 ? (
              <Text type="secondary" italic>Chưa có thông tin</Text>
            ) : (
              oldExps.map((item, idx) => {
                const comp = typeof item === 'object' ? item.company || item.congTy || 'Công ty' : String(item);
                const role = typeof item === 'object' ? item.role || item.chucVu || item.position : '';
                const time = typeof item === 'object' ? item.duration || item.time : '';
                return (
                  <div key={idx} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px dashed #f1f5f9' }}>
                    <div style={{ fontWeight: 600, color: '#334155', fontSize: 13 }}>{comp}</div>
                    {role && <div style={{ fontSize: 12, color: '#64748b' }}>{role} {time && `(${time})`}</div>}
                  </div>
                );
              })
            )}
          </Col>

          <Col span={12} style={{ paddingLeft: 16 }}>
            {newExps.length === 0 ? (
              <Text type="secondary" italic>Chưa có thông tin</Text>
            ) : (
              newExps.map((item, idx) => {
                const comp = typeof item === 'object' ? item.company || item.congTy || 'Công ty' : String(item);
                const role = typeof item === 'object' ? item.role || item.chucVu || item.position : '';
                const time = typeof item === 'object' ? item.duration || item.time : '';
                const isExtra = idx >= oldExps.length;
                return (
                  <div
                    key={idx}
                    style={{
                      marginBottom: 10,
                      padding: isExtra ? '8px 10px' : '0 0 10px 0',
                      background: isExtra ? '#ecfdf5' : 'transparent',
                      borderRadius: isExtra ? 6 : 0,
                      border: isExtra ? '1px solid #a7f3d0' : 'none',
                      borderBottom: !isExtra ? '1px dashed #f1f5f9' : '1px solid #a7f3d0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>{comp}</span>
                      {isExtra && <Tag color="success" style={{ fontSize: 11, margin: 0 }}>Kinh nghiệm mới</Tag>}
                    </div>
                    {role && <div style={{ fontSize: 12, color: '#475569' }}>{role} {time && `(${time})`}</div>}
                  </div>
                );
              })
            )}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default CvDiffViewer;
