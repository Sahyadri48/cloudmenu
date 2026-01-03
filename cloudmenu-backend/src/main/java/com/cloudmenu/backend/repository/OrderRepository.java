package com.cloudmenu.backend.repository;

import com.cloudmenu.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    List<Order> findByRestaurantId(Integer restaurantId);

    List<Order> findByRestaurantIdAndStatus(Integer restaurantId, Order.Status status);

    // Counts orders whose 'createdAt' is in [start, end)
    long countByRestaurantIdAndCreatedAtBetween(Integer restaurantId,
                                                LocalDateTime start,
                                                LocalDateTime end);

    // ✅ New: list orders for a specific customer (used for count & billing)
    List<Order> findByRestaurantIdAndCustomerId(Integer restaurantId, Integer customerId);

    // ✅ New: only the IDs (cheaper when we just need order IDs to sum Bills)
    @Query("select o.id from Order o where o.restaurantId = :restaurantId and o.customerId = :customerId")
    List<Integer> findIdsByRestaurantIdAndCustomerId(Integer restaurantId, Integer customerId);
    
    
}

