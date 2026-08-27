package org.example.app.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class BatchWorkflowResult {

    private int processedCases;
    private int recoveredCases;
    private int failedCases;
    private int humanReviewCases;
    private int blockedCases;
    private int stoppedCases;
    private int lostCases;

    private BigDecimal totalRevenueAtRisk = BigDecimal.ZERO;
    private BigDecimal totalRevenueRecovered = BigDecimal.ZERO;

    private double recoveryRate;

    private List<WorkflowResult> results = new ArrayList<>();

    public int getProcessedCases() {
        return processedCases;
    }

    public void setProcessedCases(int processedCases) {
        this.processedCases = processedCases;
    }

    public int getRecoveredCases() {
        return recoveredCases;
    }

    public void setRecoveredCases(int recoveredCases) {
        this.recoveredCases = recoveredCases;
    }

    public int getFailedCases() {
        return failedCases;
    }

    public void setFailedCases(int failedCases) {
        this.failedCases = failedCases;
    }

    public int getHumanReviewCases() {
        return humanReviewCases;
    }

    public void setHumanReviewCases(int humanReviewCases) {
        this.humanReviewCases = humanReviewCases;
    }

    public int getBlockedCases() {
        return blockedCases;
    }

    public void setBlockedCases(int blockedCases) {
        this.blockedCases = blockedCases;
    }

    public int getStoppedCases() {
        return stoppedCases;
    }

    public void setStoppedCases(int stoppedCases) {
        this.stoppedCases = stoppedCases;
    }

    public int getLostCases() {
        return lostCases;
    }

    public void setLostCases(int lostCases) {
        this.lostCases = lostCases;
    }

    public BigDecimal getTotalRevenueAtRisk() {
        return totalRevenueAtRisk;
    }

    public void setTotalRevenueAtRisk(BigDecimal totalRevenueAtRisk) {
        this.totalRevenueAtRisk = totalRevenueAtRisk;
    }

    public BigDecimal getTotalRevenueRecovered() {
        return totalRevenueRecovered;
    }

    public void setTotalRevenueRecovered(BigDecimal totalRevenueRecovered) {
        this.totalRevenueRecovered = totalRevenueRecovered;
    }

    public double getRecoveryRate() {
        return recoveryRate;
    }

    public void setRecoveryRate(double recoveryRate) {
        this.recoveryRate = recoveryRate;
    }

    public List<WorkflowResult> getResults() {
        return results;
    }

    public void setResults(List<WorkflowResult> results) {
        this.results = results;
    }
}