package org.example.app.controller;

import org.example.app.dto.BatchWorkflowResult;
import org.example.app.dto.WorkflowResult;
import org.example.app.services.BatchRecoveryService;
import org.example.app.services.RecoveryWorkflowService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/workflows")
public class RecoveryWorkflowController {

    private final RecoveryWorkflowService recoveryWorkflowService;
    private final BatchRecoveryService batchRecoveryService;

    public RecoveryWorkflowController(
            RecoveryWorkflowService recoveryWorkflowService,
            BatchRecoveryService batchRecoveryService
    ) {
        this.recoveryWorkflowService =
                recoveryWorkflowService;

        this.batchRecoveryService =
                batchRecoveryService;
    }

    @PostMapping("/run/{revenueRiskId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECOVERY_ANALYST')")
    public WorkflowResult runWorkflow(
            @PathVariable Long revenueRiskId
    ) {

        return recoveryWorkflowService
                .runWorkflow(
                        revenueRiskId
                );
    }



    @PostMapping("/run-batch")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECOVERY_ANALYST')")
    public BatchWorkflowResult runBatch() {
        return batchRecoveryService.runBatch();
    }
}