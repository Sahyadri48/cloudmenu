//package com.cloudmenu.backend.controller;
//import org.springframework.web.multipart.MultipartFile;
//import java.io.File;
//import java.util.Map;
//import com.cloudmenu.backend.dto.MenuItemDTO;
//import com.cloudmenu.backend.service.MenuService;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//@CrossOrigin(origins = "http://localhost:3000")
//@RestController
//@RequestMapping("/api/menu")
//public class MenuController {
//    private final MenuService menuService;
//
//    public MenuController(MenuService menuService) {
//        this.menuService = menuService;
//    }
//
//    @PostMapping("/items")
//    public ResponseEntity<?> createMenuItem(@RequestAttribute("userId") Integer restaurantId,
//                                           @RequestBody MenuItemDTO dto) {
//        try {
//            menuService.createMenuItem(restaurantId, dto);
//            return ResponseEntity.ok(new SuccessResponse("Menu item added"));
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
//        }
//    }
//    @PostMapping("/items/upload")
//    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
//        try {
//            // For simplicity: store files locally (later you can integrate AWS S3 or Cloudinary)
//            String folder = "uploads/";
//            File dir = new File(folder);
//            if (!dir.exists()) dir.mkdirs();
//
//            String filePath = folder + System.currentTimeMillis() + "_" + file.getOriginalFilename();
//            file.transferTo(new File(filePath));
//
//            // Send back accessible URL (you can serve it via static resource)
//            String fileUrl = "http://localhost:8080/" + filePath;
//            return ResponseEntity.ok(Map.of("url", fileUrl));
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(Map.of("error", "Failed to upload file"));
//        }
//    }
//
//    @GetMapping("/items")
//    public ResponseEntity<List<MenuItemDTO>> getMenuItems(@RequestParam Integer restaurantId) {
//        return ResponseEntity.ok(menuService.getMenuItems(restaurantId));
//    }
//
//    @PutMapping("/items/{id}")
//    public ResponseEntity<?> updateMenuItem(@RequestAttribute("userId") Integer restaurantId,
//                                           @PathVariable Integer id, @RequestBody MenuItemDTO dto) {
//        try {
//            menuService.updateMenuItem(restaurantId, id, dto);
//            return ResponseEntity.ok(new SuccessResponse("Menu item updated"));
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
//        }
//    }
//
//    @DeleteMapping("/items/{id}")
//    public ResponseEntity<?> deleteMenuItem(@RequestAttribute("userId") Integer restaurantId,
//                                           @PathVariable Integer id) {
//        try {
//            menuService.deleteMenuItem(restaurantId, id);
//            return ResponseEntity.ok(new SuccessResponse("Menu item deleted"));
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
//        }
//    }
//
//    record SuccessResponse(String message) {}
//    record ErrorResponse(String error) {}
//}
package com.cloudmenu.backend.controller;

import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.util.Map;
import com.cloudmenu.backend.dto.MenuItemDTO;
import com.cloudmenu.backend.service.MenuService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/menu")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    // ✅ Create new item
    @PostMapping("/items")
    public ResponseEntity<?> createMenuItem(@RequestAttribute("userId") Integer restaurantId,
                                           @RequestBody MenuItemDTO dto) {
        try {
            menuService.createMenuItem(restaurantId, dto);
            return ResponseEntity.ok(new SuccessResponse("Menu item added"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // ✅ Upload image file
 
    @PostMapping(value = "/items/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadImage(@RequestPart("file") MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        java.nio.file.Path uploadDir = java.nio.file.Path.of("uploads");
        java.nio.file.Files.createDirectories(uploadDir);

        String original = file.getOriginalFilename();
        String ext = (original != null && original.contains(".")) ? original.substring(original.lastIndexOf('.') + 1) : "";
        String filename = java.util.UUID.randomUUID() + (ext.isEmpty() ? "" : "." + ext);

        java.nio.file.Path target = uploadDir.resolve(filename);
        java.nio.file.Files.copy(file.getInputStream(), target, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

        String url = "http://localhost:8080/uploads/" + filename; // served statically (next step)
        return ResponseEntity.ok(Map.of("url", url));
    }


    // ✅ Get all menu items
    @GetMapping("/items")
    public ResponseEntity<List<MenuItemDTO>> getMenuItems(@RequestParam Integer restaurantId) {
        return ResponseEntity.ok(menuService.getMenuItems(restaurantId));
    }
    @GetMapping("/items/{id}")
    public ResponseEntity<MenuItemDTO> getMenuItem(@RequestAttribute("userId") Integer restaurantId,
                                                   @PathVariable Integer id) {
        return ResponseEntity.ok(menuService.getMenuItem(restaurantId, id));
    }
    

    // ✅ Update existing item
    @PutMapping("/items/{id}")
    public ResponseEntity<?> updateMenuItem(@RequestAttribute("userId") Integer restaurantId,
                                           @PathVariable Integer id, @RequestBody MenuItemDTO dto) {
        try {
            menuService.updateMenuItem(restaurantId, id, dto);
            return ResponseEntity.ok(new SuccessResponse("Menu item updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // ✅ Delete item
    @DeleteMapping("/items/{id}")
    public ResponseEntity<?> deleteMenuItem(@RequestAttribute("userId") Integer restaurantId,
                                           @PathVariable Integer id) {
        try {
            menuService.deleteMenuItem(restaurantId, id);
            return ResponseEntity.ok(new SuccessResponse("Menu item deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    record SuccessResponse(String message) {}
    record ErrorResponse(String error) {}
}


































