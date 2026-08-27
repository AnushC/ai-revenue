package org.example.app.dto;

public class WorkflowResult {

    private Long revenueRiskId;
    private Long recoveryActionId;
    private String actionType;
    private String decisionSource;
    private boolean approved;
    private String workflowStatus;
    private String message;

    public WorkflowResult() {
    }

    public Long getRevenueRiskId() {
        return revenueRiskId;
    }

    public void setRevenueRiskId(Long revenueRiskId) {
        this.revenueRiskId = revenueRiskId;
    }

    public Long getRecoveryActionId() {
        return recoveryActionId;
    }

    public void setRecoveryActionId(Long recoveryActionId) {
        this.recoveryActionId = recoveryActionId;
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public String getDecisionSource() {
        return decisionSource;
    }

    public void setDecisionSource(String decisionSource) {
        this.decisionSource = decisionSource;
    }

    public boolean isApproved() {
        return approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }

    public String getWorkflowStatus() {
        return workflowStatus;
    }

    public void setWorkflowStatus(String workflowStatus) {
        this.workflowStatus = workflowStatus;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}