package org.example.app.services;

import org.example.app.dto.BatchWorkflowResult;
import org.example.app.dto.WorkflowResult;
import org.example.app.entity.RevenueRisk;
import org.example.app.repository.RevenueRiskRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class BatchRecoveryService {

    private final RevenueRiskRepository revenueRiskRepository;
    private final RecoveryWorkflowService recoveryWorkflowService;

    public BatchRecoveryService(
            RevenueRiskRepository revenueRiskRepository,
            RecoveryWorkflowService recoveryWorkflowService
    ) {
        this.revenueRiskRepository = revenueRiskRepository;
        this.recoveryWorkflowService = recoveryWorkflowService;
    }

    public BatchWorkflowResult runBatch() {

        List<RevenueRisk> openRisks =
                revenueRiskRepository.findByStatus(
                        RevenueRisk.RiskStatus.OPEN
                );

        BatchWorkflowResult batch =
                new BatchWorkflowResult();

        List<WorkflowResult> results =
                new ArrayList<>();

        BigDecimal totalAtRisk =
                BigDecimal.ZERO;

        BigDecimal totalRecovered =
                BigDecimal.ZERO;

        int recovered = 0;
        int failed = 0;
        int humanReview = 0;
        int blocked = 0;
        int stopped = 0;
        int lost = 0;

        for (RevenueRisk risk : openRisks) {

            /*
             * Record the money entering this batch.
             */
            if (risk.getAmountAtRisk() != null) {
                totalAtRisk =
                        totalAtRisk.add(
                                risk.getAmountAtRisk()
                        );
            }

            try {

                WorkflowResult result =
                        recoveryWorkflowService
                                .runWorkflow(
                                        risk.getId()
                                );

                results.add(result);

                String status =
                        result.getWorkflowStatus();

                if (status == null) {
                    failed++;
                    continue;
                }

                switch (status) {

                    case "RECOVERED" -> {

                        recovered++;

                        if (risk.getAmountAtRisk() != null) {
                            totalRecovered =
                                    totalRecovered.add(
                                            risk.getAmountAtRisk()
                                    );
                        }
                    }

                    case "FAILED" ->
                            failed++;

                    case "HUMAN_REVIEW" ->
                            humanReview++;

                    case "BLOCKED" ->
                            blocked++;

                    case "STOPPED" ->
                            stopped++;

                    case "LOST" ->
                            lost++;

                    default ->
                            failed++;
                }

            } catch (Exception exception) {

                failed++;

                WorkflowResult errorResult =
                        new WorkflowResult();

                errorResult.setRevenueRiskId(
                        risk.getId()
                );

                errorResult.setWorkflowStatus(
                        "ERROR"
                );

                errorResult.setMessage(
                        "Workflow failed: "
                                + exception
                                .getClass()
                                .getSimpleName()
                );

                results.add(
                        errorResult
                );
            }
        }

        double recoveryRate = 0.0;

        if (totalAtRisk.compareTo(
                BigDecimal.ZERO
        ) > 0) {

            recoveryRate =
                    totalRecovered
                            .divide(
                                    totalAtRisk,
                                    4,
                                    RoundingMode.HALF_UP
                            )
                            .multiply(
                                    BigDecimal.valueOf(100)
                            )
                            .doubleValue();
        }

        batch.setProcessedCases(
                openRisks.size()
        );

        batch.setRecoveredCases(
                recovered
        );

        batch.setFailedCases(
                failed
        );

        batch.setHumanReviewCases(
                humanReview
        );

        batch.setBlockedCases(
                blocked
        );

        batch.setStoppedCases(
                stopped
        );

        batch.setLostCases(
                lost
        );

        batch.setTotalRevenueAtRisk(
                totalAtRisk
        );

        batch.setTotalRevenueRecovered(
                totalRecovered
        );

        batch.setRecoveryRate(
                recoveryRate
        );

        batch.setResults(
                results
        );

        return batch;
    }
}