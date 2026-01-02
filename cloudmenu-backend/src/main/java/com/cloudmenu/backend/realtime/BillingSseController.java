package com.cloudmenu.backend.realtime;

import com.cloudmenu.backend.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/sse/billing")
public class BillingSseController {

    private final BillEvents events;
    private final JwtUtil jwt;

    public BillingSseController(BillEvents events, JwtUtil jwt) {
        this.events = events;
        this.jwt = jwt;
    }

    @GetMapping("/stream")
    public SseEmitter stream(@RequestParam("jwt") String token) {
        if (token == null || !jwt.isTokenValid(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }
        // Your JWT subject is the restaurantId for RESTAURANT roles
        String restaurantId = String.valueOf(jwt.extractId(token));
        return events.subscribe(restaurantId);
    }
}
