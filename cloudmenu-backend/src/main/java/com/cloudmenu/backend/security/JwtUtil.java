// src/main/java/com/cloudmenu/backend/security/JwtUtil.java
package com.cloudmenu.backend.security;

import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${jwt.secret:WHSlsgc1hBX39UlNNjiLWrFNaLmHZ6Gp}")
    private String secret;

    private Key getSignKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return new SecretKeySpec(keyBytes, SignatureAlgorithm.HS256.getJcaName());
    }

    /* ---------- Builders (explicit) ---------- */

    /** Token for a RESTAURANT admin. Subject = restaurantId, claims: role, rid */
    public String generateRestaurantToken(Integer restaurantId) {
        return Jwts.builder()
                .setSubject(String.valueOf(restaurantId))
                .addClaims(Map.of(
                        "role", "RESTAURANT",
                        "rid", restaurantId
                ))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24)) // 24h
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /** Token for a CUSTOMER. Subject = customerId, claims: role, rid (tenant), cid */
    public String generateCustomerToken(Integer customerId, Integer restaurantId) {
        return Jwts.builder()
                .setSubject(String.valueOf(customerId))
                .addClaims(Map.of(
                        "role", "CUSTOMER",
                        "cid", customerId,
                        "rid", restaurantId
                ))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /* ---------- Extractors ---------- */

    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /** Subject of the token (restaurantId for RESTAURANT, customerId for CUSTOMER) */
    public Integer extractId(String token) {
        return Integer.parseInt(extractClaims(token).getSubject());
    }

    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    /** Tenant id (restaurant) encoded as "rid" for both restaurant & customer tokens */
    public Integer extractRestaurantId(String token) {
        Object v = extractClaims(token).get("rid");
        return (v == null) ? null : Integer.parseInt(v.toString());
    }

    /** Convenience: customer id if present */
    public Integer extractCustomerId(String token) {
        Object v = extractClaims(token).get("cid");
        return (v == null) ? null : Integer.parseInt(v.toString());
    }

    public boolean isTokenValid(String token) {
        try {
            Claims c = Jwts.parserBuilder()
                    .setSigningKey(getSignKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return c.getExpiration() != null && c.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
