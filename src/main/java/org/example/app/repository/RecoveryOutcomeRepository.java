package org.example.app.repository;

import org.example.app.entity.RecoveryOutcome;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecoveryOutcomeRepository
        extends JpaRepository<RecoveryOutcome, Long> {

    List<RecoveryOutcome> findByRevenueRiskId(
            Long revenueRiskId
    );

    long countByStatus(
            RecoveryOutcome.OutcomeStatus status
    );
}