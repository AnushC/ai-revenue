package org.example.app.services;

import org.example.app.agent.RevenueRecoveryAgent;
import org.example.app.dto.AiRecoveryDecision;
import org.example.app.dto.PolicyDecision;
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
    private final PolicyEngineService policyEngineService;
    private final RevenueRecoveryAgent revenueRecoveryAgent;

    public RecoveryService(
            RevenueRiskRepository revenueRiskRepository,
            RecoveryActionRepository recoveryActionRepository,
            AuditLogRepository auditLogRepository,
            PolicyEngineService policyEngineService,
            RevenueRecoveryAgent revenueRecoveryAgent
    ) {

        this.revenueRiskRepository =
                revenueRiskRepository;

        this.recoveryActionRepository =
                recoveryActionRepository;

        this.auditLogRepository =
                auditLogRepository;

        this.policyEngineService =
                policyEngineService;

        this.revenueRecoveryAgent =
                revenueRecoveryAgent;
    }

    @Transactional
    public RecoveryAction startRecovery(
            Long revenueRiskId
    ) {

        /*
         * STEP 1:
         * Load revenue risk.
         */
        RevenueRisk revenueRisk =
                revenueRiskRepository
                        .findById(revenueRiskId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Revenue risk not found: "
                                                + revenueRiskId
                                )
                        );

        /*
         * STEP 2:
         * Get Gemini or fallback decision.
         */
        DecisionResult decisionResult =
                getRecoveryDecision(
                        revenueRisk
                );

        /*
         * This is what Gemini/fallback originally
         * recommended.
         */
        RecoveryAction.ActionType proposedActionType =
                decisionResult.actionType();

        /*
         * Initially the final action is the same
         * as the proposed action.
         */
        RecoveryAction.ActionType finalActionType =
                proposedActionType;

        /*
         * STEP 3:
         * Run deterministic policy checks.
         */
        PolicyDecision policyDecision =
                policyEngineService.evaluate(
                        revenueRisk,
                        proposedActionType,
                        decisionResult.confidence(),
                        "AI".equals(
                                decisionResult.source()
                        )
                );

        /*
         * STEP 4:
         * Policy may override the proposed action.
         */
        if (policyDecision.getDecision()
                == PolicyDecision.Decision.HUMAN_REVIEW) {

            finalActionType =
                    RecoveryAction.ActionType.HUMAN_REVIEW;
        }

        /*
         * BLOCKED means no action is authorized.
         *
         * HUMAN_REVIEW is allowed as an escalation,
         * but no payment recovery is executed.
         */
        boolean approved =
                policyDecision.getDecision()
                        != PolicyDecision.Decision.BLOCKED;

        /*
         * STEP 5:
         * Build RecoveryAction.
         */
        RecoveryAction recoveryAction =
                new RecoveryAction();

        recoveryAction.setRevenueRisk(
                revenueRisk
        );

        /*
         * Final policy-controlled action.
         */
        recoveryAction.setActionType(
                finalActionType
        );

        /*
         * IMPORTANT:
         * Preserve Gemini/fallback's original action.
         */
        recoveryAction.setProposedActionType(
                proposedActionType
        );

        recoveryAction.setReason(
                policyDecision.getReason()
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

        recoveryAction.setApproved(
                approved
        );

        /*
         * STEP 6:
         * Handle approved or human-review action.
         */
        if (approved) {

            recoveryAction.setStatus(
                    RecoveryAction.ActionStatus.PENDING
            );

            /*
             * HUMAN_REVIEW means recovery execution
             * has NOT started yet.
             */
            if (finalActionType
                    != RecoveryAction.ActionType.HUMAN_REVIEW) {

                revenueRisk.setStatus(
                        RevenueRisk.RiskStatus.IN_RECOVERY
                );
            }

            String eventType =
                    finalActionType
                            == RecoveryAction.ActionType.HUMAN_REVIEW
                            ? "HUMAN_REVIEW_REQUIRED"
                            : "RECOVERY_APPROVED";

            createAuditLog(
                    revenueRisk.getId(),
                    eventType,
                    "Source: "
                            + decisionResult.source()
                            + ", Proposed Action: "
                            + proposedActionType
                            + ", Final Action: "
                            + finalActionType
                            + ", Confidence: "
                            + decisionResult.confidence()
                            + ", Policy: "
                            + policyDecision.getDecision()
                            + ", Policy Reason: "
                            + policyDecision.getReason()
                            + ", AI Reason: "
                            + decisionResult.reason()
            );

        } else {

            /*
             * Policy completely blocked recovery.
             */
            recoveryAction.setStatus(
                    RecoveryAction.ActionStatus.BLOCKED
            );

            createAuditLog(
                    revenueRisk.getId(),
                    "RECOVERY_BLOCKED",
                    "Source: "
                            + decisionResult.source()
                            + ", Proposed Action: "
                            + proposedActionType
                            + ", Confidence: "
                            + decisionResult.confidence()
                            + ", Policy: "
                            + policyDecision.getDecision()
                            + ", Policy Reason: "
                            + policyDecision.getReason()
            );
        }

        revenueRiskRepository.save(
                revenueRisk
        );

        return recoveryActionRepository.save(
                recoveryAction
        );
    }

    /*
     * ============================================================
     * GEMINI / FALLBACK
     * ============================================================
     */

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
                            + exception
                            .getClass()
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
                action
                        .trim()
                        .toUpperCase()
        );
    }

    /*
     * ============================================================
     * FALLBACK RULES
     * ============================================================
     */

    private RecoveryAction.ActionType determineFallbackAction(
            RevenueRisk revenueRisk
    ) {

        return switch (revenueRisk.getReason()) {

            case EXPIRED_CARD ->
                    RecoveryAction.ActionType
                            .SEND_PAYMENT_LINK;

            case INSUFFICIENT_FUNDS ->
                    RecoveryAction.ActionType
                            .WAIT_AND_RETRY;

            case BANK_DECLINED ->
                    RecoveryAction.ActionType
                            .RETRY_PAYMENT;

            case AUTHENTICATION_REQUIRED ->
                    RecoveryAction.ActionType
                            .REQUEST_AUTHENTICATION;

            case FRAUD_SUSPECTED ->
                    RecoveryAction.ActionType
                            .HUMAN_REVIEW;

            case UNKNOWN ->
                    RecoveryAction.ActionType
                            .HUMAN_REVIEW;
        };
    }

    private String determineFallbackReason(
            RevenueRisk revenueRisk
    ) {

        return switch (revenueRisk.getReason()) {

            case EXPIRED_CARD ->
                    "Expired payment method. "
                            + "Request payment method update.";

            case INSUFFICIENT_FUNDS ->
                    "Insufficient funds. "
                            + "Wait before another retry.";

            case BANK_DECLINED ->
                    "Bank declined payment. "
                            + "Use a controlled retry.";

            case AUTHENTICATION_REQUIRED ->
                    "Customer authentication is required.";

            case FRAUD_SUSPECTED ->
                    "Fraud suspicion requires human review.";

            case UNKNOWN ->
                    "Unknown failure requires human review.";
        };
    }

    /*
     * ============================================================
     * AUDIT
     * ============================================================
     */

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