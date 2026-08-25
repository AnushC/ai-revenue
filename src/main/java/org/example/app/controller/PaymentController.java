package org.example.app.controller;

import org.example.app.entity.PaymentAttempt;
import org.example.app.entity.RevenueRisk;
import org.example.app.services.PaymentService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(
            PaymentService paymentService
    ) {
        this.paymentService = paymentService;
    }

    @PostMapping("/fail/{subscriptionId}")
    public RevenueRisk simulateFailure(
            @PathVariable Long subscriptionId,
            @RequestParam PaymentAttempt.FailureReason reason
    ) {

        return paymentService.simulateFailedPayment(
                subscriptionId,
                reason
        );
    }
}