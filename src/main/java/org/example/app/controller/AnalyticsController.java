package org.example.app.controller;

import org.example.app.dto.DashboardAnalytics;
import org.example.app.services.AnalyticsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(
            AnalyticsService analyticsService
    ) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public DashboardAnalytics getDashboard() {

        return analyticsService
                .getDashboardAnalytics();
    }
}