// src/main/java/com/cloudmenu/backend/controller/OrderController.java
package com.cloudmenu.backend.controller;

import com.cloudmenu.backend.dto.OrderDTO;
import com.cloudmenu.backend.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /** CUSTOMER creates an order (token role=CUSTOMER, request attribute userId=customerId, restaurantId also present) */
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestAttribute("userId") Integer customerId,
                                         @RequestBody OrderRequest request) {
        try {
            OrderDTO order = orderService.createOrder(
                    request.restaurantId(), customerId, request.tableNumber(), request.order());
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /** RESTAURANT reads its orders (attribute restaurantId) */
    @GetMapping
    public ResponseEntity<List<OrderDTO>> getOrders(@RequestAttribute("restaurantId") Integer restaurantId,
                                                    @RequestParam(required = false) String status) {
        return ResponseEntity.ok(orderService.getOrders(restaurantId, status));
    }

    /** RESTAURANT updates order status */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@RequestAttribute("restaurantId") Integer restaurantId,
                                               @PathVariable Integer id,
                                               @RequestBody StatusRequest request) {
        try {
            orderService.updateOrderStatus(id, request.status());
            return ResponseEntity.ok(new SuccessResponse("Order status updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /** RESTAURANT updates order-item status */
    @PatchMapping("/items/{id}/status")
    public ResponseEntity<?> updateOrderItemStatus(@RequestAttribute("restaurantId") Integer restaurantId,
                                                   @PathVariable Integer id,
                                                   @RequestBody StatusRequest request) {
        try {
            orderService.updateOrderItemStatus(id, request.status());
            return ResponseEntity.ok(new SuccessResponse("Order item status updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /* DTOs */
    public record OrderRequest(Integer restaurantId, Integer tableNumber, OrderDTO order) {}
    public record StatusRequest(String status) {}
    public record SuccessResponse(String message) {}
    public record ErrorResponse(String error) {}
}
