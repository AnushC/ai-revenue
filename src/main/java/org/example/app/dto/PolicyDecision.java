package org.example.app.dto;

public class PolicyDecision {

    public enum Decision {
        APPROVED,
        BLOCKED,
        HUMAN_REVIEW
    }

    private final Decision decision;
    private final String reason;

    public PolicyDecision(
            Decision decision,
            String reason
    ) {
        this.decision = decision;
        this.reason = reason;
    }

    public Decision getDecision() {
        return decision;
    }

    public String getReason() {
        return reason;
    }
}