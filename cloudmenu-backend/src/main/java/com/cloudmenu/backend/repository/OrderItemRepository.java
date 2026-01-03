// src/main/java/com/cloudmenu/backend/repository/OrderItemRepository.java
package com.cloudmenu.backend.repository;

import com.cloudmenu.backend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {

    // <-- This fixes your compile error in the service
    List<OrderItem> findByOrderId(Integer orderId);

    // Optional: nicer return type for top-items (see interface below)
    @Query(value = """
        SELECT mi.name  AS name,
               COALESCE(SUM(oi.quantity), 0) AS qty
        FROM Order_Items oi
        JOIN Orders      o  ON o.id  = oi.order_id
        JOIN Menu_Items  mi ON mi.id = oi.menu_item_id
        WHERE o.restaurant_id = :restaurantId
          AND o.created_at BETWEEN :from AND :to
        GROUP BY mi.name
        ORDER BY qty DESC
        """, nativeQuery = true)
    List<TopItemStat> topItems(Integer restaurantId, LocalDateTime from, LocalDateTime to);

    interface TopItemStat {
        String getName();
        Long getQty();
    }
}
