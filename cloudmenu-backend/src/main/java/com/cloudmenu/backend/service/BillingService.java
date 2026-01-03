//package com.cloudmenu.backend.service;
//
//import com.cloudmenu.backend.entity.Restaurant;
//import com.cloudmenu.backend.entity.SubscriptionPlan;
//import com.cloudmenu.backend.repository.CustomerRepository;
//import com.cloudmenu.backend.repository.MenuItemRepository;
//import com.cloudmenu.backend.repository.OrderRepository;
//import com.cloudmenu.backend.repository.RestaurantRepository;
//import org.springframework.stereotype.Service;
//
//import java.io.IOException;
//import java.nio.file.*;
//import java.sql.Timestamp;
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//
//import java.util.Map;
//
//@Service
//public class BillingService {
//
//    public enum Plan { FREE, BASIC, PROFESSIONAL, ENTERPRISE }
//
//    // Limits used by the UI
//    private static final Map<Plan, Integer> MENU_LIMIT = Map.of(
//            Plan.FREE, 10, Plan.BASIC, 25, Plan.PROFESSIONAL, 100, Plan.ENTERPRISE, Integer.MAX_VALUE
//    );
//    private static final Map<Plan, Integer> ORDERS_LIMIT = Map.of(
//            Plan.FREE, 100, Plan.BASIC, 500, Plan.PROFESSIONAL, 2000, Plan.ENTERPRISE, Integer.MAX_VALUE
//    );
//    private static final Map<Plan, Long> STORAGE_LIMIT = Map.of( // bytes
//            Plan.FREE, 1L << 30,            // 1 GB
//            Plan.BASIC, 5L << 30,           // 5 GB
//            Plan.PROFESSIONAL, 25L << 30,   // 25 GB
//            Plan.ENTERPRISE, Long.MAX_VALUE
//    );
//
//    public record Usage(
//            String currentPlan,
//            int menuItems, int menuItemsLimit,
//            int monthlyOrders, int monthlyOrdersLimit,
//            int totalCustomers,
//            long storageUsedBytes, long storageLimitBytes
//    ) {}
//
//    private final RestaurantRepository restaurantRepo;
//    private final MenuItemRepository menuRepo;
//    private final OrderRepository orderRepo;
//    private final CustomerRepository customerRepo;
//
//    public BillingService(RestaurantRepository restaurantRepo,
//                          MenuItemRepository menuRepo,
//                          OrderRepository orderRepo,
//                          CustomerRepository customerRepo) {
//        this.restaurantRepo = restaurantRepo;
//        this.menuRepo = menuRepo;
//        this.orderRepo = orderRepo;
//        this.customerRepo = customerRepo;
//    }
//
//    public Plan currentPlan(Integer restaurantId) {
//        Restaurant r = restaurantRepo.findById(restaurantId).orElseThrow();
//        return Plan.valueOf(r.getSubscriptionPlan().name());
//    }
//
//    public Usage usage(Integer restaurantId) {
//        Plan plan = currentPlan(restaurantId);
//
//        int menuItems = safeCountMenuItems(restaurantId);
//        int monthlyOrders = safeCountMonthlyOrders(restaurantId);
//        int totalCustomers = safeCountCustomers(restaurantId);
//        long storageUsed = computeStorageBytes(restaurantId);
//
//        return new Usage(
//                plan.name(),
//                menuItems, MENU_LIMIT.get(plan),
//                monthlyOrders, ORDERS_LIMIT.get(plan),
//                totalCustomers,
//                storageUsed, STORAGE_LIMIT.get(plan)
//        );
//    }
//
//    public void upgrade(Integer restaurantId, Plan to) {
//        Restaurant r = restaurantRepo.findById(restaurantId).orElseThrow();
//        r.setSubscriptionPlan(SubscriptionPlan.valueOf(to.name())); // enum values: FREE,BASIC,PROFESSIONAL,ENTERPRISE
//        restaurantRepo.save(r);
//    }
//
//    /* ---------- helpers ---------- */
//
//    private int safeCountMenuItems(Integer restaurantId) {
//        try { return (int) menuRepo.countByRestaurantId(restaurantId); }
//        catch (Exception ignore) { return menuRepo.findByRestaurantId(restaurantId).size(); }
//    }
//
//    private int safeCountCustomers(Integer restaurantId) {
//        try { return (int) customerRepo.countByRestaurantId(restaurantId); }
//        catch (Exception ignore) { return customerRepo.findByRestaurantId(restaurantId).size(); }
//    }
//
//    private int safeCountMonthlyOrders(Integer restaurantId) {
//        var start = java.time.LocalDate.now().withDayOfMonth(1).atStartOfDay();
//        var end   = start.plusMonths(1);
//        try {
//            return (int) orderRepo.countByRestaurantIdAndCreatedAtBetween(restaurantId, start, end);
//        } catch (Exception ignore) {
//            return orderRepo.findByRestaurantId(restaurantId).size();
//        }
//    }
//
//    private long computeStorageBytes(Integer restaurantId) {
//        Path root = Path.of("uploads", String.valueOf(restaurantId)); // keep your per-restaurant uploads here
//        if (!Files.exists(root)) return 0L;
//        final long[] sum = {0};
//        try {
//            Files.walk(root).filter(Files::isRegularFile).forEach(p -> {
//                try { sum[0] += Files.size(p); } catch (IOException ignored) {}
//            });
//        } catch (IOException ignored) {}
//        return sum[0];
//    }
//}
//
package com.cloudmenu.backend.service;

import com.cloudmenu.backend.entity.Restaurant;
import com.cloudmenu.backend.repository.CustomerRepository;
import com.cloudmenu.backend.repository.MenuItemRepository;
import com.cloudmenu.backend.repository.OrderRepository;
import com.cloudmenu.backend.repository.RestaurantRepository;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Billing/Subscription service backing the Upgrade Plan page.
 * Controller expects:
 *   - ResponseEntity<BillingService.Usage> usage(...)
 *   - billing.upgrade(restaurantId, Plan)
 */
@Service
public class BillingService {

    private final RestaurantRepository restaurantRepo;
    private final MenuItemRepository menuRepo;
    private final OrderRepository orderRepo;
    private final CustomerRepository customerRepo;

    public BillingService(RestaurantRepository restaurantRepo,
                          MenuItemRepository menuRepo,
                          OrderRepository orderRepo,
                          CustomerRepository customerRepo) {
        this.restaurantRepo = restaurantRepo;
        this.menuRepo = menuRepo;
        this.orderRepo = orderRepo;
        this.customerRepo = customerRepo;
    }

    /** UI plan enum coming from the frontend */
    public enum Plan { FREE, BASIC, PROFESSIONAL, ENTERPRISE }

    /** Response type used by BillingController#usage */
    public static record Usage(
            int menuItems,
            int monthlyOrders,
            int totalCustomers,
            long storageBytes,
            String currentPlan
    ) {}

    /** Called by GET /api/billing/usage */
    public Usage usage(Integer restaurantId) {
        Restaurant r = restaurantRepo.findById(restaurantId).orElseThrow();

        int menuItems      = safeCountMenuItems(restaurantId);
        int monthlyOrders  = safeCountMonthlyOrders(restaurantId);
        int totalCustomers = safeCountCustomers(restaurantId);
        long storageBytes  = computeStorageBytes(restaurantId);
        String currentPlan = r.getSubscriptionPlan().name();

        return new Usage(menuItems, monthlyOrders, totalCustomers, storageBytes, currentPlan);
    }

    /** Apply upgrade/downgrade based on UI selection */
    public void upgrade(Integer restaurantId, Plan to) {
        var r = restaurantRepo.findById(restaurantId).orElseThrow();
        // Your Restaurant.SubscriptionPlan now includes FREE, so map 1:1
        r.setSubscriptionPlan(Restaurant.SubscriptionPlan.valueOf(to.name()));
        restaurantRepo.save(r);
    }

    /* -------------------- helpers -------------------- */

    private int safeCountMenuItems(Integer restaurantId) {
        try {
            // If you’ve added a count method, prefer it:
            // return (int) menuRepo.countByRestaurantId(restaurantId);
            // Fallback to list size if only findByRestaurantId exists:
            return menuRepo.findByRestaurantId(restaurantId).size();
        } catch (Exception ignore) {
            return menuRepo.findByRestaurantId(restaurantId).size();
        }
    }

    private int safeCountCustomers(Integer restaurantId) {
        try {
            // return (int) customerRepo.countByRestaurantId(restaurantId);
            return customerRepo.findByRestaurantId(restaurantId).size();
        } catch (Exception ignore) {
            return customerRepo.findByRestaurantId(restaurantId).size();
        }
    }

    private int safeCountMonthlyOrders(Integer restaurantId) {
        LocalDateTime start = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime end   = start.plusMonths(1);
        try {
            // Prefer a native count if present:
            return (int) orderRepo.countByRestaurantIdAndCreatedAtBetween(restaurantId, start, end);
        } catch (Exception ignore) {
            // Fallback: total orders (less accurate but won’t break)
            return orderRepo.findByRestaurantId(restaurantId).size();
        }
    }

    /** Simple on-disk calculation for /uploads/{restaurantId} */
    private long computeStorageBytes(Integer restaurantId) {
        Path root = Path.of("uploads", String.valueOf(restaurantId));
        if (!Files.exists(root)) return 0L;

        final long[] total = {0L};
        try {
            Files.walk(root)
                 .filter(Files::isRegularFile)
                 .forEach(p -> {
                     try { total[0] += Files.size(p); } catch (Exception ignored) {}
                 });
        } catch (Exception ignored) {}
        return total[0];
    }
}





