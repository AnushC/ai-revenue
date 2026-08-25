package org.example.app.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "recovery_outcomes")
public class RecoveryOutcome {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "revenue_risk_id", nullable = false)
    private RevenueRisk revenueRisk;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "recovery_action_id", nullable = false)
    private RecoveryAction recoveryAction;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OutcomeStatus status;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amountRecovered;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public enum OutcomeStatus {
        RECOVERED,
        FAILED
    }

    public RecoveryOutcome() {
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();

        if (amountRecovered == null) {
            amountRecovered = BigDecimal.ZERO;
        }
    }

    public Long getId() {
        return id;
    }

    public RevenueRisk getRevenueRisk() {
        return revenueRisk;
    }

    public void setRevenueRisk(RevenueRisk revenueRisk) {
        this.revenueRisk = revenueRisk;
    }

    public RecoveryAction getRecoveryAction() {
        return recoveryAction;
    }

    public void setRecoveryAction(RecoveryAction recoveryAction) {
        this.recoveryAction = recoveryAction;
    }

    public OutcomeStatus getStatus() {
        return status;
    }

    public void setStatus(OutcomeStatus status) {
        this.status = status;
    }

    public BigDecimal getAmountRecovered() {
        return amountRecovered;
    }

    public void setAmountRecovered(BigDecimal amountRecovered) {
        this.amountRecovered = amountRecovered;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}