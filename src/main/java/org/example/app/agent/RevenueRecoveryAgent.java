package org.example.app.agent;

import org.example.app.dto.AiRecoveryDecision;
import org.example.app.entity.Customer;
import org.example.app.entity.RevenueRisk;
import org.example.app.entity.Subscription;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class RevenueRecoveryAgent {

    private final ChatClient chatClient;

    public RevenueRecoveryAgent(
            ChatClient.Builder chatClientBuilder
    ) {
        this.chatClient =
                chatClientBuilder.build();
    }

    public AiRecoveryDecision analyze(
            RevenueRisk revenueRisk
    ) {

        Customer customer =
                revenueRisk.getCustomer();

        Subscription subscription =
                revenueRisk.getSubscription();

        String prompt = """
                You are a revenue recovery decision agent.

                Your job is to analyze a failed subscription payment
                and recommend ONE bounded recovery action.

                Allowed actions:

                SEND_PAYMENT_LINK
                RETRY_PAYMENT
                WAIT_AND_RETRY
                REQUEST_AUTHENTICATION
                HUMAN_REVIEW
                STOP

                Rules:

                1. Never recommend aggressive or repeated contact.
                2. Fraud cases must use HUMAN_REVIEW or STOP.
                3. Do not invent customer information.
                4. Choose exactly one allowed action.
                5. Confidence must be between 0.0 and 1.0.
                6. The policy engine will separately decide whether
                   the action is actually permitted.

                Revenue risk information:

                Customer name: %s
                Customer segment: %s
                Customer lifetime value: %s
                Subscription amount: %s
                Failure reason: %s
                Current risk score: %s
                Current recovery status: %s

                Return a structured decision containing:

                diagnosis
                recommendedAction
                confidence
                reason
                """
                .formatted(
                        customer.getName(),
                        customer.getSegment(),
                        customer.getLifetimeValue(),
                        subscription.getAmount(),
                        revenueRisk.getReason(),
                        revenueRisk.getRiskScore(),
                        revenueRisk.getStatus()
                );

        return chatClient
                .prompt()
                .user(prompt)
                .call()
                .entity(AiRecoveryDecision.class);
    }
}