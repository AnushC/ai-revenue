package org.example.app.controller;

import org.example.app.entity.RevenueRisk;
import org.example.app.services.HumanReviewService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/human-review")
public class HumanReviewController {

    private final HumanReviewService humanReviewService;

    public HumanReviewController(
            HumanReviewService humanReviewService
    ) {
        this.humanReviewService = humanReviewService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'REVIEWER')")
    public List<RevenueRisk> pendingReviews() {
        return humanReviewService.getPendingReviews();
    }

    @PostMapping("/{riskId}/escalate")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECOVERY_ANALYST')")
    public RevenueRisk escalate(
            @PathVariable Long riskId
    ) {
        return humanReviewService.sendToReview(riskId);
    }

    @PostMapping("/{riskId}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'REVIEWER')")
    public RevenueRisk approve(
            @PathVariable Long riskId
    ) {
        return humanReviewService.approve(riskId);
    }

    @PostMapping("/{riskId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'REVIEWER')")
    public RevenueRisk reject(
            @PathVariable Long riskId
    ) {
        return humanReviewService.reject(riskId);
    }
}