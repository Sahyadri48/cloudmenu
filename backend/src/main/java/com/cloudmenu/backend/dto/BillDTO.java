package com.cloudmenu.backend.dto;

public record BillDTO(
        Integer id,
        Integer orderId,
        Double subtotal,
        Double tax,
        Double serviceFee,
        Double totalAmount,
        String status
) {}
