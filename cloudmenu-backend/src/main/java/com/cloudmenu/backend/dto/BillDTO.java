// src/main/java/com/cloudmenu/backend/dto/BillDTO.java
package com.cloudmenu.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record BillDTO(
        Integer id,
        Integer orderId,
        String tableCode,       // "T-04" if you store it
        String customerName,    // optional
        List<Item> items,       // optional list for UI
        double subtotal,
        double tax,
        double serviceFee,
        double totalAmount,
        String status,          // ACTIVE | PAID | INACTIVE | COMPLETED
        LocalDateTime createdAt,
        LocalDateTime printedAt
) {
    public record Item(String name, int qty, double unitPrice, String tag) {}
}
