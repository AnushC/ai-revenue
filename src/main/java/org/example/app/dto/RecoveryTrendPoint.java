package org.example.app.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RecoveryTrendPoint {

    private LocalDate date;
    private BigDecimal amountRecovered;

    public RecoveryTrendPoint(
            LocalDate date,
            BigDecimal amountRecovered
    ) {
        this.date = date;
        this.amountRecovered = amountRecovered;
    }

    public LocalDate getDate() {
        return date;
    }

    public BigDecimal getAmountRecovered() {
        return amountRecovered;
    }
}