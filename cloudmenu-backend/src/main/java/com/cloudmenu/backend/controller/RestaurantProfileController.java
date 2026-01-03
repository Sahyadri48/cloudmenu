// src/main/java/com/cloudmenu/backend/controller/RestaurantProfileController.java
package com.cloudmenu.backend.controller;

import com.cloudmenu.backend.dto.RestaurantProfileDTO;
import com.cloudmenu.backend.entity.Restaurant;
import com.cloudmenu.backend.repository.CustomerRepository;
import com.cloudmenu.backend.repository.MenuItemRepository;
import com.cloudmenu.backend.repository.RestaurantRepository;
import com.cloudmenu.backend.service.QRService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/restaurant")
public class RestaurantProfileController {

    private final RestaurantRepository restaurantRepo;
    private final MenuItemRepository menuRepo;
    private final CustomerRepository customerRepo;
    private final ObjectMapper objectMapper;
    private final QRService qrService;

    public RestaurantProfileController(RestaurantRepository restaurantRepo,
                                       MenuItemRepository menuRepo,
                                       CustomerRepository customerRepo,
                                       ObjectMapper objectMapper,
                                       QRService qrService) {
        this.restaurantRepo = restaurantRepo;
        this.menuRepo = menuRepo;
        this.customerRepo = customerRepo;
        this.objectMapper = objectMapper;
        this.qrService = qrService;
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

    // GET profile (protected)
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestAttribute(value = "restaurantId", required = false) Integer ridAttr,
                                        @RequestParam(required = false) Integer restaurantId,
                                        HttpServletRequest req) throws Exception {
        Integer rid = ridAttr != null ? ridAttr : resolveRid(req, restaurantId);
        if (rid == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        Restaurant r = restaurantRepo.findById(rid).orElseThrow();
        Map<String, Map<String, String>> hours = parseHours(r.getOperatingHoursJson());
        return ResponseEntity.ok(toDTO(r, hours));
    }

    // Update profile (protected)
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestAttribute(value = "restaurantId", required = false) Integer ridAttr,
                                           @RequestParam(required = false) Integer restaurantId,
                                           @RequestBody RestaurantProfileDTO dto,
                                           HttpServletRequest req) throws Exception {
        Integer rid = ridAttr != null ? ridAttr : resolveRid(req, restaurantId);
        if (rid == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        Restaurant r = restaurantRepo.findById(rid).orElseThrow();

        r.setName(dto.name());
        r.setOwnerName(dto.ownerName());
        r.setEmail(dto.email());
        r.setPhone(dto.phone());
        r.setDescription(dto.description());
        r.setAddress(dto.address());
        r.setCity(dto.city());
        r.setState(dto.state());
        r.setZip(dto.zip());
        r.setOperatingHoursJson(objectMapper.writeValueAsString(dto.operatingHours()));
        r.setTaxRate(dto.taxRate());
        r.setServiceFee(dto.serviceFee());
        r.setCurrency(dto.currency());
        r.setDeliveryEnabled(dto.deliveryEnabled());
        r.setTakeoutEnabled(dto.takeoutEnabled());
        r.setLogoUrl(dto.logoUrl());

        restaurantRepo.save(r);
        return ResponseEntity.ok(Map.of("message", "Profile updated"));
    }

    // Upload/replace logo (protected)
    @PostMapping(value = "/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadLogo(@RequestAttribute(value = "restaurantId", required = false) Integer ridAttr,
                                        @RequestParam(required = false) Integer restaurantId,
                                        @RequestPart("file") MultipartFile file,
                                        HttpServletRequest req) throws Exception {
        Integer rid = ridAttr != null ? ridAttr : resolveRid(req, restaurantId);
        if (rid == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Empty file"));
        }
        Path dir = Path.of("uploads", "logos");
        Files.createDirectories(dir);
        String ext = getExt(file.getOriginalFilename());
        Path target = dir.resolve(rid + "_logo." + ext);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        String url = "http://localhost:8080/uploads/logos/" + target.getFileName();

        Restaurant r = restaurantRepo.findById(rid).orElseThrow();
        r.setLogoUrl(url);
        restaurantRepo.save(r);

        return ResponseEntity.ok(Map.of("url", url));
    }

    // QR png for menu link (protected)
    @GetMapping(value = "/qr", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<?> qr(@RequestAttribute(value = "restaurantId", required = false) Integer ridAttr,
                                @RequestParam(required = false) Integer restaurantId,
                                HttpServletRequest req,
                                HttpServletResponse resp) throws Exception {
        Integer rid = ridAttr != null ? ridAttr : resolveRid(req, restaurantId);
        if (rid == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        byte[] png = Base64.getDecoder().decode(qrService.generateQRCode(rid, 0));
        resp.setContentType(MediaType.IMAGE_PNG_VALUE);
        resp.getOutputStream().write(png);
        return null; // response written directly
    }

    // Quick stats (protected)
    @GetMapping("/stats")
    public ResponseEntity<?> stats(@RequestAttribute(value = "restaurantId", required = false) Integer ridAttr,
                                   @RequestParam(required = false) Integer restaurantId,
                                   HttpServletRequest req) {
        Integer rid = ridAttr != null ? ridAttr : resolveRid(req, restaurantId);
        if (rid == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        int menuItems = menuRepo.findByRestaurantId(rid).size();
        int totalCustomers = customerRepo.findByRestaurantId(rid).size();
        int activeTables = 0;
        double rating = 4.8;

        return ResponseEntity.ok(Map.of(
                "menuItems", menuItems,
                "activeTables", activeTables,
                "totalCustomers", totalCustomers,
                "rating", rating
        ));
    }

    // ----- helpers -----
    private RestaurantProfileDTO toDTO(Restaurant r, Map<String, Map<String, String>> hours) {
        return new RestaurantProfileDTO(
                r.getId(),
                r.getName(),
                r.getOwnerName(),
                r.getEmail(),
                r.getPhone(),
                r.getDescription(),
                r.getAddress(),
                r.getCity(),
                r.getState(),
                r.getZip(),
                hours,
                r.getTaxRate(),
                r.getServiceFee(),
                r.getCurrency(),
                r.getDeliveryEnabled(),
                r.getTakeoutEnabled(),
                r.getLogoUrl()
        );
    }

    private Map<String, Map<String, String>> parseHours(String json) throws Exception {
        if (json == null || json.isBlank()) return defaultHours();
        return objectMapper.readValue(json, new TypeReference<>() {});
    }

    private Map<String, Map<String, String>> defaultHours() {
        Map<String, Map<String, String>> m = new HashMap<>();
        List<String> days = List.of("monday","tuesday","wednesday","thursday","friday","saturday","sunday");
        for (String d : days) m.put(d, Map.of("open","09:00","close","22:00"));
        return m;
    }

    private String getExt(String name) {
        if (name == null) return "png";
        int i = name.lastIndexOf('.');
        return i == -1 ? "png" : name.substring(i + 1);
    }
}
