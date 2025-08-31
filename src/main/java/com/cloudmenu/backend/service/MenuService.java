
package com.cloudmenu.backend.service;

import com.cloudmenu.backend.dto.MenuItemDTO;
import com.cloudmenu.backend.entity.Addon;
import com.cloudmenu.backend.entity.MenuItem;
import com.cloudmenu.backend.entity.Restaurant;
import com.cloudmenu.backend.repository.AddonRepository;
import com.cloudmenu.backend.repository.MenuItemRepository;
import com.cloudmenu.backend.repository.RestaurantRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MenuService {
    private final MenuItemRepository menuItemRepository;
    private final AddonRepository addonRepository;
    private final RestaurantRepository restaurantRepository;

    public MenuService(MenuItemRepository menuItemRepository, AddonRepository addonRepository,
                       RestaurantRepository restaurantRepository) {
        this.menuItemRepository = menuItemRepository;
        this.addonRepository = addonRepository;
        this.restaurantRepository = restaurantRepository;
    }

    public void createMenuItem(Integer restaurantId, MenuItemDTO dto) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        long itemCount = menuItemRepository.findByRestaurantId(restaurantId).size();
        long limit = switch (restaurant.getSubscriptionPlan()) {
            case BASIC -> 50;
            case PROFESSIONAL -> 100;
            case ENTERPRISE -> Long.MAX_VALUE;
        };
        if (itemCount >= limit) {
            throw new RuntimeException("Menu item limit reached for your plan");
        }

        MenuItem item = new MenuItem();
        item.setRestaurantId(restaurantId);
        item.setName(dto.name());
        item.setDescription(dto.description());
        item.setPrice(dto.price());
        item.setCurrency(dto.currency());
        item.setPrepTime(dto.prepTime());
        item.setCategory(dto.category());
        item.setKitchenSection(dto.kitchenSection());
        item.setStatus(MenuItem.Status.valueOf(dto.status()));
        item.setImageUrl(dto.imageUrl());
        item.setDietaryInfo(dto.dietaryInfo());
        item.setIngredients(dto.ingredients());
        item.setAllergens(dto.allergens());
        menuItemRepository.save(item);

        for (MenuItemDTO.AddonDTO addonDTO : dto.addons()) {
            Addon addon = new Addon();
            addon.setMenuItemId(item.getId());
            addon.setName(addonDTO.name());
            addon.setPrice(addonDTO.price());
            addon.setType(Addon.Type.valueOf(addonDTO.type()));
            addonRepository.save(addon);
        }
    }

    public List<MenuItemDTO> getMenuItems(Integer restaurantId) {
        List<MenuItem> items = menuItemRepository.findByRestaurantId(restaurantId);
        return items.stream().map(item -> {
            List<MenuItemDTO.AddonDTO> addons = addonRepository.findByMenuItemId(item.getId()).stream()
                    .map(addon -> new MenuItemDTO.AddonDTO(addon.getId(), addon.getName(), addon.getPrice(), addon.getType().name()))
                    .toList();
            return new MenuItemDTO(
                    item.getId(), item.getRestaurantId(), item.getName(), item.getDescription(),
                    item.getPrice(), item.getCurrency(), item.getPrepTime(), item.getCategory(),
                    item.getKitchenSection(), item.getStatus().name(), item.getImageUrl(),
                    item.getDietaryInfo(), item.getIngredients(), item.getAllergens(), addons
            );
        }).toList();
    }

    public void updateMenuItem(Integer id, MenuItemDTO dto) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        item.setName(dto.name());
        item.setDescription(dto.description());
        item.setPrice(dto.price());
        item.setCurrency(dto.currency());
        item.setPrepTime(dto.prepTime());
        item.setCategory(dto.category());
        item.setKitchenSection(dto.kitchenSection());
        item.setStatus(MenuItem.Status.valueOf(dto.status()));
        item.setImageUrl(dto.imageUrl());
        item.setDietaryInfo(dto.dietaryInfo());
        item.setIngredients(dto.ingredients());
        item.setAllergens(dto.allergens());
        menuItemRepository.save(item);

        addonRepository.deleteAll(addonRepository.findByMenuItemId(id));
        for (MenuItemDTO.AddonDTO addonDTO : dto.addons()) {
            Addon addon = new Addon();
            addon.setMenuItemId(id);
            addon.setName(addonDTO.name());
            addon.setPrice(addonDTO.price());
            addon.setType(Addon.Type.valueOf(addonDTO.type()));
            addonRepository.save(addon);
        }
    }

    public void deleteMenuItem(Integer id) {
        menuItemRepository.deleteById(id);
    }
}