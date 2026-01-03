package com.cloudmenu.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "Order_Addons")
public class OrderAddon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "order_item_id", nullable = false)
    private Integer orderItemId;

    @Column(name = "addon_id", nullable = false)
    private Integer addonId;

    @Column(nullable = false)
    private Double price;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
