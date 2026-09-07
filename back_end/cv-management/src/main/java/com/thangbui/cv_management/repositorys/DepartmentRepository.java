package com.thangbui.cv_management.repositorys;

import com.thangbui.cv_management.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository thao tác với bảng departments trong database.
 */
@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    // Tìm phòng ban theo mã phòng ban (ví dụ: "HR", "IT")
    Optional<Department> findByCode(String code);

    // Kiểm tra mã phòng ban đã tồn tại chưa
    boolean existsByCode(String code);

}
