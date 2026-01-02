// src/main/java/com/cloudmenu/backend/service/BillService.java
// src/main/java/com/cloudmenu/backend/service/BillService.java
package com.cloudmenu.backend.service;

import com.cloudmenu.backend.dto.BillDTO;
import com.cloudmenu.backend.entity.Bill;
import com.cloudmenu.backend.repository.BillRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Objects;

/*
 * Expected repository methods (add to BillRepository if not present):
 *
 *  Page<Bill> findByRestaurantIdAndStatus(Integer restaurantId, Bill.Status status, Pageable pageable);
 *  Page<Bill> findByRestaurantIdAndCreatedAtBetween(Integer restaurantId, LocalDateTime from, LocalDateTime to, Pageable pageable);
 *  java.util.List<Bill> findByRestaurantIdAndCreatedAtBetween(Integer restaurantId, LocalDateTime from, LocalDateTime to);
 *  Bill save(Bill bill);
 *  java.util.Optional<Bill> findById(Integer id);
 */

@Service
public class BillService {

    private final BillRepository bills;
    private final SimpMessagingTemplate stomp;

    public BillService(BillRepository bills, SimpMessagingTemplate stomp) {
        this.bills = bills;
        this.stomp = stomp;
    }

    /* ----------------- Commands ----------------- */

    @Transactional
    public BillDTO create(Integer restaurantId, BillDTO dto) {
        if (restaurantId == null || restaurantId == 0) {
            throw new IllegalArgumentException("Restaurant ID is required");
        }
        // Build entity
        Bill b = new Bill();
        b.setRestaurantId(restaurantId);
        b.setOrderId(Objects.requireNonNull(dto.orderId(), "orderId is required"));
        b.setSubtotal(dto.subtotal());
        b.setTax(dto.tax());
        b.setServiceFee(dto.serviceFee());
        b.setTotalAmount(dto.totalAmount());
        // default status = ACTIVE (entity default), but allow override from DTO if present
        if (dto.status() != null && !dto.status().isBlank()) {
            b.setStatus(Bill.Status.valueOf(dto.status()));
        }
        // createdAt defaults in entity

        Bill saved = bills.save(b);
        BillDTO out = toDTO(saved);

        // 🔔 Notify subscribers
        publish(restaurantId, out);

        return out;
    }

    @Transactional
    public BillDTO updateStatus(Integer restaurantId,
                                Integer id,
                                Bill.Status status,
                                LocalDateTime printedAt) {
        Bill b = bills.findById(id).orElseThrow(() -> new RuntimeException("Bill not found"));
        if (!b.getRestaurantId().equals(restaurantId)) {
            throw new RuntimeException("Forbidden");
        }

        b.setStatus(status);
        if (printedAt != null) {
            b.setPrintedAt(printedAt);
        }
        Bill saved = bills.save(b);
        BillDTO out = toDTO(saved);

        // 🔔 Notify subscribers
        publish(restaurantId, out);

        return out;
    }

    /* ----------------- Queries ----------------- */

    public Page<BillDTO> active(Integer restaurantId, Pageable pageable) {
        Page<Bill> page = bills.findByRestaurantIdAndStatus(restaurantId, Bill.Status.ACTIVE, pageable);
        return page.map(this::toDTO);
    }

    public Page<BillDTO> history(Integer restaurantId,
                                 LocalDate from,
                                 LocalDate to,
                                 Pageable pageable) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(LocalTime.MAX);
        Page<Bill> page = bills.findByRestaurantIdAndCreatedAtBetween(restaurantId, start, end, pageable);
        return page.map(this::toDTO);
    }
    public BillDTO getByOrder(Integer restaurantId, Integer orderId) {
        var bill = bills.findByRestaurantIdAndOrderId(restaurantId, orderId)
                .orElseThrow(() -> new RuntimeException("Bill not found for order " + orderId));
        return toDTO(bill);
    }

    public Summary summaryToday(Integer restaurantId) {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);

        var list = bills.findByRestaurantIdAndCreatedAtBetween(restaurantId, start, end);

        long count = list.size();
        double revenue = list.stream().mapToDouble(Bill::getTotalAmount).sum();
        long paid = list.stream().filter(b -> b.getStatus() == Bill.Status.PAID || b.getStatus() == Bill.Status.COMPLETED).count();
        long active = list.stream().filter(b -> b.getStatus() == Bill.Status.ACTIVE).count();

        return new Summary(count, revenue, paid, active);
    }

    /* ----------------- Helpers ----------------- */

    private void publish(Integer restaurantId, BillDTO payload) {
        try {
            stomp.convertAndSend("/topic/bills/" + restaurantId, payload);
        } catch (Exception ignored) {
            // Avoid failing the transaction just because WS is unavailable.
        }
    }

    private BillDTO toDTO(Bill b) {
        // tableCode / customerName / items are not stored on Bill entity in your model.
        // Return null for those optional fields; UI can ignore.
        return new BillDTO(
                b.getId(),
                b.getOrderId(),
                null,                 // tableCode (optional)
                null,                 // customerName (optional)
                null,                 // items (optional)
                safe(b.getSubtotal()),
                safe(b.getTax()),
                safe(b.getServiceFee()),
                safe(b.getTotalAmount()),
                b.getStatus() != null ? b.getStatus().name() : null,
                b.getCreatedAt(),
                b.getPrintedAt()
        );
    }

    private double safe(Double d) {
        return d == null ? 0.0 : d;
    }

    /* Returned by /api/bills/summary/today */
    public static class Summary {
        public final long count;
        public final double revenue;
        public final long paidCount;
        public final long activeCount;

        public Summary(long count, double revenue, long paidCount, long activeCount) {
            this.count = count;
            this.revenue = revenue;
            this.paidCount = paidCount;
            this.activeCount = activeCount;
        }
    }
}
