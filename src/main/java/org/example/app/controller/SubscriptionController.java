package org.example.app.controller;

import org.example.app.entity.Subscription;
import org.example.app.services.SubscriptionService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(
            SubscriptionService subscriptionService
    ) {
        this.subscriptionService = subscriptionService;
    }

    @PostMapping("/customer/{customerId}")
    public Subscription create(
            @PathVariable Long customerId,
            @RequestBody Subscription subscription
    ) {
        return subscriptionService.create(
                customerId,
                subscription
        );
    }

    @GetMapping("/{id}")
    public Subscription getById(
            @PathVariable Long id
    ) {
        return subscriptionService.getById(id);
    }
}