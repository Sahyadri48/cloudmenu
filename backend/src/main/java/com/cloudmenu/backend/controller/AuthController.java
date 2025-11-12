package com.cloudmenu.backend.controller;

import com.cloudmenu.backend.dto.RestaurantDTO;
import com.cloudmenu.backend.entity.Restaurant;
import com.cloudmenu.backend.repository.RestaurantRepository;
import com.cloudmenu.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final RestaurantRepository restaurantRepository;

    public AuthController(AuthService authService, RestaurantRepository restaurantRepository) {
        this.authService = authService;
        this.restaurantRepository = restaurantRepository;
    }

    // ✅ Separate DTO for signup (includes password)
    record SignupRequest(String name, String email, String password,
                         String logoUrl, String primaryColor, String secondaryColor) {}

    @PostMapping("/restaurant/signup")
    public ResponseEntity<?> signupRestaurant(@RequestBody SignupRequest request) {
        try {
            String token = authService.signupRestaurant(
                    request.name(),
                    request.email(),
                    request.password(),
                    request.logoUrl(),
                    request.primaryColor(),
                    request.secondaryColor()
            );
            return ResponseEntity.ok(new AuthResponse(token));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/restaurant/login")
    public ResponseEntity<?> loginRestaurant(@RequestBody LoginRequest request) {
        try {
            String token = authService.loginRestaurant(request.email(), request.password());
            return ResponseEntity.ok(new AuthResponse(token));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/customer/login")
    public ResponseEntity<?> loginCustomer(@RequestBody CustomerLoginRequest request) {
        try {
            String token = authService
            		.loginCustomer(
                    request.restaurantId(),
                    request.fullName(),
                    request.email(),
                    request.tableNumber()
            );
            return ResponseEntity.ok(new CustomerAuthResponse(token, request.restaurantId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/restaurant")
    public ResponseEntity<RestaurantDTO> getRestaurant(@RequestAttribute("userId") Integer restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        return ResponseEntity.ok(new RestaurantDTO(
                restaurant.getId(),
                restaurant.getName(),
                restaurant.getEmail(),
                restaurant.getSubscriptionPlan() != null ? restaurant.getSubscriptionPlan().name() : null,
                restaurant.getLogoUrl(),
                restaurant.getPrimaryColor(),
                restaurant.getSecondaryColor()
        ));
    }

    // ✅ Response / Request records
    record AuthResponse(String token) {}
    record CustomerAuthResponse(String token, Integer restaurantId) {}
    record LoginRequest(String email, String password) {}
    record CustomerLoginRequest(Integer restaurantId, String fullName, String email, Integer tableNumber) {}
    record ErrorResponse(String error) {}
}
