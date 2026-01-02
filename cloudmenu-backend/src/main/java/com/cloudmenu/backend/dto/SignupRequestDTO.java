package com.cloudmenu.backend.dto;

public record SignupRequestDTO (
        String name,
        String email,
        String password,   // 👈 here we include password
        String logoUrl,
        String primaryColor,
        String secondaryColor
) {}
