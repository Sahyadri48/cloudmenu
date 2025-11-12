package com.cloudmenu.backend.repository;

import com.cloudmenu.backend.entity.Addon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AddonRepository extends JpaRepository<Addon, Integer> {
    List<Addon> findByMenuItemId(Integer menuItemId);
}
