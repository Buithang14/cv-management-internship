import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import AppRoutes from './routes/AppRoutes';

/**
 * Component Root chứa ConfigProvider (Ant Design Enterprise Theme) và RouterProvider
 */
function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          colorSuccess: '#16a34a',
          colorWarning: '#d97706',
          colorError: '#dc2626',
          colorInfo: '#2563eb',
          borderRadius: 6,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          colorBgLayout: '#f4f6f8',
          colorTextBase: '#1e293b',
          colorBorder: '#cbd5e1',
          colorBorderSecondary: '#e2e8f0',
        },
        components: {
          Card: {
            headerFontSize: 15,
            headerHeight: 48,
          },
          Table: {
            headerBg: '#f8fafc',
            headerColor: '#334155',
            rowHoverBg: '#f8fafc',
          },
          Button: {
            controlHeight: 34,
            fontWeight: 500,
          },
        },
      }}
    >
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
