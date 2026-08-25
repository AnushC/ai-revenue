package org.example.app.repository;

import org.example.app.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository
        extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByRevenueRiskIdOrderByCreatedAtAsc(
            Long revenueRiskId
    );
}