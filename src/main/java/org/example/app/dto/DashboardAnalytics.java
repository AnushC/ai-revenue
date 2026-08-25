package org.example.app.dto;

import java.math.BigDecimal;

public class DashboardAnalytics {

    private BigDecimal totalRevenueAtRisk;
    private BigDecimal totalRevenueRecovered;
    private double recoveryRate;

    private long totalRiskCases;
    private long openCases;
    private long inRecoveryCases;
    private long recoveredCases;

    private long totalRecoveryAttempts;
    private long successfulRecoveries;
    private long failedRecoveries;

    public DashboardAnalytics() {
    }

    public BigDecimal getTotalRevenueAtRisk() {
        return totalRevenueAtRisk;
    }

    public void setTotalRevenueAtRisk(
            BigDecimal totalRevenueAtRisk
    ) {
        this.totalRevenueAtRisk = totalRevenueAtRisk;
    }

    public BigDecimal getTotalRevenueRecovered() {
        return totalRevenueRecovered;
    }

    public void setTotalRevenueRecovered(
            BigDecimal totalRevenueRecovered
    ) {
        this.totalRevenueRecovered = totalRevenueRecovered;
    }

    public double getRecoveryRate() {
        return recoveryRate;
    }

    public void setRecoveryRate(double recoveryRate) {
        this.recoveryRate = recoveryRate;
    }

    public long getTotalRiskCases() {
        return totalRiskCases;
    }

    public void setTotalRiskCases(long totalRiskCases) {
        this.totalRiskCases = totalRiskCases;
    }

    public long getOpenCases() {
        return openCases;
    }

    public void setOpenCases(long openCases) {
        this.openCases = openCases;
    }

    public long getInRecoveryCases() {
        return inRecoveryCases;
    }

    public void setInRecoveryCases(long inRecoveryCases) {
        this.inRecoveryCases = inRecoveryCases;
    }

    public long getRecoveredCases() {
        return recoveredCases;
    }

    public void setRecoveredCases(long recoveredCases) {
        this.recoveredCases = recoveredCases;
    }

    public long getTotalRecoveryAttempts() {
        return totalRecoveryAttempts;
    }

    public void setTotalRecoveryAttempts(
            long totalRecoveryAttempts
    ) {
        this.totalRecoveryAttempts = totalRecoveryAttempts;
    }

    public long getSuccessfulRecoveries() {
        return successfulRecoveries;
    }

    public void setSuccessfulRecoveries(
            long successfulRecoveries
    ) {
        this.successfulRecoveries = successfulRecoveries;
    }

    public long getFailedRecoveries() {
        return failedRecoveries;
    }

    public void setFailedRecoveries(long failedRecoveries) {
        this.failedRecoveries = failedRecoveries;
    }
}