// src/main/java/com/cloudmenu/backend/controller/BillController.java
// src/main/java/com/cloudmenu/backend/controller/BillController.java
package com.cloudmenu.backend.controller;

import com.cloudmenu.backend.dto.BillDTO;
import com.cloudmenu.backend.entity.Bill;
import com.cloudmenu.backend.service.BillService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.time.LocalDateTime;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/bills")
public class BillController {

    private final BillService svc;

    public BillController(BillService svc) {
        this.svc = svc;
    }

    /** Resolve restaurant id from request attribute first, then optional query param (dev fallback). */
    private Integer resolveRid(HttpServletRequest req, Integer ridParam) {
        Object ridAttr = req.getAttribute("restaurantId");
        if (ridAttr instanceof Integer i) return i;
        if (ridAttr instanceof String s && !s.isBlank()) {
            try { return Integer.parseInt(s); } catch (NumberFormatException ignored) {}
        }
        return ridParam; // may be null
    }

    /* ----------------- Commands ----------------- */

    @PostMapping
    public ResponseEntity<BillDTO> create(@RequestAttribute(value = "restaurantId", required = false) Integer ridAttr,
                                          @RequestParam(required = false) Integer restaurantId,
                                          @RequestBody BillDTO dto,
                                          HttpServletRequest req) {
        Integer rid = ridAttr != null ? ridAttr : resolveRid(req, restaurantId);
        if (rid == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(svc.create(rid, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BillDTO> updateStatus(@RequestAttribute(value = "restaurantId", required = false) Integer ridAttr,
                                                @RequestParam(required = false) Integer restaurantId,
                                                @PathVariable Integer id,
                                                @RequestParam String status,
                                                @RequestParam(required = false) String printedAt,
                                                HttpServletRequest req) {
        Integer rid = ridAttr != null ? ridAttr : resolveRid(req, restaurantId);
        if (rid == null) return ResponseEntity.status(401).build();

        LocalDateTime printed = null;
        if (printedAt != null && !printedAt.isBlank()) {
            printed = LocalDateTime.parse(printedAt); // ISO-8601
        }
        return ResponseEntity.ok(svc.updateStatus(rid, id, Bill.Status.valueOf(status), printed));
    }

    /* ----------------- Queries ----------------- */

    @GetMapping("/by-order/{orderId}")
    public ResponseEntity<BillDTO> byOrder(@RequestAttribute(value = "restaurantId", required = false) Integer ridAttr,
                                           @RequestParam(required = false) Integer restaurantId,
                                           @PathVariable Integer orderId,
                                           HttpServletRequest req) {
        Integer rid = ridAttr != null ? ridAttr : resolveRid(req, restaurantId);
        if (rid == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(svc.getByOrder(rid, orderId));
    }

    @GetMapping("/active")
    public Page<BillDTO> active(@RequestAttribute(value = "restaurantId", required = false) Integer ridAttr,
                                @RequestParam(required = false) Integer restaurantId,
                                @RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "20") int size,
                                HttpServletRequest req) {
        Integer rid = ridAttr != null ? ridAttr : resolveRid(req, restaurantId);
        if (rid == null) throw new RuntimeException("Unauthorized");
        return svc.active(rid, PageRequest.of(page, size));
    }

    @GetMapping("/history")
    public Page<BillDTO> history(@RequestAttribute(value = "restaurantId", required = false) Integer ridAttr,
                                 @RequestParam(required = false) Integer restaurantId,
                                 @RequestParam String from,
                                 @RequestParam String to,
                                 @RequestParam(defaultValue = "0") int page,
                                 @RequestParam(defaultValue = "20") int size,
                                 HttpServletRequest req) {
        Integer rid = ridAttr != null ? ridAttr : resolveRid(req, restaurantId);
        if (rid == null) throw new RuntimeException("Unauthorized");
        LocalDate fromDate = LocalDate.parse(from);
        LocalDate toDate = LocalDate.parse(to);
        return svc.history(rid, fromDate, toDate, PageRequest.of(page, size));
    }

    @GetMapping("/summary/today")
    public BillService.Summary today(@RequestAttribute(value = "restaurantId", required = false) Integer ridAttr,
                                     @RequestParam(required = false) Integer restaurantId,
                                     HttpServletRequest req) {
        Integer rid = ridAttr != null ? ridAttr : resolveRid(req, restaurantId);
        if (rid == null) throw new RuntimeException("Unauthorized");
        return svc.summaryToday(rid);
    }
}
