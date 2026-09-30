package com.thangbui.cv_management.repositorys;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.thangbui.cv_management.entity.CvDraft;
import com.thangbui.cv_management.enums.CvLanguage;
import com.thangbui.cv_management.enums.DraftStatus;
import java.util.List;

// interface này quản lý Entity CvDraft với kiểu dữ liệu khóa chính là (Primary Key id) là Long
@Repository
public interface CvDraftRepository extends JpaRepository<CvDraft, Long> {
    public Optional<CvDraft> findByUserIdAndStatus(Long userId, DraftStatus status);

    public Optional<CvDraft> findFirstByUserIdAndStatusInOrderByUpdatedAtDesc(Long userId, List<DraftStatus> statuses);

    public Optional<CvDraft> findFirstByUserIdOrderByUpdatedAtDesc(Long userId);

    public boolean existsByUserIdAndStatusIn(Long userId, List<DraftStatus> statuses);

    // Queries theo ngôn ngữ (Localization)
    public Optional<CvDraft> findByUserIdAndLanguageAndStatus(Long userId, CvLanguage language, DraftStatus status);

    public Optional<CvDraft> findFirstByUserIdAndLanguageAndStatusInOrderByUpdatedAtDesc(Long userId, CvLanguage language, List<DraftStatus> statuses);

    public Optional<CvDraft> findFirstByUserIdAndLanguageOrderByUpdatedAtDesc(Long userId, CvLanguage language);

    public boolean existsByUserIdAndLanguageAndStatusIn(Long userId, CvLanguage language, List<DraftStatus> statuses);

    public List<CvDraft> findByStatusAndUserDepartmentId(DraftStatus status, Long departmentId);

    public List<CvDraft> findByStatus(DraftStatus status);

    // Dashboard: đếm số bản nháp đang chờ duyệt (PENDING_TECH + PENDING_HR)
    long countByStatusIn(List<DraftStatus> statuses);
}
