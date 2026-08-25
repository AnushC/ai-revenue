package org.example.app.controller;

import org.example.app.entity.AuditLog;
import org.example.app.entity.RecoveryAction;
import org.example.app.repository.AuditLogRepository;
import org.example.app.repository.RecoveryActionRepository;
import org.example.app.services.RecoveryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recovery")
public class RecoveryController {

    private final RecoveryService recoveryService;
    private final RecoveryActionRepository recoveryActionRepository;
    private final AuditLogRepository auditLogRepository;

    public RecoveryController(
            RecoveryService recoveryService,
            RecoveryActionRepository recoveryActionRepository,
            AuditLogRepository auditLogRepository
    ) {
        this.recoveryService = recoveryService;
        this.recoveryActionRepository =
                recoveryActionRepository;
        this.auditLogRepository =
                auditLogRepository;
    }

    @PostMapping("/{revenueRiskId}")
    public RecoveryAction startRecovery(
            @PathVariable Long revenueRiskId
    ) {

        return recoveryService.startRecovery(
                revenueRiskId
        );
    }

    @GetMapping("/{revenueRiskId}/actions")
    public List<RecoveryAction> getActions(
            @PathVariable Long revenueRiskId
    ) {

        return recoveryActionRepository
                .findByRevenueRiskId(
                        revenueRiskId
                );
    }

    @GetMapping("/{revenueRiskId}/audit")
    public List<AuditLog> getAuditTrail(
            @PathVariable Long revenueRiskId
    ) {

        return auditLogRepository
                .findByRevenueRiskIdOrderByCreatedAtAsc(
                        revenueRiskId
                );
    }
}