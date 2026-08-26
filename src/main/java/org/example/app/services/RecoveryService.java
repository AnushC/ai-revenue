package org.example.app.services;

import org.example.app.agent.RevenueRecoveryAgent;
import org.example.app.dto.AiRecoveryDecision;
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
    private final RevenueRecoveryAgent revenueRecoveryAgent;

    public RecoveryService(
            RevenueRiskRepository revenueRiskRepository,
            RecoveryActionRepository recoveryActionRepository,
            AuditLogRepository auditLogRepository,
            PolicyService policyService,
            RevenueRecoveryAgent revenueRecoveryAgent
    ) {
        this.revenueRiskRepository = revenueRiskRepository;
        this.recoveryActionRepository = recoveryActionRepository;
        this.auditLogRepository = auditLogRepository;
        this.policyService = policyService;
        this.revenueRecoveryAgent = revenueRecoveryAgent;
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

        DecisionResult decisionResult =
                getRecoveryDecision(revenueRisk);

        RecoveryAction.ActionType actionType =
                decisionResult.actionType();

        boolean approved =
                policyService.isActionAllowed(
                        revenueRisk,
                        actionType
                );

        RecoveryAction recoveryAction =
                new RecoveryAction();

        recoveryAction.setRevenueRisk(revenueRisk);
        recoveryAction.setActionType(actionType);
        recoveryAction.setReason(
                decisionResult.reason()
        );

        recoveryAction.setDecisionSource(
                decisionResult.source()
        );

        recoveryAction.setAiDiagnosis(
                decisionResult.diagnosis()
        );

        recoveryAction.setConfidence(
                decisionResult.confidence()
        );

        recoveryAction.setAiReasoning(
                decisionResult.reason()
        );

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
                    "Source: "
                            + decisionResult.source()
                            + ", Action: "
                            + actionType
                            + ", Confidence: "
                            + decisionResult.confidence()
                            + ", Reason: "
                            + decisionResult.reason()
            );

        } else {

            recoveryAction.setStatus(
                    RecoveryAction.ActionStatus.BLOCKED
            );

            createAuditLog(
                    revenueRisk.getId(),
                    "RECOVERY_BLOCKED",
                    "Policy engine blocked action "
                            + actionType
                            + " suggested by "
                            + decisionResult.source()
            );
        }

        revenueRiskRepository.save(revenueRisk);

        return recoveryActionRepository.save(
                recoveryAction
        );
    }

    private DecisionResult getRecoveryDecision(
            RevenueRisk revenueRisk
    ) {

        try {

            AiRecoveryDecision aiDecision =
                    revenueRecoveryAgent.analyze(
                            revenueRisk
                    );

            RecoveryAction.ActionType actionType =
                    parseAction(
                            aiDecision.getRecommendedAction()
                    );

            return new DecisionResult(
                    actionType,
                    "AI",
                    aiDecision.getDiagnosis(),
                    aiDecision.getConfidence(),
                    aiDecision.getReason()
            );

        } catch (Exception exception) {

            RecoveryAction.ActionType fallbackAction =
                    determineFallbackAction(
                            revenueRisk
                    );

            String fallbackReason =
                    determineFallbackReason(
                            revenueRisk
                    );

            createAuditLog(
                    revenueRisk.getId(),
                    "AI_FALLBACK",
                    "AI decision failed. "
                            + "Fallback rule engine used. "
                            + "Cause: "
                            + exception.getClass()
                            .getSimpleName()
            );

            return new DecisionResult(
                    fallbackAction,
                    "RULE_FALLBACK",
                    "AI unavailable",
                    1.0,
                    fallbackReason
            );
        }
    }

    private RecoveryAction.ActionType parseAction(
            String action
    ) {

        if (action == null) {
            throw new IllegalArgumentException(
                    "AI returned no recovery action"
            );
        }

        return RecoveryAction.ActionType.valueOf(
                action.trim().toUpperCase()
        );
    }

    private RecoveryAction.ActionType determineFallbackAction(
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

    private String determineFallbackReason(
            RevenueRisk revenueRisk
    ) {

        return switch (revenueRisk.getReason()) {

            case EXPIRED_CARD ->
                    "Expired payment method. Request payment method update.";

            case INSUFFICIENT_FUNDS ->
                    "Insufficient funds. Wait before another retry.";

            case BANK_DECLINED ->
                    "Bank declined payment. Use a controlled retry.";

            case AUTHENTICATION_REQUIRED ->
                    "Customer authentication is required.";

            case FRAUD_SUSPECTED ->
                    "Fraud suspicion requires human review.";

            case UNKNOWN ->
                    "Unknown failure requires human review.";
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

    private record DecisionResult(
            RecoveryAction.ActionType actionType,
            String source,
            String diagnosis,
            Double confidence,
            String reason
    ) {
    }
}