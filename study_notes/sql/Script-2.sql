

USE cv_management;
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    department_code VARCHAR(20) NOT NULL UNIQUE, #bắt buộc phải nhập (NOT NULL) và không được trùng lặp với phòng khác (UNIQUE).
    department_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP  #Ngày giờ tạo dữ liệu, nếu không nhập sẽ tự động lấy 
    #chính xác thời điểm hiện tại của hệ thống (CURRENT_TIMESTAMP).
);

CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone_number VARCHAR(20),
    department_id INT,
    position VARCHAR(50),
    age INT,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

INSERT INTO departments (department_code, department_name, description) VALUES
('P.KTCN', 'Phòng Kỹ thuật Công nghệ', 'Phụ trách phát triển phần mềm'),
('BU1', 'Business Unit 1', 'Đơn vị kinh doanh 1'),
('P.QLCL', 'Phòng Quản lý Chất lượng', 'Đảm bảo chất lượng sản phẩm');

INSERT INTO departments (department_code, department_name, description) VALUES
('P.KTPM', 'Phòng Kiểm Thử Phần Mềm', 'Phụ trách kiểm thử phần mềm');

INSERT INTO employees (full_name, email, phone_number, department_id, position, age) VALUES
('Nguyen Van A', 'a.nguyen@company.com', '0901234567', 1, 'Junior Developer', 24),
('Tran Thi B', 'b.tran@company.com', '0912345678', 1, 'Senior Developer', 28),
('Le Van C', 'c.le@company.com', '0923456789', 2, 'Business Analyst', 26),
('Le Van E', 'e.le@company.com', '0928766789', 2, 'Business Analyst', 27),
('Le Thi L', 'l.le@company.com', '0923496489', 3, 'Testing', 25),
('Pham Thi D', 'd.pham@company.com', '0934567890', 3, 'QC Leader', 27);

#Lấy toàn bộ nhân viên 
SELECT * FROM employees;
-- Lọc nhân viên phòng KTCN (id = 1) và tuổi > 25
SELECT full_name, position, age FROM employees WHERE department_id = 1 && age >25;
-- Sắp xếp nhân viên theo tuổi giảm dần
SELECT * FROM employees ORDER BY age DESC ;

-- Thăng chức cho Nguyen Van A
UPDATE employees SET position = 'MID - Level Developer', age = 30 WHERE id = 1;

-- Lấy nhân viên kèm tên phòng ban
SELECT 
     e.full_name,
     e.position,
     d.department_name
     FROM employees e INNER JOIN departments d ON e.department_id =d.id; 

-- Lấy TẤT CẢ phòng ban, kể cả phòng chưa có ai
SELECT
     d.department_name,
     e.full_name
     FROM departments d LEFT JOIN employees e ON e.department_id = d.id;

-- Đếm số nhân viên mỗi phòng 
-- Tìm các phòng ban có TỪ 2 nhân viên trở lên (LỌC)
SELECT  
     d.department_name,
     count(e.id)  AS total_employees
     FROM departments d LEFT JOIN employees e ON e.department_id = d.id
     GROUP BY d.department_name
     HAVING COUNT(e.id) >=2;