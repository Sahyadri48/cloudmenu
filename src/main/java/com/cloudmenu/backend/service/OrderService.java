package com.cloudmenu.backend.service;

import com.cloudmenu.backend.dto.OrderDTO;
import com.cloudmenu.backend.entity.*;
import com.cloudmenu.backend.repository.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final AddonRepository addonRepository;
    private final OrderAddonRepository orderAddonRepository;
    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                        OrderAddonRepository orderAddonRepository, MenuItemRepository menuItemRepository,
                        AddonRepository addonRepository,
                        RestaurantRepository restaurantRepository, NotificationService notificationService,
                        SimpMessagingTemplate messagingTemplate) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.orderAddonRepository = orderAddonRepository;
        this.menuItemRepository = menuItemRepository;
        this.restaurantRepository = restaurantRepository;
        this.addonRepository = addonRepository;
        this.notificationService = notificationService;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public OrderDTO createOrder(Integer restaurantId, Integer customerId, Integer tableNumber, OrderDTO dto) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        long orderCount = orderRepository.findByRestaurantId(restaurantId).size();
        long limit = switch (restaurant.getSubscriptionPlan()) {
            case BASIC -> 500;
            case PROFESSIONAL -> 2000;
            case ENTERPRISE -> Long.MAX_VALUE;
        };
        if (orderCount >= limit) {
            throw new RuntimeException("Order limit reached for your plan");
        }

        double subtotal = dto.items().stream().mapToDouble(item ->
                item.basePrice() * item.quantity() +
                        item.addons().stream().mapToDouble(OrderDTO.OrderItemDTO.OrderAddonDTO::price).sum()
        ).sum();
        double tax = subtotal * 0.08;
        double serviceFee = subtotal * 0.05;
        double totalAmount = subtotal + tax + serviceFee;

        Order order = new Order();
        order.setRestaurantId(restaurantId);
        order.setCustomerId(customerId);
        order.setOrderNumber("ORD" + System.currentTimeMillis());
        order.setTableNumber(tableNumber);
        order.setTotalAmount(totalAmount);
        orderRepository.save(order);

        for (OrderDTO.OrderItemDTO itemDTO : dto.items()) {
            MenuItem menuItem = menuItemRepository.findById(itemDTO.menuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found"));
            OrderItem orderItem = new OrderItem();
            orderItem.setOrderId(order.getId());
            orderItem.setMenuItemId(itemDTO.menuItemId());
            orderItem.setQuantity(itemDTO.quantity());
            orderItem.setBasePrice(itemDTO.basePrice());
            orderItem.setSpecialInstructions(itemDTO.specialInstructions());
            orderItemRepository.save(orderItem);

            for (OrderDTO.OrderItemDTO.OrderAddonDTO addonDTO : itemDTO.addons()) {
                OrderAddon orderAddon = new OrderAddon();
                orderAddon.setOrderItemId(orderItem.getId());
                orderAddon.setAddonId(addonDTO.id());
                orderAddon.setPrice(addonDTO.price());
                orderAddonRepository.save(orderAddon);
            }
        }

        notificationService.createNotification(restaurantId, "New order #" + order.getOrderNumber() + " for table " + tableNumber, Notification.Type.INFO);
        messagingTemplate.convertAndSend("/topic/orders/" + restaurantId, getOrderDTO(order));

        return getOrderDTO(order);
    }

    public List<OrderDTO> getOrders(Integer restaurantId, String status) {
        List<Order> orders = status != null
                ? orderRepository.findByRestaurantIdAndStatus(restaurantId, Order.Status.valueOf(status))
                : orderRepository.findByRestaurantId(restaurantId);
        return orders.stream().map(this::getOrderDTO).toList();
    }

    @Transactional
    public void updateOrderStatus(Integer orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(Order.Status.valueOf(status));
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
        notificationService.createNotification(order.getRestaurantId(), "Order #" + order.getOrderNumber() + " updated to " + status, Notification.Type.INFO);
        messagingTemplate.convertAndSend("/topic/orders/" + order.getRestaurantId(), getOrderDTO(order));
    }

    @Transactional
    public void updateOrderItemStatus(Integer itemId, String status) {
        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Order item not found"));
        item.setStatus(OrderItem.Status.valueOf(status));
        orderItemRepository.save(item);
        Order order = orderRepository.findById(item.getOrderId()).orElseThrow();
        messagingTemplate.convertAndSend("/topic/orders/" + order.getRestaurantId(), getOrderDTO(order));
    }

    private OrderDTO getOrderDTO(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        List<OrderDTO.OrderItemDTO> itemDTOs = items.stream().map(item -> {
            List<OrderAddon> addons = orderAddonRepository.findByOrderItemId(item.getId());
            List<OrderDTO.OrderItemDTO.OrderAddonDTO> addonDTOs = addons.stream()
                    .map(addon -> new OrderDTO.OrderItemDTO.OrderAddonDTO(
                            addon.getAddonId(),
                            addonRepository.findById(addon.getAddonId()).map(Addon::getName).orElse("Unknown"),
                            addon.getPrice()
                    )).toList();
            return new OrderDTO.OrderItemDTO(
                    item.getId(),
                    item.getMenuItemId(),
                    menuItemRepository.findById(item.getMenuItemId()).map(MenuItem::getName).orElse("Unknown"),
                    item.getQuantity(),
                    item.getBasePrice(),
                    item.getSpecialInstructions(),
                    item.getStatus().name(),
                    addonDTOs
            );
        }).toList();
        return new OrderDTO(
                order.getId(), order.getRestaurantId(), order.getCustomerId(), order.getOrderNumber(),
                order.getTableNumber(), order.getStatus().name(), order.getTotalAmount(), itemDTOs
        );
    }
}
