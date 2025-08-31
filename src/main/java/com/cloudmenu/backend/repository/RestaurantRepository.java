package com.cloudmenu.backend.repository;

import com.cloudmenu.backend.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RestaurantRepository extends JpaRepository<Restaurant, Integer> {
    Optional<Restaurant> findByEmail(String email);
}
