package com.cloudmenu.backend.repository;

import com.cloudmenu.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByRestaurantId(Integer restaurantId);
    List<Order> findByRestaurantIdAndStatus(Integer restaurantId, Order.Status status);
}
