import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

/**
 * Màn hình báo lỗi 403 Forbidden (Không có quyền truy cập)
 */
const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="403"
      title="403"
      subTitle="Rất tiếc, bạn không có quyền truy cập vào trang này."
      extra={
        <Button type="primary" onClick={() => navigate('/dashboard')}>
          Quay lại Trang chủ
        </Button>
      }
    />
  );
};

export default UnauthorizedPage;
