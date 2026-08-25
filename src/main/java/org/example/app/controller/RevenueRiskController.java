package org.example.app.controller;

import org.example.app.entity.RevenueRisk;
import org.example.app.repository.RevenueRiskRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/revenue-risks")
public class RevenueRiskController {

    private final RevenueRiskRepository revenueRiskRepository;

    public RevenueRiskController(
            RevenueRiskRepository revenueRiskRepository
    ) {
        this.revenueRiskRepository =
                revenueRiskRepository;
    }

    @GetMapping
    public List<RevenueRisk> getAll() {
        return revenueRiskRepository.findAll();
    }

    @GetMapping("/open")
    public List<RevenueRisk> getOpenRisks() {

        return revenueRiskRepository.findByStatus(
                RevenueRisk.RiskStatus.OPEN
        );
    }
}