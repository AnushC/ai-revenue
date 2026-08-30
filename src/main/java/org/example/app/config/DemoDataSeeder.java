package org.example.app.config;

import org.example.app.entity.Customer;
import org.example.app.entity.RevenueRisk;
import org.example.app.entity.Subscription;
import org.example.app.repository.CustomerRepository;
import org.example.app.repository.RevenueRiskRepository;
import org.example.app.repository.SubscriptionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DemoDataSeeder implements CommandLineRunner {

    private final CustomerRepository customerRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final RevenueRiskRepository revenueRiskRepository;

    public DemoDataSeeder(
            CustomerRepository customerRepository,
            SubscriptionRepository subscriptionRepository,
            RevenueRiskRepository revenueRiskRepository
    ) {
        this.customerRepository = customerRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.revenueRiskRepository = revenueRiskRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {

        /*
         * Prevent duplicate demo data every time
         * Spring Boot restarts.
         */
        if (customerRepository.existsByEmail(
                "aarav.demo@revenueai.com"
        )) {

            System.out.println(
                    "RevenueAI demo data already exists. Skipping seeding."
            );

            return;
        }

        System.out.println(
                "Creating RevenueAI demo data..."
        );

        /*
         * ========================================================
         * CASE 1
         * BANK DECLINED
         * ========================================================
         */

        createCase(
                "Aarav Sharma",
                "aarav.demo@revenueai.com",
                new BigDecimal("85000"),
                "PREMIUM",
                new BigDecimal("4500"),
                RevenueRisk.RiskReason.BANK_DECLINED,
                0.65
        );

        /*
         * ========================================================
         * CASE 2
         * EXPIRED CARD
         * ========================================================
         */

        createCase(
                "Riya Mehta",
                "riya.demo@revenueai.com",
                new BigDecimal("120000"),
                "PREMIUM",
                new BigDecimal("7000"),
                RevenueRisk.RiskReason.EXPIRED_CARD,
                0.72
        );

        /*
         * ========================================================
         * CASE 3
         * INSUFFICIENT FUNDS
         * ========================================================
         */

        createCase(
                "Arjun Patel",
                "arjun.demo@revenueai.com",
                new BigDecimal("65000"),
                "STANDARD",
                new BigDecimal("3500"),
                RevenueRisk.RiskReason.INSUFFICIENT_FUNDS,
                0.58
        );

        /*
         * ========================================================
         * CASE 4
         * AUTHENTICATION REQUIRED
         * ========================================================
         */

        createCase(
                "Sneha Kapoor",
                "sneha.demo@revenueai.com",
                new BigDecimal("150000"),
                "PREMIUM",
                new BigDecimal("8500"),
                RevenueRisk.RiskReason.AUTHENTICATION_REQUIRED,
                0.76
        );

        /*
         * ========================================================
         * CASE 5
         * FRAUD SUSPECTED
         *
         * Policy should force HUMAN REVIEW.
         * ========================================================
         */

        createCase(
                "Vikram Malhotra",
                "vikram.demo@revenueai.com",
                new BigDecimal("300000"),
                "ENTERPRISE",
                new BigDecimal("18000"),
                RevenueRisk.RiskReason.FRAUD_SUSPECTED,
                0.95
        );

        /*
         * ========================================================
         * CASE 6
         * UNKNOWN FAILURE
         *
         * Policy should force HUMAN REVIEW.
         * ========================================================
         */

        createCase(
                "Ishita Verma",
                "ishita.demo@revenueai.com",
                new BigDecimal("45000"),
                "STANDARD",
                new BigDecimal("6000"),
                RevenueRisk.RiskReason.UNKNOWN,
                0.82
        );

        /*
         * ========================================================
         * CASE 7
         * HIGH VALUE RISK
         *
         * ₹32,000 >= ₹25,000
         *
         * Policy should force HUMAN REVIEW even if
         * Gemini recommends a normal recovery action.
         * ========================================================
         */

        createCase(
                "Kabir Singh",
                "kabir.demo@revenueai.com",
                new BigDecimal("500000"),
                "ENTERPRISE",
                new BigDecimal("32000"),
                RevenueRisk.RiskReason.BANK_DECLINED,
                0.91
        );

        /*
         * ========================================================
         * CASE 8
         * NORMAL SMALL PAYMENT FAILURE
         * ========================================================
         */

        createCase(
                "Ananya Joshi",
                "ananya.demo@revenueai.com",
                new BigDecimal("30000"),
                "STANDARD",
                new BigDecimal("1999"),
                RevenueRisk.RiskReason.EXPIRED_CARD,
                0.42
        );

        /*
         * ========================================================
         * CASE 9
         * MEDIUM VALUE PAYMENT FAILURE
         * ========================================================
         */

        createCase(
                "Rahul Nair",
                "rahul.demo@revenueai.com",
                new BigDecimal("95000"),
                "PREMIUM",
                new BigDecimal("9999"),
                RevenueRisk.RiskReason.INSUFFICIENT_FUNDS,
                0.68
        );

        /*
         * ========================================================
         * CASE 10
         * AUTHENTICATION FAILURE
         * ========================================================
         */

        createCase(
                "Neha Deshmukh",
                "neha.demo@revenueai.com",
                new BigDecimal("75000"),
                "STANDARD",
                new BigDecimal("5499"),
                RevenueRisk.RiskReason.AUTHENTICATION_REQUIRED,
                0.71
        );

        /*
         * ========================================================
         * CASE 11
         * PREMIUM CUSTOMER
         * ========================================================
         */

        createCase(
                "Aditya Rao",
                "aditya.demo@revenueai.com",
                new BigDecimal("225000"),
                "PREMIUM",
                new BigDecimal("14999"),
                RevenueRisk.RiskReason.BANK_DECLINED,
                0.79
        );

        /*
         * ========================================================
         * CASE 12
         * SMALL INSUFFICIENT FUNDS CASE
         * ========================================================
         */

        createCase(
                "Priya Kulkarni",
                "priya.demo@revenueai.com",
                new BigDecimal("28000"),
                "STANDARD",
                new BigDecimal("2499"),
                RevenueRisk.RiskReason.INSUFFICIENT_FUNDS,
                0.51
        );

        System.out.println(
                "========================================"
        );

        System.out.println(
                "RevenueAI demo data created successfully."
        );

        System.out.println(
                "12 customers created."
        );

        System.out.println(
                "12 subscriptions created."
        );

        System.out.println(
                "12 OPEN revenue risks created."
        );

        System.out.println(
                "========================================"
        );
    }

    /*
     * ============================================================
     * CREATE COMPLETE DEMO CASE
     * ============================================================
     */

    private void createCase(
            String customerName,
            String email,
            BigDecimal lifetimeValue,
            String segment,
            BigDecimal amountAtRisk,
            RevenueRisk.RiskReason reason,
            double riskScore
    ) {

        /*
         * --------------------------------------------------------
         * CUSTOMER
         * --------------------------------------------------------
         */

        Customer customer =
                new Customer();

        customer.setName(
                customerName
        );

        customer.setEmail(
                email
        );

        customer.setLifetimeValue(
                lifetimeValue
        );

        customer.setSegment(
                segment
        );

        customer =
                customerRepository.save(
                        customer
                );

        /*
         * --------------------------------------------------------
         * SUBSCRIPTION
         * --------------------------------------------------------
         */

        Subscription subscription =
                new Subscription();

        subscription.setCustomer(
                customer
        );

        /*
         * For demo purposes the subscription amount
         * is the same as the revenue currently at risk.
         */
        subscription.setAmount(
                amountAtRisk
        );

        subscription.setStatus(
                Subscription.SubscriptionStatus.PAST_DUE
        );

        subscription.setNextBillingDate(
                LocalDate.now()
                        .plusDays(7)
        );

        subscription =
                subscriptionRepository.save(
                        subscription
                );

        /*
         * --------------------------------------------------------
         * REVENUE RISK
         * --------------------------------------------------------
         */

        RevenueRisk revenueRisk =
                new RevenueRisk();

        revenueRisk.setCustomer(
                customer
        );

        revenueRisk.setSubscription(
                subscription
        );

        revenueRisk.setAmountAtRisk(
                amountAtRisk
        );

        revenueRisk.setRiskScore(
                riskScore
        );

        revenueRisk.setReason(
                reason
        );

        revenueRisk.setStatus(
                RevenueRisk.RiskStatus.OPEN
        );

        revenueRisk.setReviewStatus(
                RevenueRisk.ReviewStatus.NONE
        );

        revenueRiskRepository.save(
                revenueRisk
        );
    }
}