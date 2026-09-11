package com.thangbui.cv_management.repositorys;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.thangbui.cv_management.entity.CvApprovalLog;

@Repository
public interface CvApprovalLogRepository extends JpaRepository<CvApprovalLog, Long> {

}
