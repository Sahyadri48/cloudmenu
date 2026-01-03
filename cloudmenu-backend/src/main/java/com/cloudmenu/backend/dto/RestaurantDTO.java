package com.cloudmenu.backend.dto;

public record RestaurantDTO(
        Integer id,
        String name,
        String email,
   
        String subscriptionPlan,
        String logoUrl,
        String primaryColor,
        String secondaryColor
) {}
