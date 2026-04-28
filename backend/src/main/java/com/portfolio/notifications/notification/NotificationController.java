package com.portfolio.notifications.notification;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @PostMapping
    public NotificationMessage create(@Valid @RequestBody CreateNotificationRequest request) {
        return service.create(request);
    }

    @GetMapping("/recent")
    public List<NotificationMessage> recent() {
        return service.recent();
    }

    @GetMapping("/status")
    public Map<String, Object> status() {
        return Map.of(
                "api", "running",
                "websocket", "/ws/notifications",
                "onlineUsers", service.onlineUsers()
        );
    }
}
