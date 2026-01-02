package com.cloudmenu.backend.dto;

import java.time.LocalDate;
import java.util.List;

public record AnalyticsDTO(
        double revenue,                 // total revenue in range
        long orders,                    // total orders in range
        double avgOrder,                // revenue / orders (0 if orders==0)
        double rating,                  // placeholder (static 4.8 or from your model)
        List<DailyPoint> daily,         // daily revenue series
        List<TopItem> topItems          // top menu items by qty
) {
    public record DailyPoint(LocalDate day, double amount) {}
    public record TopItem(String name, long qty) {}
}
