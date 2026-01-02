package com.cloudmenu.backend.controller;

import com.cloudmenu.backend.service.BillingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private final BillingService billing;

    public BillingController(BillingService billing) {
        this.billing = billing;
    }

    // ---------- Queries ----------

    /** Auth required: current restaurant's usage (tenant-scoped). */
    @GetMapping("/usage")
    public ResponseEntity<BillingService.Usage> usage(
            @RequestAttribute(value = "restaurantId", required = false) Integer restaurantId) {
        if (restaurantId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(billing.usage(restaurantId));
    }

    /** Public: list available plans (static). */
    @GetMapping("/plans")
    public ResponseEntity<List<Map<String, Object>>> plans() {
        return ResponseEntity.ok(List.of(
            Map.of("code","FREE","name","Free","pricePerMonth",0,
                   "features", List.of("10 menu items","100 orders/month","Basic QR menu","1GB storage")),
            Map.of("code","BASIC","name","Basic","pricePerMonth",29,
                   "features", List.of("25 menu items","500 orders/month","Basic analytics","QR menu & 5GB storage")),
            Map.of("code","PROFESSIONAL","name","Professional","pricePerMonth",79,
                   "features", List.of("100 menu items","2,000 orders/month","Advanced analytics","Custom branding","25GB storage")),
            Map.of("code","ENTERPRISE","name","Enterprise","pricePerMonth",199,
                   "features", List.of("Unlimited everything","AI insights","White-label solution","API access","24/7 support"))
        ));
    }

    // ---------- Commands ----------

    public record UpgradeRequest(String plan) {}

    /** Auth required: upgrade current restaurant's plan. */
    @PostMapping("/upgrade")
    public ResponseEntity<?> upgrade(
            @RequestAttribute(value = "restaurantId", required = false) Integer restaurantId,
            @RequestBody UpgradeRequest req) {
        if (restaurantId == null) return ResponseEntity.status(401).build();
        try {
            var to = BillingService.Plan.valueOf(req.plan());
            billing.upgrade(restaurantId, to);
            return ResponseEntity.ok(Map.of("message", "Upgraded to " + to));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid plan: " + req.plan()));
        }
    }
}

