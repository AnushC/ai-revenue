package org.example.app.repository;

import org.example.app.entity.RevenueRisk;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RevenueRiskRepository
        extends JpaRepository<RevenueRisk, Long> {

    List<RevenueRisk> findByReviewStatus(
            RevenueRisk.ReviewStatus reviewStatus
    );

    List<RevenueRisk> findByStatus(
            RevenueRisk.RiskStatus status
    );

    long countByStatus(
            RevenueRisk.RiskStatus status
    );
}