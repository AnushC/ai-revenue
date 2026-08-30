package org.example.app.services;

import org.example.app.dto.PolicyDecision;
import org.example.app.entity.RecoveryAction;
import org.example.app.entity.RevenueRisk;
import org.example.app.repository.RecoveryActionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class PolicyEngineService {

    private final RecoveryActionRepository recoveryActionRepository;

    private static final long MAX_RECOVERY_ACTIONS = 3;
    private static final double MIN_AI_CONFIDENCE = 0.70;

    private static final BigDecimal HIGH_VALUE_THRESHOLD =
            new BigDecimal("25000");

    public PolicyEngineService(
            RecoveryActionRepository recoveryActionRepository
    ) {
        this.recoveryActionRepository =
                recoveryActionRepository;
    }

    public PolicyDecision evaluate(
            RevenueRisk revenueRisk,
            RecoveryAction.ActionType actionType,
            double confidence,
            boolean aiDecision
    ) {

        long previousActions =
                recoveryActionRepository
                        .countByRevenueRiskId(
                                revenueRisk.getId()
                        );

        /*
         * RULE 1:
         * Never recover revenue that is already recovered.
         */
        if (revenueRisk.getStatus()
                == RevenueRisk.RiskStatus.RECOVERED) {

            return blocked(
                    "Revenue has already been recovered."
            );
        }

        /*
         * RULE 2:
         * Lost revenue cannot be processed again.
         */
        if (revenueRisk.getStatus()
                == RevenueRisk.RiskStatus.LOST) {

            return blocked(
                    "Revenue has already been marked as lost."
            );
        }

        /*
         * RULE 3:
         * Stopped workflows cannot restart automatically.
         */
        if (revenueRisk.getStatus()
                == RevenueRisk.RiskStatus.STOPPED) {

            return blocked(
                    "Recovery workflow has already been stopped."
            );
        }

        /*
         * RULE 4:
         * Maximum number of recovery actions.
         */
        if (previousActions >= MAX_RECOVERY_ACTIONS) {

            return blocked(
                    "Maximum recovery attempts reached."
            );
        }

        /*
         * RULE 5:
         * Fraud must always go to a human.
         */
        if (revenueRisk.getReason()
                == RevenueRisk.RiskReason.FRAUD_SUSPECTED) {

            return humanReview(
                    "Fraud suspected. Manual review required."
            );
        }

        /*
         * RULE 6:
         * Unknown failures need investigation.
         */
        if (revenueRisk.getReason()
                == RevenueRisk.RiskReason.UNKNOWN) {

            return humanReview(
                    "Unknown failure reason requires manual review."
            );
        }

        /*
         * RULE 7:
         * High-value recovery requires authorization.
         */
        if (revenueRisk.getAmountAtRisk() != null
                && revenueRisk.getAmountAtRisk()
                .compareTo(HIGH_VALUE_THRESHOLD) >= 0) {

            return humanReview(
                    "High-value recovery requires human authorization."
            );
        }

        /*
         * RULE 8:
         * Low-confidence AI decisions cannot execute automatically.
         *
         * Only applies when Gemini actually produced the decision.
         * Deterministic fallback rules are not affected.
         */
        if (aiDecision
                && confidence < MIN_AI_CONFIDENCE) {

            return humanReview(
                    "AI confidence below 70%."
            );
        }

        /*
         * RULE 9:
         * Respect Gemini/fallback recommendation for human review.
         */
        if (actionType
                == RecoveryAction.ActionType.HUMAN_REVIEW) {

            return humanReview(
                    "Recovery decision requires human review."
            );
        }

        /*
         * RULE 10:
         * STOP is safe because it does not perform
         * a recovery/payment action.
         */
        if (actionType
                == RecoveryAction.ActionType.STOP) {

            return approved(
                    "Stopping recovery is permitted."
            );
        }

        /*
         * All policy checks passed.
         */
        return approved(
                "Recovery action satisfies policy rules."
        );
    }

    public boolean hasReachedMaximumAttempts(
            RevenueRisk revenueRisk
    ) {

        long previousActions =
                recoveryActionRepository
                        .countByRevenueRiskId(
                                revenueRisk.getId()
                        );

        return previousActions
                >= MAX_RECOVERY_ACTIONS;
    }

    private PolicyDecision approved(
            String reason
    ) {

        return new PolicyDecision(
                PolicyDecision.Decision.APPROVED,
                reason
        );
    }

    private PolicyDecision blocked(
            String reason
    ) {

        return new PolicyDecision(
                PolicyDecision.Decision.BLOCKED,
                reason
        );
    }

    private PolicyDecision humanReview(
            String reason
    ) {

        return new PolicyDecision(
                PolicyDecision.Decision.HUMAN_REVIEW,
                reason
        );
    }
}