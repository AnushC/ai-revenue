package org.example.app.services;

import org.example.app.entity.RecoveryAction;
import org.example.app.entity.RevenueRisk;
import org.example.app.repository.RecoveryActionRepository;
import org.springframework.stereotype.Service;

@Service
public class PolicyService {

    private final RecoveryActionRepository recoveryActionRepository;

    private static final long MAX_RECOVERY_ACTIONS = 3;

    public PolicyService(
            RecoveryActionRepository recoveryActionRepository
    ) {
        this.recoveryActionRepository = recoveryActionRepository;
    }

    public boolean isActionAllowed(
            RevenueRisk revenueRisk,
            RecoveryAction.ActionType actionType
    ) {

        long previousActions =
                recoveryActionRepository.countByRevenueRiskId(
                        revenueRisk.getId()
                );

        // Stopping rule:
        // never perform more than 3 actions for one risk
        if (previousActions >= MAX_RECOVERY_ACTIONS) {
            return false;
        }

        // Don't recover something already finished
        if (revenueRisk.getStatus()
                == RevenueRisk.RiskStatus.RECOVERED) {
            return false;
        }

        if (revenueRisk.getStatus()
                == RevenueRisk.RiskStatus.LOST) {
            return false;
        }

        if (revenueRisk.getStatus()
                == RevenueRisk.RiskStatus.STOPPED) {
            return false;
        }

        // Fraud cases should never trigger automated payment actions
        if (revenueRisk.getReason()
                == RevenueRisk.RiskReason.FRAUD_SUSPECTED) {

            return actionType
                    == RecoveryAction.ActionType.HUMAN_REVIEW
                    || actionType
                    == RecoveryAction.ActionType.STOP;
        }

        return true;
    }
}