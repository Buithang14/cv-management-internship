package com.thangbui.cv_management.repositorys;

import org.springframework.data.jpa.repository.JpaRepository;

import com.thangbui.cv_management.entity.CvApprovalLog;

public interface CvApprovalLogRepository extends JpaRepository<CvApprovalLog, Long> {

}
