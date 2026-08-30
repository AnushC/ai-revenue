package org.example.app.repository;

import org.example.app.entity.RecoveryAction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecoveryActionRepository
        extends JpaRepository<RecoveryAction, Long> {

    long countByRevenueRiskId(
            Long revenueRiskId
    );

    List<RecoveryAction> findByRevenueRiskId(
            Long revenueRiskId
    );

    /*
     * Find the newest pending action for a revenue risk.
     *
     * This is used when a human reviewer approves
     * a case that was previously escalated.
     */
    Optional<RecoveryAction>
    findFirstByRevenueRiskIdAndStatusOrderByCreatedAtDesc(
            Long revenueRiskId,
            RecoveryAction.ActionStatus status
    );
}