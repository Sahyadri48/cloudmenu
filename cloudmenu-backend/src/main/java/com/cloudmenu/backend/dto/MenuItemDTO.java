package com.cloudmenu.backend.dto;

import java.util.List;

public record MenuItemDTO(
        Integer id,
        Integer restaurantId,

        // 🧾 Basic Info
        String name,
        String description,

        // 💰 Pricing
        Double price,
        Double discountPrice,
        String currency,

        // ⏱️ Preparation
        Integer prepTime,

        // 🍽️ Categorization
        String category,
        String kitchenSection,
        String status,  // e.g., AVAILABLE / UNAVAILABLE

        // 🌶️ Details
        String spiceLevel,
        List<String> dietaryInfo,  // e.g., ["Vegetarian", "Vegan"]

        // 🧂 Composition
        String ingredients,
        String allergens,

        // 🖼️ Image
        String imageUrl,

        // ➕ Add-ons
        List<AddonDTO> addons
) {
    public record AddonDTO(
            Integer id,
            String name,
            Double price,
            String type // e.g. "Extra Cheese", "Toppings", "Sauce"
    ) {}
}



