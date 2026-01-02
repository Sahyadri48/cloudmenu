
package com.cloudmenu.backend.dto;

public record CustomerSummaryDTO(
        Integer customerId,
        String fullName,
        String email,
        int ordersCount,
        double totalBilled
) {}
