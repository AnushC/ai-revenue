package org.example.app.controller;

import org.example.app.entity.RecoveryOutcome;
import org.example.app.repository.RecoveryOutcomeRepository;
import org.example.app.services.RecoveryExecutionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recovery-execution")
public class RecoveryExecutionController {

    private final RecoveryExecutionService recoveryExecutionService;
    private final RecoveryOutcomeRepository recoveryOutcomeRepository;

    public RecoveryExecutionController(
            RecoveryExecutionService recoveryExecutionService,
            RecoveryOutcomeRepository recoveryOutcomeRepository
    ) {
        this.recoveryExecutionService =
                recoveryExecutionService;

        this.recoveryOutcomeRepository =
                recoveryOutcomeRepository;
    }

    @PostMapping("/{actionId}")
    public RecoveryOutcome execute(
            @PathVariable Long actionId,
            @RequestParam boolean successful
    ) {

        return recoveryExecutionService
                .executeRecovery(
                        actionId,
                        successful
                );
    }

    @GetMapping("/risk/{revenueRiskId}")
    public List<RecoveryOutcome> getOutcomes(
            @PathVariable Long revenueRiskId
    ) {

        return recoveryOutcomeRepository
                .findByRevenueRiskId(
                        revenueRiskId
                );
    }
}