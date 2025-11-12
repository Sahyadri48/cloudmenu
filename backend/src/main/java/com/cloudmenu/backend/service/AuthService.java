
package com.cloudmenu.backend.service;

import com.cloudmenu.backend.entity.Customer;
import com.cloudmenu.backend.entity.Restaurant;
import com.cloudmenu.backend.repository.CustomerRepository;
import com.cloudmenu.backend.repository.RestaurantRepository;
import com.cloudmenu.backend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final RestaurantRepository restaurantRepository;
    private final CustomerRepository customerRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder; // ✅ use interface

    public AuthService(RestaurantRepository restaurantRepository,
                       CustomerRepository customerRepository,
                       JwtUtil jwtUtil,
                       PasswordEncoder passwordEncoder) { // ✅ inject interface
        this.restaurantRepository = restaurantRepository;
        this.customerRepository = customerRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    public String signupRestaurant(String name, String email, String password, String logoUrl,
                                  String primaryColor, String secondaryColor) {
        if (restaurantRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        Restaurant restaurant = new Restaurant();
        restaurant.setName(name);
        restaurant.setEmail(email);
        restaurant.setPasswordHash(passwordEncoder.encode(password));
        restaurant.setLogoUrl(logoUrl);
        restaurant.setPrimaryColor(primaryColor);
        restaurant.setSecondaryColor(secondaryColor);
        restaurantRepository.save(restaurant);
        return jwtUtil.generateToken(restaurant.getId(), "RESTAURANT");
    }

    public String loginRestaurant(String email, String password) {
        Restaurant restaurant = restaurantRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!passwordEncoder.matches(password, restaurant.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }
        return jwtUtil.generateToken(restaurant.getId(), "RESTAURANT");
    }

    public String loginCustomer(Integer restaurantId, String fullName, String email, Integer tableNumber) {
        Customer customer = new Customer();
        customer.setRestaurantId(restaurantId);
        customer.setFullName(fullName);
        customer.setEmail(email);
        customer.setTableNumber(tableNumber);
        customerRepository.save(customer);
        return jwtUtil.generateToken(customer.getId(), "CUSTOMER");
    }
}
