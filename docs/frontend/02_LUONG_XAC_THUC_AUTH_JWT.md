# 02. Chi Tiết Luồng Xác Thực Auth & JWT Token

Tài liệu giải thích chi tiết cơ chế Đăng nhập và Quản lý Token giữa Front-End (React) và Back-End (Spring Boot).

---

## 🔄 1. Luồng Dữ Liệu Khi Người Dùng Đăng Nhập (Login Data Flow)

```text
1. User điền Form (Username, Password) trên LoginPage.jsx
   │
2. Nhấn "Đăng nhập" -> Hàm onFinish(values) thực thi
   │
3. Gọi authApi.login({ username, password })
   │
4. axiosClient gửi HTTP POST /api/v1/auth/login sang Spring Boot AuthController
   │
5. AuthController (BE) xác thực password -> Trả về JWT Token dạng JSON:
   {
     "code": 1000,
     "result": {
       "token": "eyJhbGciOiJIUzI1NiJ9...",
       "username": "admin",
       "role": "ADMIN"
     }
   }
   │
6. Front-End nhận response -> Lưu Token & Thông tin User vào localStorage:
   localStorage.setItem('token', token);
   localStorage.setItem('user', JSON.stringify(user));
   │
7. Chuyển hướng trình duyệt tới trang /dashboard bằng hook useNavigate()
```

---

## 🛡️ 2. Cơ Chế Tự Động Gắn Token Vào Mọi Request (Request Interceptor)

Để người dùng không phải đăng nhập lại mỗi khi thực hiện thao tác (tạo CV, xem danh sách CV, duyệt CV...):

Mọi API sau đó đều đi qua **`axiosClient.interceptors.request`**:

```javascript
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Tự động gắn Token vào Header của mọi HTTP Request gửi đi
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## ⚠️ 3. Cơ Chế Xử Lý Lỗi Khi Token Hết Hạn (Response Interceptor)

Khi Token hết hạn (Expired) hoặc bị vô hiệu hóa, Spring Boot sẽ trả về lỗi **HTTP 401 Unauthorized**.

Mọi response trả về đều đi qua **`axiosClient.interceptors.response`**:

```javascript
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Xóa sạch Token cũ và thông tin user trong localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Chuyển ngay người dùng về trang Đăng nhập
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```
