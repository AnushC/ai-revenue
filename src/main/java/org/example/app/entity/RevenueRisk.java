package org.example.app.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "revenue_risks")
public class RevenueRisk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "subscription_id", nullable = false)
    private Subscription subscription;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amountAtRisk;

    @Column(nullable = false)
    private Double riskScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskReason reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_status")
    private ReviewStatus reviewStatus = ReviewStatus.NONE;

    public enum ReviewStatus {
        NONE,
        PENDING,
        APPROVED,
        REJECTED
    }

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum RiskReason {
        EXPIRED_CARD,
        INSUFFICIENT_FUNDS,
        BANK_DECLINED,
        AUTHENTICATION_REQUIRED,
        FRAUD_SUSPECTED,
        UNKNOWN
    }

    public enum RiskStatus {
        OPEN,
        IN_RECOVERY,
        RECOVERED,
        LOST,
        STOPPED
    }

    public RevenueRisk() {
    }

    public Long getId() {
        return id;
    }

    public Customer getCustomer() {
        return customer;
    }

    public Subscription getSubscription() {
        return subscription;
    }

    public BigDecimal getAmountAtRisk() {
        return amountAtRisk;
    }

    public Double getRiskScore() {
        return riskScore;
    }

    public RiskReason getReason() {
        return reason;
    }

    public RiskStatus getStatus() {
        return status;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public void setSubscription(Subscription subscription) {
        this.subscription = subscription;
    }

    public void setAmountAtRisk(BigDecimal amountAtRisk) {
        this.amountAtRisk = amountAtRisk;
    }

    public void setRiskScore(Double riskScore) {
        this.riskScore = riskScore;
    }

    public void setReason(RiskReason reason) {
        this.reason = reason;
    }

    public void setStatus(RiskStatus status) {
        this.status = status;
    }

    public ReviewStatus getReviewStatus() {
        return reviewStatus;
    }

    public void setReviewStatus(ReviewStatus reviewStatus) {
        this.reviewStatus = reviewStatus;
    }

}