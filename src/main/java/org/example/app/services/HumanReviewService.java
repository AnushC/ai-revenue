package org.example.app.services;

import org.example.app.entity.AuditLog;
import org.example.app.entity.RecoveryAction;
import org.example.app.entity.RecoveryOutcome;
import org.example.app.entity.RevenueRisk;
import org.example.app.repository.AuditLogRepository;
import org.example.app.repository.RecoveryActionRepository;
import org.example.app.repository.RevenueRiskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class HumanReviewService {

    private final RevenueRiskRepository revenueRiskRepository;
    private final RecoveryActionRepository recoveryActionRepository;
    private final RecoveryExecutionService recoveryExecutionService;
    private final AuditLogRepository auditLogRepository;

    private final Random random = new Random();

    public HumanReviewService(
            RevenueRiskRepository revenueRiskRepository,
            RecoveryActionRepository recoveryActionRepository,
            RecoveryExecutionService recoveryExecutionService,
            AuditLogRepository auditLogRepository
    ) {
        this.revenueRiskRepository = revenueRiskRepository;
        this.recoveryActionRepository = recoveryActionRepository;
        this.recoveryExecutionService = recoveryExecutionService;
        this.auditLogRepository = auditLogRepository;
    }

    /*
     * ============================================================
     * GET PENDING HUMAN REVIEWS
     * ============================================================
     */

    public List<RevenueRisk> getPendingReviews() {
        return revenueRiskRepository.findByReviewStatus(
                RevenueRisk.ReviewStatus.PENDING
        );
    }

    /*
     * ============================================================
     * SEND TO HUMAN REVIEW
     * ============================================================
     */

    @Transactional
    public RevenueRisk sendToReview(Long riskId) {

        RevenueRisk risk = findRisk(riskId);

        /*
         * Finished cases cannot be reopened.
         */
        if (risk.getStatus() == RevenueRisk.RiskStatus.RECOVERED) {
            throw new IllegalStateException(
                    "Recovered revenue cannot be sent for human review."
            );
        }

        if (risk.getStatus() == RevenueRisk.RiskStatus.LOST) {
            throw new IllegalStateException(
                    "Lost revenue cannot be sent for human review."
            );
        }

        if (risk.getStatus() == RevenueRisk.RiskStatus.STOPPED) {
            throw new IllegalStateException(
                    "Stopped recovery cannot be sent for human review."
            );
        }

        /*
         * Prevent duplicate escalation.
         */
        if (risk.getReviewStatus() == RevenueRisk.ReviewStatus.PENDING) {
            return risk;
        }

        risk.setReviewStatus(
                RevenueRisk.ReviewStatus.PENDING
        );

        RevenueRisk savedRisk =
                revenueRiskRepository.save(risk);

        createAuditLog(
                riskId,
                "HUMAN_REVIEW_PENDING",
                "Revenue risk sent to human review queue."
        );

        return savedRisk;
    }

    /*
     * ============================================================
     * APPROVE HUMAN REVIEW
     * ============================================================
     *
     * Flow:
     *
     * Reviewer approves
     *      ↓
     * Find pending RecoveryAction
     *      ↓
     * Read proposedActionType
     *      ↓
     * If proposed action is HUMAN_REVIEW,
     * choose a safe action based on failure reason
     *      ↓
     * Execute recovery
     *      ↓
     * RECOVERED / FAILED / STOPPED
     */

    @Transactional
    public RevenueRisk approve(Long riskId) {

        RevenueRisk risk = findRisk(riskId);

        validatePendingReview(risk);

        /*
         * Find latest pending recovery action.
         */
        RecoveryAction recoveryAction =
                recoveryActionRepository
                        .findFirstByRevenueRiskIdAndStatusOrderByCreatedAtDesc(
                                riskId,
                                RecoveryAction.ActionStatus.PENDING
                        )
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "No pending recovery action found for risk: "
                                                + riskId
                                )
                        );

        /*
         * Make sure this is actually waiting for human review.
         */
        if (recoveryAction.getActionType()
                != RecoveryAction.ActionType.HUMAN_REVIEW) {

            throw new IllegalStateException(
                    "Pending recovery action is not awaiting human review."
            );
        }

        RecoveryAction.ActionType proposedAction =
                recoveryAction.getProposedActionType();

        if (proposedAction == null) {
            throw new IllegalStateException(
                    "Human review action does not contain a proposed recovery action."
            );
        }

        /*
         * FIX:
         *
         * Some cases such as FRAUD_SUSPECTED or UNKNOWN may
         * originally have HUMAN_REVIEW as the proposed action.
         *
         * Once a reviewer approves the case, convert that
         * HUMAN_REVIEW decision into a safe deterministic action.
         */
        if (proposedAction
                == RecoveryAction.ActionType.HUMAN_REVIEW) {

            proposedAction =
                    determineReviewerApprovedAction(risk);

            recoveryAction.setProposedActionType(
                    proposedAction
            );

            recoveryActionRepository.save(
                    recoveryAction
            );

            createAuditLog(
                    riskId,
                    "HUMAN_REVIEW_ACTION_SELECTED",
                    "Reviewer approval resolved HUMAN_REVIEW into action: "
                            + proposedAction
            );
        }

        /*
         * STOP is handled separately.
         *
         * This is especially useful for suspected fraud.
         */
        if (proposedAction
                == RecoveryAction.ActionType.STOP) {

            risk.setReviewStatus(
                    RevenueRisk.ReviewStatus.APPROVED
            );

            risk.setStatus(
                    RevenueRisk.RiskStatus.STOPPED
            );

            recoveryAction.setActionType(
                    RecoveryAction.ActionType.STOP
            );

            recoveryAction.setApproved(
                    true
            );

            recoveryAction.setStatus(
                    RecoveryAction.ActionStatus.EXECUTED
            );

            recoveryAction.setExecutedAt(
                    LocalDateTime.now()
            );

            recoveryActionRepository.save(
                    recoveryAction
            );

            RevenueRisk savedRisk =
                    revenueRiskRepository.save(risk);

            createAuditLog(
                    riskId,
                    "HUMAN_REVIEW_APPROVED",
                    "Human reviewer approved the case. "
                            + "Recovery was stopped because the selected action was STOP."
            );

            return savedRisk;
        }

        /*
         * Human reviewer has authorized the
         * executable recovery action.
         */
        risk.setReviewStatus(
                RevenueRisk.ReviewStatus.APPROVED
        );

        risk.setStatus(
                RevenueRisk.RiskStatus.IN_RECOVERY
        );

        /*
         * Convert the pending HUMAN_REVIEW action
         * into the approved executable action.
         */
        recoveryAction.setActionType(
                proposedAction
        );

        recoveryAction.setApproved(
                true
        );

        recoveryAction.setStatus(
                RecoveryAction.ActionStatus.PENDING
        );

        revenueRiskRepository.save(
                risk
        );

        recoveryActionRepository.save(
                recoveryAction
        );

        createAuditLog(
                riskId,
                "HUMAN_REVIEW_APPROVED",
                "Human reviewer approved proposed action: "
                        + proposedAction
        );

        /*
         * Simulate whether recovery succeeds.
         */
        boolean successful =
                simulateRecoverySuccess(
                        proposedAction
                );

        RecoveryOutcome outcome =
                recoveryExecutionService.executeRecovery(
                        recoveryAction.getId(),
                        successful
                );

        createAuditLog(
                riskId,
                "HUMAN_REVIEW_EXECUTION_COMPLETED",
                "Human-approved action "
                        + proposedAction
                        + " completed with outcome: "
                        + outcome.getStatus()
        );

        /*
         * executeRecovery() updates RevenueRisk.
         * Reload it so the latest state is returned.
         */
        return findRisk(riskId);
    }

    /*
     * ============================================================
     * REJECT HUMAN REVIEW
     * ============================================================
     */

    @Transactional
    public RevenueRisk reject(Long riskId) {

        RevenueRisk risk = findRisk(riskId);

        validatePendingReview(risk);

        /*
         * Find pending action if one exists.
         */
        recoveryActionRepository
                .findFirstByRevenueRiskIdAndStatusOrderByCreatedAtDesc(
                        riskId,
                        RecoveryAction.ActionStatus.PENDING
                )
                .ifPresent(action -> {

                    action.setStatus(
                            RecoveryAction.ActionStatus.CANCELLED
                    );

                    recoveryActionRepository.save(
                            action
                    );
                });

        risk.setReviewStatus(
                RevenueRisk.ReviewStatus.REJECTED
        );

        /*
         * Human rejection stops automated recovery.
         */
        risk.setStatus(
                RevenueRisk.RiskStatus.STOPPED
        );

        RevenueRisk savedRisk =
                revenueRiskRepository.save(risk);

        createAuditLog(
                riskId,
                "HUMAN_REVIEW_REJECTED",
                "Human reviewer rejected the recovery case. "
                        + "Pending recovery action was cancelled "
                        + "and automated recovery was stopped."
        );

        return savedRisk;
    }

    /*
     * ============================================================
     * DETERMINE ACTION AFTER HUMAN APPROVAL
     * ============================================================
     *
     * Used when the original proposed action was HUMAN_REVIEW.
     *
     * The reviewer has now manually authorized the case,
     * so the system selects a conservative deterministic action.
     */

    private RecoveryAction.ActionType determineReviewerApprovedAction(
            RevenueRisk risk
    ) {

        if (risk.getReason() == null) {
            return RecoveryAction.ActionType.STOP;
        }

        return switch (risk.getReason()) {

            case EXPIRED_CARD ->
                    RecoveryAction.ActionType.SEND_PAYMENT_LINK;

            case INSUFFICIENT_FUNDS ->
                    RecoveryAction.ActionType.WAIT_AND_RETRY;

            case BANK_DECLINED ->
                    RecoveryAction.ActionType.RETRY_PAYMENT;

            case AUTHENTICATION_REQUIRED ->
                    RecoveryAction.ActionType.REQUEST_AUTHENTICATION;

            /*
             * Suspected fraud should not automatically retry payment.
             * Reviewer approval here confirms the case was reviewed,
             * but the safest execution decision is still STOP.
             */
            case FRAUD_SUSPECTED ->
                    RecoveryAction.ActionType.STOP;

            /*
             * Unknown failures are allowed one conservative retry
             * after explicit human approval.
             */
            case UNKNOWN ->
                    RecoveryAction.ActionType.RETRY_PAYMENT;
        };
    }

    /*
     * ============================================================
     * VALIDATE REVIEW
     * ============================================================
     */

    private void validatePendingReview(
            RevenueRisk risk
    ) {

        if (risk.getReviewStatus()
                != RevenueRisk.ReviewStatus.PENDING) {

            throw new IllegalStateException(
                    "Risk is not awaiting human review."
            );
        }

        if (risk.getStatus()
                == RevenueRisk.RiskStatus.RECOVERED) {

            throw new IllegalStateException(
                    "Revenue has already been recovered."
            );
        }

        if (risk.getStatus()
                == RevenueRisk.RiskStatus.LOST) {

            throw new IllegalStateException(
                    "Revenue has already been marked as lost."
            );
        }

        if (risk.getStatus()
                == RevenueRisk.RiskStatus.STOPPED) {

            throw new IllegalStateException(
                    "Recovery workflow has already been stopped."
            );
        }
    }

    /*
     * ============================================================
     * SIMULATED RECOVERY
     * ============================================================
     */

    private boolean simulateRecoverySuccess(
            RecoveryAction.ActionType actionType
    ) {

        double probability =
                switch (actionType) {

                    case SEND_PAYMENT_LINK ->
                            0.75;

                    case RETRY_PAYMENT ->
                            0.55;

                    case WAIT_AND_RETRY ->
                            0.60;

                    case REQUEST_AUTHENTICATION ->
                            0.70;

                    case HUMAN_REVIEW ->
                            0.0;

                    case STOP ->
                            0.0;
                };

        return random.nextDouble()
                < probability;
    }

    /*
     * ============================================================
     * FIND RISK
     * ============================================================
     */

    private RevenueRisk findRisk(
            Long riskId
    ) {

        return revenueRiskRepository
                .findById(riskId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Revenue risk not found: "
                                        + riskId
                        )
                );
    }

    /*
     * ============================================================
     * AUDIT LOG
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
}