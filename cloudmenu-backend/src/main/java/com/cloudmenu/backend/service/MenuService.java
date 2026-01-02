package com.cloudmenu.backend.service;

import com.cloudmenu.backend.dto.MenuItemDTO;
import com.cloudmenu.backend.entity.MenuItem;
import com.cloudmenu.backend.entity.MenuItem.Status; // enum import
import com.cloudmenu.backend.repository.MenuItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MenuService {

    private final MenuItemRepository menuItemRepository;

    public MenuService(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    /* ================== Create ================== */
    public void createMenuItem(Integer restaurantId, MenuItemDTO dto) {
        MenuItem m = new MenuItem();
        m.setRestaurantId(restaurantId);
        m.setName(dto.name());
        m.setDescription(dto.description());
        m.setPrice(dto.price());
        m.setDiscountPrice(dto.discountPrice());
        m.setCurrency(dto.currency());
        m.setPrepTime(dto.prepTime());
        m.setCategory(dto.category());
        m.setKitchenSection(dto.kitchenSection());
        m.setStatus(dto.status() != null ? Status.valueOf(dto.status()) : Status.AVAILABLE);
        m.setSpiceLevel(dto.spiceLevel());
        m.setImageUrl(dto.imageUrl());
        m.setDietaryInfo(dto.dietaryInfo());
        m.setIngredients(dto.ingredients());
        m.setAllergens(dto.allergens());
        menuItemRepository.save(m);
    }

    /* ================== Read one ================== */
    public MenuItemDTO getMenuItem(Integer restaurantId, Integer id) {
        var item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
        if (!item.getRestaurantId().equals(restaurantId)) {
            throw new RuntimeException("Forbidden");
        }
        return toDTO(item);
    }

    /* ================== Toggle active ================== */
    public void setActive(Integer restaurantId, Integer id, boolean active) {
        var item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
        if (!item.getRestaurantId().equals(restaurantId)) {
            throw new RuntimeException("Forbidden");
        }
        item.setStatus(active ? Status.AVAILABLE : Status.UNAVAILABLE);
        menuItemRepository.save(item);
    }

    /* ================== List ================== */
    public List<MenuItemDTO> getMenuItems(Integer restaurantId) {
        return menuItemRepository.findByRestaurantId(restaurantId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /* ================== Update ================== */
    public void updateMenuItem(Integer restaurantId, Integer id, MenuItemDTO dto) {
        var m = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        if (!m.getRestaurantId().equals(restaurantId)) {
            throw new RuntimeException("Unauthorized: You can only update your own menu items");
        }

        m.setName(dto.name());
        m.setDescription(dto.description());
        m.setPrice(dto.price());
        m.setDiscountPrice(dto.discountPrice());
        m.setCurrency(dto.currency());
        m.setPrepTime(dto.prepTime());
        m.setCategory(dto.category());
        m.setKitchenSection(dto.kitchenSection());
        m.setStatus(dto.status() != null ? Status.valueOf(dto.status()) : m.getStatus());
        m.setSpiceLevel(dto.spiceLevel());
        m.setImageUrl(dto.imageUrl());
        m.setDietaryInfo(dto.dietaryInfo());
        m.setIngredients(dto.ingredients());
        m.setAllergens(dto.allergens());
        menuItemRepository.save(m);
    }

    /* ================== Delete ================== */
    public void deleteMenuItem(Integer restaurantId, Integer id) {
        var m = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        if (!m.getRestaurantId().equals(restaurantId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own menu items");
        }
        menuItemRepository.delete(m);
        
    }

    /* ================== Mapper ================== */
    private MenuItemDTO toDTO(MenuItem menuItem) {
        return new MenuItemDTO(
                menuItem.getId(),
                menuItem.getRestaurantId(),
                menuItem.getName(),
                menuItem.getDescription(),
                menuItem.getPrice(),
                menuItem.getDiscountPrice(),
                menuItem.getCurrency(),
                menuItem.getPrepTime(),
                menuItem.getCategory(),
                menuItem.getKitchenSection(),
                menuItem.getStatus().name(),
                menuItem.getSpiceLevel(),
                menuItem.getDietaryInfo(),
                menuItem.getIngredients(),
                menuItem.getAllergens(),
                menuItem.getImageUrl(),
                List.of() // placeholder for addons
        );
    }
}
