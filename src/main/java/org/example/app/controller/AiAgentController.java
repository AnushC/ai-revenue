package org.example.app.controller;

import org.example.app.agent.RevenueRecoveryAgent;
import org.example.app.dto.AiRecoveryDecision;
import org.example.app.entity.RevenueRisk;
import org.example.app.repository.RevenueRiskRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiAgentController {

    private final RevenueRecoveryAgent revenueRecoveryAgent;
    private final RevenueRiskRepository revenueRiskRepository;

    public AiAgentController(
            RevenueRecoveryAgent revenueRecoveryAgent,
            RevenueRiskRepository revenueRiskRepository
    ) {
        this.revenueRecoveryAgent =
                revenueRecoveryAgent;

        this.revenueRiskRepository =
                revenueRiskRepository;
    }

    @PostMapping("/analyze/{revenueRiskId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECOVERY_ANALYST')")
    public AiRecoveryDecision analyzeRisk(
            @PathVariable Long revenueRiskId
    ) {

        RevenueRisk revenueRisk =
                revenueRiskRepository
                        .findById(revenueRiskId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Revenue risk not found: "
                                                + revenueRiskId
                                )
                        );

        return revenueRecoveryAgent
                .analyze(revenueRisk);
    }
}