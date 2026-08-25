package org.example.app.services;

import org.example.app.entity.AuditLog;
import org.example.app.entity.RecoveryAction;
import org.example.app.entity.RecoveryOutcome;
import org.example.app.entity.RevenueRisk;
import org.example.app.repository.AuditLogRepository;
import org.example.app.repository.RecoveryActionRepository;
import org.example.app.repository.RecoveryOutcomeRepository;
import org.example.app.repository.RevenueRiskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class RecoveryExecutionService {

    private final RecoveryActionRepository recoveryActionRepository;
    private final RecoveryOutcomeRepository recoveryOutcomeRepository;
    private final RevenueRiskRepository revenueRiskRepository;
    private final AuditLogRepository auditLogRepository;

    public RecoveryExecutionService(
            RecoveryActionRepository recoveryActionRepository,
            RecoveryOutcomeRepository recoveryOutcomeRepository,
            RevenueRiskRepository revenueRiskRepository,
            AuditLogRepository auditLogRepository
    ) {
        this.recoveryActionRepository =
                recoveryActionRepository;

        this.recoveryOutcomeRepository =
                recoveryOutcomeRepository;

        this.revenueRiskRepository =
                revenueRiskRepository;

        this.auditLogRepository =
                auditLogRepository;
    }

    @Transactional
    public RecoveryOutcome executeRecovery(
            Long recoveryActionId,
            boolean successful
    ) {

        RecoveryAction recoveryAction =
                recoveryActionRepository
                        .findById(recoveryActionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Recovery action not found: "
                                                + recoveryActionId
                                )
                        );

        RevenueRisk revenueRisk =
                recoveryAction.getRevenueRisk();

        validateAction(recoveryAction, revenueRisk);

        RecoveryOutcome outcome =
                new RecoveryOutcome();

        outcome.setRevenueRisk(revenueRisk);
        outcome.setRecoveryAction(recoveryAction);

        if (successful) {

            handleSuccessfulRecovery(
                    recoveryAction,
                    revenueRisk,
                    outcome
            );

        } else {

            handleFailedRecovery(
                    recoveryAction,
                    revenueRisk,
                    outcome
            );
        }

        return recoveryOutcomeRepository.save(outcome);
    }

    private void validateAction(
            RecoveryAction action,
            RevenueRisk revenueRisk
    ) {

        if (!Boolean.TRUE.equals(action.getApproved())) {
            throw new IllegalStateException(
                    "Blocked recovery action cannot be executed"
            );
        }

        if (action.getStatus()
                != RecoveryAction.ActionStatus.PENDING) {

            throw new IllegalStateException(
                    "Only PENDING recovery actions can be executed"
            );
        }

        if (revenueRisk.getStatus()
                == RevenueRisk.RiskStatus.RECOVERED) {

            throw new IllegalStateException(
                    "Revenue has already been recovered"
            );
        }

        if (revenueRisk.getStatus()
                == RevenueRisk.RiskStatus.STOPPED) {

            throw new IllegalStateException(
                    "Recovery workflow has been stopped"
            );
        }
    }

    private void handleSuccessfulRecovery(
            RecoveryAction action,
            RevenueRisk revenueRisk,
            RecoveryOutcome outcome
    ) {

        BigDecimal recoveredAmount =
                revenueRisk.getAmountAtRisk();

        outcome.setStatus(
                RecoveryOutcome.OutcomeStatus.RECOVERED
        );

        outcome.setAmountRecovered(
                recoveredAmount
        );

        action.setStatus(
                RecoveryAction.ActionStatus.EXECUTED
        );

        action.setExecutedAt(
                LocalDateTime.now()
        );

        revenueRisk.setStatus(
                RevenueRisk.RiskStatus.RECOVERED
        );

        recoveryActionRepository.save(action);
        revenueRiskRepository.save(revenueRisk);

        createAuditLog(
                revenueRisk.getId(),
                "REVENUE_RECOVERED",
                "Recovery succeeded. Amount recovered: "
                        + recoveredAmount
        );
    }

    private void handleFailedRecovery(
            RecoveryAction action,
            RevenueRisk revenueRisk,
            RecoveryOutcome outcome
    ) {

        outcome.setStatus(
                RecoveryOutcome.OutcomeStatus.FAILED
        );

        outcome.setAmountRecovered(
                BigDecimal.ZERO
        );

        action.setStatus(
                RecoveryAction.ActionStatus.FAILED
        );

        action.setExecutedAt(
                LocalDateTime.now()
        );

        revenueRisk.setStatus(
                RevenueRisk.RiskStatus.OPEN
        );

        recoveryActionRepository.save(action);
        revenueRiskRepository.save(revenueRisk);

        createAuditLog(
                revenueRisk.getId(),
                "RECOVERY_FAILED",
                "Recovery action failed: "
                        + action.getActionType()
        );
    }

    private void createAuditLog(
            Long revenueRiskId,
            String eventType,
            String message
    ) {

        AuditLog auditLog =
                new AuditLog();

        auditLog.setRevenueRiskId(
                revenueRiskId
        );

        auditLog.setEventType(
                eventType
        );

        auditLog.setMessage(
                message
        );

        auditLogRepository.save(
                auditLog
        );
    }
}