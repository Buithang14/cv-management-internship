/**
 * Utility Safe Parse JSON cho các trường dữ liệu CV
 * Chuyển đổi an toàn chuỗi JSON string / Object / Array / Plain text thành mảng JavaScript
 * Đảm bảo KHÔNG BAO GIỜ làm crash ứng dụng khi JSON bị lỗi hoặc null.
 */
export const parseJsonField = (fieldValue) => {
  if (!fieldValue) return [];

  if (typeof fieldValue === 'object') {
    return Array.isArray(fieldValue) ? fieldValue : [fieldValue];
  }

  if (typeof fieldValue === 'string') {
    const trimmed = fieldValue.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === 'object' && parsed !== null) return [parsed];
      return [parsed];
    } catch (e) {
      return [trimmed];
    }
  }

  return [];
};
