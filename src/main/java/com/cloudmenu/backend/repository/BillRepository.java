package com.cloudmenu.backend.repository;

import com.cloudmenu.backend.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Integer> {
    Optional<Bill> findByOrderId(Integer orderId);
}