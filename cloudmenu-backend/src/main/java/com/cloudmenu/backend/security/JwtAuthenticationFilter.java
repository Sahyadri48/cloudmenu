// src/main/java/com/cloudmenu/backend/security/JwtAuthenticationFilter.java
package com.cloudmenu.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                String token = header.substring(7);

                if (jwtUtil.isTokenValid(token)) {
                    Integer subId = jwtUtil.extractId(token);     // sub (restaurantId for admin, customerId for customer)
                    String role   = jwtUtil.extractRole(token);// "RESTAURANT" | "CUSTOMER"

                    if ("RESTAURANT".equals(role)) {
                        // Admin token: sub = restaurantId
                        request.setAttribute("restaurantId", subId);
                    } else if ("CUSTOMER".equals(role)) {
                        // Customer token: sub = customerId, rid = restaurantId
                        request.setAttribute("userId", subId);
                        Integer rid = jwtUtil.extractRestaurantId(token);
                        if (rid != null) request.setAttribute("restaurantId", rid);
                    }

                    var auth = new UsernamePasswordAuthenticationToken(
                            String.valueOf(subId),
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                    );
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        } catch (Exception ex) {
            SecurityContextHolder.clearContext(); // continue unauthenticated
        }

        filterChain.doFilter(request, response);
    }
}

