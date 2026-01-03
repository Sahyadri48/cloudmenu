// src/main/java/com/cloudmenu/backend/repository/BillRepository.java
package com.cloudmenu.backend.repository;

import com.cloudmenu.backend.entity.Bill;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Integer> {

    // ---------- existing ----------
    Optional<Bill> findByRestaurantIdAndOrderId(Integer restaurantId, Integer orderId);

    Page<Bill> findByRestaurantIdAndStatus(Integer restaurantId,
                                           Bill.Status status,
                                           Pageable pageable);

    Page<Bill> findByRestaurantIdAndStatusInAndCreatedAtBetween(
            Integer restaurantId,
            List<Bill.Status> statuses,
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable
    );

    Page<Bill> findByRestaurantIdAndCreatedAtBetween(
            Integer restaurantId,
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable
    );

    List<Bill> findByRestaurantIdAndCreatedAtBetween(
            Integer restaurantId,
            LocalDateTime from,
            LocalDateTime to
    );

    // Sum total amounts for a set of order IDs (JPQL)
    @Query("select coalesce(sum(b.totalAmount), 0) from Bill b where b.orderId in :orderIds")
    Double sumTotalByOrderIds(Collection<Integer> orderIds);

    // ---------- NEW: MySQL-native helpers for Analytics ----------

    // Total revenue in range for a restaurant
    @Query(value = """
        SELECT COALESCE(SUM(b.total_amount), 0)
        FROM Bills b
        WHERE b.restaurant_id = :restaurantId
          AND b.created_at BETWEEN :from AND :to
        """, nativeQuery = true)
    Double sumTotalForRange(Integer restaurantId, LocalDateTime from, LocalDateTime to);

    // Daily revenue points (date, sum) in range for a restaurant
    @Query(value = """
        SELECT DATE(b.created_at) AS d, COALESCE(SUM(b.total_amount), 0) AS s
        FROM Bills b
        WHERE b.restaurant_id = :restaurantId
          AND b.created_at BETWEEN :from AND :to
        GROUP BY DATE(b.created_at)
        ORDER BY d
        """, nativeQuery = true)
    List<Object[]> dailyTotals(Integer restaurantId, LocalDateTime from, LocalDateTime to);
}

