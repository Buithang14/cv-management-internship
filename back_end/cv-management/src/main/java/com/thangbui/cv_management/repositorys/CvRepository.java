package com.thangbui.cv_management.repositorys;

import com.thangbui.cv_management.entity.Cv;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository thao tác với bảng cvs trong database.
 */
@Repository
public interface CvRepository extends JpaRepository<Cv, Long> {

    // tìm theo id của user và isActive = true , tức là bản còn khả dụng

    Optional<Cv> findByUserIdAndIsActiveTrue(Long userId);

}
