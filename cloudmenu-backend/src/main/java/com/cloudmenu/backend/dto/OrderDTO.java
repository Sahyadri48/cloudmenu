package com.cloudmenu.backend.dto;

import java.util.List;

public record OrderDTO(
        Integer id,
        Integer restaurantId,
        Integer customerId,
        String orderNumber,
        Integer tableNumber,
        String status,
        Double totalAmount,
        List<OrderItemDTO> items
) {
    public record OrderItemDTO(
            Integer id,
            Integer menuItemId,
            String name,
            Integer quantity,
            Double basePrice,
            String specialInstructions,
            String status,
            List<OrderAddonDTO> addons
    ) {
        public record OrderAddonDTO(Integer id, String name, Double price) {}
    }
}