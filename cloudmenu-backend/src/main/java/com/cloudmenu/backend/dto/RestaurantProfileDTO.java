package com.cloudmenu.backend.dto;

import java.util.Map;

public record RestaurantProfileDTO(
        Integer id,
        String name,
        String ownerName,
        String email,
        String phone,
        String description,
        String address,
        String city,
        String state,
        String zip,
        // e.g. { "monday": {"open":"09:00","close":"22:00"}, ... }
        Map<String, Map<String, String>> operatingHours,
        Double taxRate,
        Double serviceFee,
        String currency,
        Boolean deliveryEnabled,
        Boolean takeoutEnabled,
        String logoUrl
) {}
