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
    private final PasswordEncoder passwordEncoder;

    public AuthService(RestaurantRepository restaurantRepository,
                       CustomerRepository customerRepository,
                       JwtUtil jwtUtil,
                       PasswordEncoder passwordEncoder) {
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
        Restaurant r = new Restaurant();
        r.setName(name);
        r.setEmail(email);
        r.setPasswordHash(passwordEncoder.encode(password));
        r.setLogoUrl(logoUrl);
        r.setPrimaryColor(primaryColor);
        r.setSecondaryColor(secondaryColor);
        restaurantRepository.save(r);

        // subject=restaurantId, claims: role, rid
        return jwtUtil.generateRestaurantToken(r.getId());
    }

    public String loginRestaurant(String email, String password) {
        Restaurant r = restaurantRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!passwordEncoder.matches(password, r.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }
        return jwtUtil.generateRestaurantToken(r.getId());
    }

    public String loginCustomer(Integer restaurantId, String fullName, String email, Integer tableNumber) {
        Customer c = new Customer();
        c.setRestaurantId(restaurantId);
        c.setFullName(fullName);
        c.setEmail(email);
        c.setTableNumber(tableNumber);
        customerRepository.save(c);

        // subject=customerId, claims: role, cid, rid(tenant)
        return jwtUtil.generateCustomerToken(c.getId(), restaurantId);
    }
}
