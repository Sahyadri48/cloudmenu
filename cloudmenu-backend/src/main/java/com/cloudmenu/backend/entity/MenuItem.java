package com.cloudmenu.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "Menu_Items")
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "restaurant_id", nullable = false)
    private Integer restaurantId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    // 💰 Pricing
    @Column(nullable = false)
    private Double price;

    @Column(name = "discount_price")
    private Double discountPrice; // ✅ Added for DTO compatibility

    @Column(length = 3)
    private String currency;

    // ⏱️ Preparation
    @Column(name = "prep_time")
    private Integer prepTime;

    // 🍽️ Categorization
    @Column(length = 100)
    private String category;

    @Column(name = "kitchen_section", length = 100)
    private String kitchenSection;

    @Enumerated(EnumType.STRING)
    private Status status = Status.AVAILABLE;

    // 🌶️ Spice Level
    @Column(name = "spice_level", length = 50)
    private String spiceLevel; // ✅ Added for DTO compatibility

    // 🥗 Dietary Info (JSON Array)
    @Column(columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> dietaryInfo;

    // 🧂 Composition
    @Column(columnDefinition = "TEXT")
    private String ingredients;

    @Column(columnDefinition = "TEXT")
    private String allergens;

    // 🖼️ Image
    @Column(name = "image_url")
    private String imageUrl;

    // 📅 Metadata
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Status {
        AVAILABLE, UNAVAILABLE
    }
}
