package org.example.app.repository;

import org.example.app.entity.PaymentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentAttemptRepository
        extends JpaRepository<PaymentAttempt, Long> {
}