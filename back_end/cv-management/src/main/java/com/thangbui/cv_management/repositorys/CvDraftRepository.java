package com.thangbui.cv_management.repositorys;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.thangbui.cv_management.entity.CvDraft;
import com.thangbui.cv_management.enums.DraftStatus;
import java.util.List;

// interface này quản lý Entity CvDraft với kiểu dữ liệu khóa chính là (Primary Key id) là Long
@Repository
public interface CvDraftRepository extends JpaRepository<CvDraft, Long> {
    public Optional<CvDraft> findByUserIdAndStatus(Long userId, DraftStatus status);

    public List<CvDraft> findByStatusAndUserDepartmentId(DraftStatus status, Long departmentId);
}
