package org.example.app.services;

import org.example.app.dto.WorkflowResult;
import org.example.app.entity.RecoveryAction;
import org.example.app.entity.RecoveryOutcome;
import org.example.app.entity.RevenueRisk;
import org.example.app.repository.RevenueRiskRepository;
import org.springframework.stereotype.Service;
import org.example.app.services.PolicyService;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;

@Service
public class RecoveryWorkflowService {

    private final RecoveryService recoveryService;
    private final RecoveryExecutionService recoveryExecutionService;
    private final RevenueRiskRepository revenueRiskRepository;
    private final PolicyService policyService;

    private final Random random = new Random();

    public RecoveryWorkflowService(
            RecoveryService recoveryService,
            RecoveryExecutionService recoveryExecutionService,
            RevenueRiskRepository revenueRiskRepository,
            PolicyService policyService
    ) {
        this.recoveryService =
                recoveryService;

        this.recoveryExecutionService =
                recoveryExecutionService;

        this.revenueRiskRepository =
                revenueRiskRepository;

        this.policyService =
                policyService;
    }

    @Transactional
    public WorkflowResult runWorkflow(Long revenueRiskId) {

        RevenueRisk revenueRisk =
                revenueRiskRepository.findById(revenueRiskId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Revenue risk not found: "
                                                + revenueRiskId
                                )
                        );

        WorkflowResult result =
                new WorkflowResult();

        result.setRevenueRiskId(
                revenueRiskId
        );

        /*
         * Stop immediately if workflow is already finished.
         */
        if (revenueRisk.getStatus()
                == RevenueRisk.RiskStatus.RECOVERED) {

            result.setWorkflowStatus("STOPPED");
            result.setMessage(
                    "Revenue has already been recovered."
            );

            return result;
        }

        if (revenueRisk.getStatus()
                == RevenueRisk.RiskStatus.STOPPED) {

            result.setWorkflowStatus("STOPPED");
            result.setMessage(
                    "Recovery workflow has already been stopped."
            );

            return result;
        }

        if (revenueRisk.getStatus()
                == RevenueRisk.RiskStatus.LOST) {

            result.setWorkflowStatus("LOST");
            result.setMessage(
                    "Revenue risk is already marked as lost."
            );

            return result;
        }

        /*
         * Step 1:
         * Ask Gemini / fallback engine for recovery action.
         */
        RecoveryAction recoveryAction =
                recoveryService.startRecovery(
                        revenueRiskId
                );

        result.setRecoveryActionId(
                recoveryAction.getId()
        );

        result.setActionType(
                recoveryAction.getActionType().name()
        );

        result.setDecisionSource(
                recoveryAction.getDecisionSource()
        );

        result.setApproved(
                Boolean.TRUE.equals(
                        recoveryAction.getApproved()
                )
        );

        /*
         * Step 2:
         * Policy engine may have blocked the action.
         */
        if (!Boolean.TRUE.equals(
                recoveryAction.getApproved()
        )) {

            if (policyService
                    .hasReachedMaximumAttempts(
                            revenueRisk
                    )) {

                revenueRisk.setStatus(
                        RevenueRisk.RiskStatus.LOST
                );

                revenueRiskRepository.save(
                        revenueRisk
                );

                result.setWorkflowStatus(
                        "LOST"
                );

                result.setMessage(
                        "Maximum recovery attempts reached. "
                                + "Revenue marked as lost."
                );

            } else {

                result.setWorkflowStatus(
                        "BLOCKED"
                );

                result.setMessage(
                        "Recovery action blocked by policy."
                );
            }

            return result;
        }

        /*
         * Human review is an escalation, not automatic execution.
         */
        if (recoveryAction.getActionType()
                == RecoveryAction.ActionType.HUMAN_REVIEW) {

            result.setWorkflowStatus(
                    "HUMAN_REVIEW"
            );

            result.setMessage(
                    "Case escalated for human review."
            );

            return result;
        }

        /*
         * STOP means no further recovery activity.
         */
        if (recoveryAction.getActionType()
                == RecoveryAction.ActionType.STOP) {

            revenueRisk.setStatus(
                    RevenueRisk.RiskStatus.STOPPED
            );

            revenueRiskRepository.save(
                    revenueRisk
            );

            result.setWorkflowStatus(
                    "STOPPED"
            );

            result.setMessage(
                    "Recovery workflow stopped."
            );

            return result;
        }

        /*
         * Step 3:
         * Simulate the external recovery result.
         *
         * Later this becomes:
         * Stripe / Razorpay / email link / payment retry.
         */
        boolean successful =
                simulateRecoverySuccess(
                        recoveryAction
                );

        RecoveryOutcome outcome =
                recoveryExecutionService
                        .executeRecovery(
                                recoveryAction.getId(),
                                successful
                        );

        if (outcome.getStatus()
                == RecoveryOutcome.OutcomeStatus.RECOVERED) {

            result.setWorkflowStatus(
                    "RECOVERED"
            );

            result.setMessage(
                    "Revenue recovered successfully. Amount: "
                            + outcome.getAmountRecovered()
            );

        } else {

            result.setWorkflowStatus(
                    "FAILED"
            );

            result.setMessage(
                    "Recovery attempt failed. "
                            + "The risk remains open for another permitted attempt."
            );
        }

        return result;
    }

    private boolean simulateRecoverySuccess(
            RecoveryAction recoveryAction
    ) {

        double probability =
                switch (recoveryAction.getActionType()) {

                    case SEND_PAYMENT_LINK -> 0.75;

                    case RETRY_PAYMENT -> 0.55;

                    case WAIT_AND_RETRY -> 0.60;

                    case REQUEST_AUTHENTICATION -> 0.70;

                    case HUMAN_REVIEW -> 0.0;

                    case STOP -> 0.0;
                };

        return random.nextDouble()
                < probability;
    }
}