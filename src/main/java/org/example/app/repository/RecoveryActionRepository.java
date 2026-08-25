package org.example.app.repository;

import org.example.app.entity.RecoveryAction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecoveryActionRepository
        extends JpaRepository<RecoveryAction, Long> {

    List<RecoveryAction> findByRevenueRiskId(
            Long revenueRiskId
    );

    long countByRevenueRiskId(
            Long revenueRiskId
    );
}