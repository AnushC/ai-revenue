package org.example.app.services;

import org.example.app.entity.Customer;
import org.example.app.entity.Subscription;
import org.example.app.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final CustomerService customerService;

    public SubscriptionService(
            SubscriptionRepository subscriptionRepository,
            CustomerService customerService
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.customerService = customerService;
    }

    public Subscription create(
            Long customerId,
            Subscription subscription
    ) {

        Customer customer =
                customerService.getById(customerId);

        subscription.setCustomer(customer);

        if (subscription.getStatus() == null) {
            subscription.setStatus(
                    Subscription.SubscriptionStatus.ACTIVE
            );
        }

        return subscriptionRepository.save(subscription);
    }

    public Subscription getById(Long id) {

        return subscriptionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Subscription not found: " + id
                        )
                );
    }
}