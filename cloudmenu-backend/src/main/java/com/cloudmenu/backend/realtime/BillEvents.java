
package com.cloudmenu.backend.realtime;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class BillEvents {

    // Key = restaurantId (String to be simple), Value = active emitters for that restaurant
    private final Map<String, CopyOnWriteArrayList<SseEmitter>> byRestaurant = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String restaurantId) {
        SseEmitter emitter = new SseEmitter(0L); // never time out (you can set 60_000L if you prefer)
        var list = byRestaurant.computeIfAbsent(restaurantId, k -> new CopyOnWriteArrayList<>());
        list.add(emitter);

        emitter.onCompletion(() -> list.remove(emitter));
        emitter.onTimeout(() -> { emitter.complete(); list.remove(emitter); });
        emitter.onError(e -> { emitter.complete(); list.remove(emitter); });

        // optional hello
        try { emitter.send(SseEmitter.event().name("connected").data("ok")); } catch (IOException ignored) {}
        return emitter;
    }

    public void publish(String restaurantId, String type, Object payload) {
        List<SseEmitter> list = byRestaurant.get(restaurantId);
        if (list == null) return;

        for (SseEmitter em : list) {
            try {
                em.send(SseEmitter.event().name(type).data(payload));
            } catch (IOException e) {
                em.complete();
                list.remove(em);
            }
        }
    }
}
