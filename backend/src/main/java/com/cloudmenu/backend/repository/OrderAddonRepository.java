package com.cloudmenu.backend.repository;

import com.cloudmenu.backend.entity.OrderAddon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderAddonRepository extends JpaRepository<OrderAddon, Integer> {
    List<OrderAddon> findByOrderItemId(Integer orderItemId);
}
