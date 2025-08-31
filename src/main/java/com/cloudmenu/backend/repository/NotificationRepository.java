package com.cloudmenu.backend.repository;

import com.cloudmenu.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByRestaurantIdOrderByCreatedAtDesc(Integer restaurantId);
}
