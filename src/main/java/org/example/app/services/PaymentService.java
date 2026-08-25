package org.example.app.services;

import org.example.app.entity.Customer;
import org.example.app.entity.PaymentAttempt;
import org.example.app.entity.RevenueRisk;
import org.example.app.entity.Subscription;
import org.example.app.repository.PaymentAttemptRepository;
import org.example.app.repository.RevenueRiskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService {

    private final PaymentAttemptRepository paymentAttemptRepository;
    private final RevenueRiskRepository revenueRiskRepository;
    private final SubscriptionService subscriptionService;

    public PaymentService(
            PaymentAttemptRepository paymentAttemptRepository,
            RevenueRiskRepository revenueRiskRepository,
            SubscriptionService subscriptionService
    ) {
        this.paymentAttemptRepository = paymentAttemptRepository;
        this.revenueRiskRepository = revenueRiskRepository;
        this.subscriptionService = subscriptionService;
    }

    @Transactional
    public RevenueRisk simulateFailedPayment(
            Long subscriptionId,
            PaymentAttempt.FailureReason failureReason
    ) {

        Subscription subscription =
                subscriptionService.getById(subscriptionId);

        PaymentAttempt paymentAttempt =
                new PaymentAttempt();

        paymentAttempt.setSubscription(subscription);
        paymentAttempt.setAmount(subscription.getAmount());
        paymentAttempt.setStatus(
                PaymentAttempt.PaymentStatus.FAILED
        );
        paymentAttempt.setFailureReason(failureReason);

        paymentAttemptRepository.save(paymentAttempt);

        subscription.setStatus(
                Subscription.SubscriptionStatus.PAST_DUE
        );

        double riskScore =
                calculateRiskScore(
                        subscription.getCustomer(),
                        failureReason
                );

        RevenueRisk revenueRisk =
                new RevenueRisk();

        revenueRisk.setCustomer(
                subscription.getCustomer()
        );

        revenueRisk.setSubscription(subscription);

        revenueRisk.setAmountAtRisk(
                subscription.getAmount()
        );

        revenueRisk.setRiskScore(riskScore);

        revenueRisk.setReason(
                mapReason(failureReason)
        );

        revenueRisk.setStatus(
                RevenueRisk.RiskStatus.OPEN
        );

        return revenueRiskRepository.save(revenueRisk);
    }

    private double calculateRiskScore(
            Customer customer,
            PaymentAttempt.FailureReason reason
    ) {

        double score = 0.50;

        switch (reason) {

            case EXPIRED_CARD:
                score += 0.25;
                break;

            case INSUFFICIENT_FUNDS:
                score += 0.10;
                break;

            case BANK_DECLINED:
                score += 0.15;
                break;

            case AUTHENTICATION_REQUIRED:
                score += 0.20;
                break;

            case FRAUD_SUSPECTED:
                score += 0.35;
                break;

            case UNKNOWN:
                score += 0.05;
                break;
        }

        if (customer.getLifetimeValue() != null
                && customer.getLifetimeValue()
                .doubleValue() > 1000) {

            score += 0.10;
        }

        return Math.min(score, 1.0);
    }

    private RevenueRisk.RiskReason mapReason(
            PaymentAttempt.FailureReason reason
    ) {

        return switch (reason) {

            case EXPIRED_CARD ->
                    RevenueRisk.RiskReason.EXPIRED_CARD;

            case INSUFFICIENT_FUNDS ->
                    RevenueRisk.RiskReason.INSUFFICIENT_FUNDS;

            case BANK_DECLINED ->
                    RevenueRisk.RiskReason.BANK_DECLINED;

            case AUTHENTICATION_REQUIRED ->
                    RevenueRisk.RiskReason.AUTHENTICATION_REQUIRED;

            case FRAUD_SUSPECTED ->
                    RevenueRisk.RiskReason.FRAUD_SUSPECTED;

            case UNKNOWN ->
                    RevenueRisk.RiskReason.UNKNOWN;
        };
    }
}