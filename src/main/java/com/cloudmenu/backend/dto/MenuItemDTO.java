package com.cloudmenu.backend.dto;

import java.util.List;

public record MenuItemDTO(
        Integer id,
        Integer restaurantId,
        String name,
        String description,
        Double price,
        String currency,
        Integer prepTime,
        String category,
        String kitchenSection,
        String status,
        String imageUrl,
        String dietaryInfo,
        String ingredients,
        String allergens,
        List<AddonDTO> addons
) {
    public record AddonDTO(Integer id, String name, Double price, String type) {}
}
