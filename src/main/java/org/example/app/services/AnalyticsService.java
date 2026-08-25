package org.example.app.services;

import org.example.app.dto.DashboardAnalytics;
import org.example.app.entity.RecoveryOutcome;
import org.example.app.entity.RevenueRisk;
import org.example.app.repository.RecoveryActionRepository;
import org.example.app.repository.RecoveryOutcomeRepository;
import org.example.app.repository.RevenueRiskRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class AnalyticsService {

    private final RevenueRiskRepository revenueRiskRepository;
    private final RecoveryActionRepository recoveryActionRepository;
    private final RecoveryOutcomeRepository recoveryOutcomeRepository;

    public AnalyticsService(
            RevenueRiskRepository revenueRiskRepository,
            RecoveryActionRepository recoveryActionRepository,
            RecoveryOutcomeRepository recoveryOutcomeRepository
    ) {
        this.revenueRiskRepository = revenueRiskRepository;
        this.recoveryActionRepository = recoveryActionRepository;
        this.recoveryOutcomeRepository = recoveryOutcomeRepository;
    }

    public DashboardAnalytics getDashboardAnalytics() {

        DashboardAnalytics dashboard =
                new DashboardAnalytics();

        List<RevenueRisk> allRisks =
                revenueRiskRepository.findAll();

        List<RecoveryOutcome> allOutcomes =
                recoveryOutcomeRepository.findAll();

        /*
         * Total historical revenue that entered
         * the recovery system.
         */
        BigDecimal totalRevenueAtRisk =
                allRisks.stream()
                        .map(RevenueRisk::getAmountAtRisk)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        /*
         * Actual recovered money.
         */
        BigDecimal totalRevenueRecovered =
                allOutcomes.stream()
                        .filter(outcome ->
                                outcome.getStatus()
                                        == RecoveryOutcome
                                        .OutcomeStatus
                                        .RECOVERED
                        )
                        .map(
                                RecoveryOutcome::getAmountRecovered
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        double recoveryRate = 0.0;

        if (totalRevenueAtRisk.compareTo(
                BigDecimal.ZERO) > 0) {

            recoveryRate =
                    totalRevenueRecovered
                            .divide(
                                    totalRevenueAtRisk,
                                    4,
                                    RoundingMode.HALF_UP
                            )
                            .multiply(
                                    BigDecimal.valueOf(100)
                            )
                            .doubleValue();
        }

        long totalRiskCases =
                revenueRiskRepository.count();

        long openCases =
                revenueRiskRepository.countByStatus(
                        RevenueRisk.RiskStatus.OPEN
                );

        long inRecoveryCases =
                revenueRiskRepository.countByStatus(
                        RevenueRisk.RiskStatus.IN_RECOVERY
                );

        long recoveredCases =
                revenueRiskRepository.countByStatus(
                        RevenueRisk.RiskStatus.RECOVERED
                );

        long totalRecoveryAttempts =
                recoveryActionRepository.count();

        long successfulRecoveries =
                recoveryOutcomeRepository.countByStatus(
                        RecoveryOutcome
                                .OutcomeStatus
                                .RECOVERED
                );

        long failedRecoveries =
                recoveryOutcomeRepository.countByStatus(
                        RecoveryOutcome
                                .OutcomeStatus
                                .FAILED
                );

        dashboard.setTotalRevenueAtRisk(
                totalRevenueAtRisk
        );

        dashboard.setTotalRevenueRecovered(
                totalRevenueRecovered
        );

        dashboard.setRecoveryRate(
                recoveryRate
        );

        dashboard.setTotalRiskCases(
                totalRiskCases
        );

        dashboard.setOpenCases(
                openCases
        );

        dashboard.setInRecoveryCases(
                inRecoveryCases
        );

        dashboard.setRecoveredCases(
                recoveredCases
        );

        dashboard.setTotalRecoveryAttempts(
                totalRecoveryAttempts
        );

        dashboard.setSuccessfulRecoveries(
                successfulRecoveries
        );

        dashboard.setFailedRecoveries(
                failedRecoveries
        );

        return dashboard;
    }
}