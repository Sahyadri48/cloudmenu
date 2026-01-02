package com.cloudmenu.backend.service;

import com.cloudmenu.backend.entity.Notification;
import com.cloudmenu.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void createNotification(Integer restaurantId, String message, Notification.Type type) {
        Notification notification = new Notification();
        notification.setRestaurantId(restaurantId);
        notification.setMessage(message);
        notification.setType(type);
        notificationRepository.save(notification);
    }

    public List<Notification> getNotifications(Integer restaurantId) {
        return notificationRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);
    }
}
