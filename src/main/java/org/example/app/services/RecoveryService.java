package org.example.app.services;

import org.example.app.entity.AuditLog;
import org.example.app.entity.RecoveryAction;
import org.example.app.entity.RevenueRisk;
import org.example.app.repository.AuditLogRepository;
import org.example.app.repository.RecoveryActionRepository;
import org.example.app.repository.RevenueRiskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RecoveryService {

    private final RevenueRiskRepository revenueRiskRepository;
    private final RecoveryActionRepository recoveryActionRepository;
    private final AuditLogRepository auditLogRepository;
    private final PolicyService policyService;

    public RecoveryService(
            RevenueRiskRepository revenueRiskRepository,
            RecoveryActionRepository recoveryActionRepository,
            AuditLogRepository auditLogRepository,
            PolicyService policyService
    ) {
        this.revenueRiskRepository = revenueRiskRepository;
        this.recoveryActionRepository = recoveryActionRepository;
        this.auditLogRepository = auditLogRepository;
        this.policyService = policyService;
    }

    @Transactional
    public RecoveryAction startRecovery(Long revenueRiskId) {

        RevenueRisk revenueRisk =
                revenueRiskRepository.findById(revenueRiskId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Revenue risk not found: "
                                                + revenueRiskId
                                )
                        );

        RecoveryAction.ActionType actionType =
                determineRecoveryAction(revenueRisk);

        String reason =
                determineActionReason(revenueRisk);

        boolean approved =
                policyService.isActionAllowed(
                        revenueRisk,
                        actionType
                );

        RecoveryAction recoveryAction =
                new RecoveryAction();

        recoveryAction.setRevenueRisk(revenueRisk);
        recoveryAction.setActionType(actionType);
        recoveryAction.setReason(reason);
        recoveryAction.setApproved(approved);

        if (approved) {

            recoveryAction.setStatus(
                    RecoveryAction.ActionStatus.PENDING
            );

            revenueRisk.setStatus(
                    RevenueRisk.RiskStatus.IN_RECOVERY
            );

            createAuditLog(
                    revenueRisk.getId(),
                    "RECOVERY_APPROVED",
                    "Recovery action approved: "
                            + actionType
                            + ". Reason: "
                            + reason
            );

        } else {

            recoveryAction.setStatus(
                    RecoveryAction.ActionStatus.BLOCKED
            );

            createAuditLog(
                    revenueRisk.getId(),
                    "RECOVERY_BLOCKED",
                    "Recovery action blocked by policy engine: "
                            + actionType
            );
        }

        revenueRiskRepository.save(revenueRisk);

        return recoveryActionRepository.save(
                recoveryAction
        );
    }

    private RecoveryAction.ActionType determineRecoveryAction(
            RevenueRisk revenueRisk
    ) {

        return switch (revenueRisk.getReason()) {

            case EXPIRED_CARD ->
                    RecoveryAction.ActionType.SEND_PAYMENT_LINK;

            case INSUFFICIENT_FUNDS ->
                    RecoveryAction.ActionType.WAIT_AND_RETRY;

            case BANK_DECLINED ->
                    RecoveryAction.ActionType.RETRY_PAYMENT;

            case AUTHENTICATION_REQUIRED ->
                    RecoveryAction.ActionType.REQUEST_AUTHENTICATION;

            case FRAUD_SUSPECTED ->
                    RecoveryAction.ActionType.HUMAN_REVIEW;

            case UNKNOWN ->
                    RecoveryAction.ActionType.HUMAN_REVIEW;
        };
    }

    private String determineActionReason(
            RevenueRisk revenueRisk
    ) {

        return switch (revenueRisk.getReason()) {

            case EXPIRED_CARD ->
                    "Customer payment method appears expired. "
                            + "Request payment method update.";

            case INSUFFICIENT_FUNDS ->
                    "Payment failed due to insufficient funds. "
                            + "Wait before retrying.";

            case BANK_DECLINED ->
                    "Bank declined the payment. "
                            + "A controlled retry may recover the payment.";

            case AUTHENTICATION_REQUIRED ->
                    "Payment requires customer authentication.";

            case FRAUD_SUSPECTED ->
                    "Fraud is suspected. Automated payment recovery is unsafe.";

            case UNKNOWN ->
                    "Failure reason is unknown and requires human review.";
        };
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