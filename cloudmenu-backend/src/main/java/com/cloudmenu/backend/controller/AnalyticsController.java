package com.cloudmenu.backend.controller;

import com.cloudmenu.backend.dto.CustomerSummaryDTO;
import com.cloudmenu.backend.dto.AnalyticsDTO;
import com.cloudmenu.backend.dto.AnalyticsDTO.DailyPoint;
import com.cloudmenu.backend.dto.AnalyticsDTO.TopItem;
import com.cloudmenu.backend.entity.Customer;
import com.cloudmenu.backend.repository.BillRepository;
import com.cloudmenu.backend.repository.CustomerRepository;
import com.cloudmenu.backend.repository.OrderItemRepository;
import com.cloudmenu.backend.repository.OrderRepository;
import com.cloudmenu.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final BillRepository billRepository;
    private final OrderItemRepository orderItemRepository;
    private final NotificationService notificationService;

    public AnalyticsController(CustomerRepository customerRepository,
                               OrderRepository orderRepository,
                               BillRepository billRepository,
                               OrderItemRepository orderItemRepository,
                               NotificationService notificationService) {
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
        this.billRepository = billRepository;
        this.orderItemRepository = orderItemRepository;
        this.notificationService = notificationService;
    }

    /** Basic analytics: full customer objects + totalOrders count. */
    @GetMapping("/customers")
    public ResponseEntity<?> getCustomerAnalytics(@RequestAttribute("restaurantId") Integer restaurantId) {
        try {
            List<Customer> customers = customerRepository.findByRestaurantId(restaurantId);
            long orderCount = orderRepository.findByRestaurantId(restaurantId).size();
            Map<String, Object> analytics = new HashMap<>();
            analytics.put("customers", customers);
            analytics.put("totalOrders", orderCount);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /** Per-customer summary with order count and total billed (from Bills). */
    @GetMapping("/customers/summary")
    public ResponseEntity<List<CustomerSummaryDTO>> getCustomerSummaries(
            @RequestAttribute("restaurantId") Integer restaurantId) {
        try {
            List<Customer> customers = customerRepository.findByRestaurantId(restaurantId);
            List<CustomerSummaryDTO> out = new ArrayList<>(customers.size());

            for (Customer c : customers) {
                var orders = orderRepository.findByRestaurantIdAndCustomerId(restaurantId, c.getId());
                int count = orders.size();
                var orderIds = orders.stream().map(o -> o.getId()).toList();
                double total = orderIds.isEmpty() ? 0.0 : billRepository.sumTotalByOrderIds(orderIds);

                out.add(new CustomerSummaryDTO(
                        c.getId(),
                        c.getFullName(),
                        c.getEmail(),
                        count,
                        total
                ));
            }
            return ResponseEntity.ok(out);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(List.of());
        }
    }

    /** Notifications passthrough. */
    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications(@RequestAttribute("restaurantId") Integer restaurantId) {
        try {
            return ResponseEntity.ok(notificationService.getNotifications(restaurantId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * NEW: Aggregated analytics for KPIs, weekly revenue chart, and top items.
     * Query with: GET /api/analytics/metrics?from=2025-11-04&to=2025-11-10
     */
    @GetMapping("/metrics")
    public ResponseEntity<AnalyticsDTO> metrics(
            @RequestAttribute("restaurantId") Integer restaurantId,
            @RequestParam String from,
            @RequestParam String to
    ) {
        LocalDate fromDate = LocalDate.parse(from);
        LocalDate toDate = LocalDate.parse(to);
        LocalDateTime start = fromDate.atStartOfDay();
        LocalDateTime end = toDate.atTime(LocalTime.MAX);

        // --- revenue (Bills) ---
        double revenue = Optional.ofNullable(
                billRepository.sumTotalForRange(restaurantId, start, end)
        ).orElse(0.0);

        // --- daily series (Bills) ---
        var rawDaily = billRepository.dailyTotals(restaurantId, start, end); // [java.sql.Date, BigDecimal]
        Map<LocalDate, Double> byDay = new HashMap<>();
        for (Object[] row : rawDaily) {
            LocalDate day = (row[0] instanceof java.sql.Date sql) ? sql.toLocalDate() : (LocalDate) row[0];
            double sum = ((Number) row[1]).doubleValue();
            byDay.put(day, sum);
        }
        List<DailyPoint> daily = new ArrayList<>();
        for (LocalDate d = fromDate; !d.isAfter(toDate); d = d.plusDays(1)) {
            daily.add(new DailyPoint(d, byDay.getOrDefault(d, 0.0)));
        }

        // --- orders count + avg order ---
        long orders = orderRepository.countByRestaurantIdAndCreatedAtBetween(restaurantId, start, end);
        double avgOrder = orders == 0 ? 0.0 : revenue / orders;

        // --- rating (placeholder) ---
        double rating = 4.8;

        // --- top items (OrderItems) ---
        var rawTop = orderItemRepository.topItems(restaurantId, start, end); // List<TopItemStat>
        List<TopItem> topItems = rawTop.stream()
                .map(r -> new TopItem(r.getName(), r.getQty()))
                .toList();
        

        return ResponseEntity.ok(new AnalyticsDTO(revenue, orders, avgOrder, rating, daily, topItems));
    }

    record ErrorResponse(String error) {}
}
