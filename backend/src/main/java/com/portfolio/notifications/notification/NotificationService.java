package com.portfolio.notifications.notification;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class NotificationService {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final NotificationWebSocketHandler webSocketHandler;
    private final String recentKey;
    private final int recentLimit;

    public NotificationService(
            StringRedisTemplate redisTemplate,
            ObjectMapper objectMapper,
            NotificationWebSocketHandler webSocketHandler,
            @Value("${app.notifications.recent-key}") String recentKey,
            @Value("${app.notifications.recent-limit}") int recentLimit
    ) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.webSocketHandler = webSocketHandler;
        this.recentKey = recentKey;
        this.recentLimit = recentLimit;
    }

    public NotificationMessage create(CreateNotificationRequest request) {
        NotificationMessage notification = NotificationMessage.from(request);

        try {
            redisTemplate.opsForList().leftPush(recentKey, toJson(notification));
            redisTemplate.opsForList().trim(recentKey, 0, recentLimit - 1);
        } catch (DataAccessException ignored) {
            // The WebSocket demo can still run if the cloud Redis is not configured yet.
        }

        webSocketHandler.sendToUser(notification);
        return notification;
    }

    public List<NotificationMessage> recent() {
        List<String> notifications;

        try {
            notifications = redisTemplate.opsForList()
                    .range(recentKey, 0, recentLimit - 1);
        } catch (DataAccessException exception) {
            return List.of();
        }

        if (notifications == null) {
            return List.of();
        }

        return notifications.stream()
                .map(this::fromJson)
                .filter(Objects::nonNull)
                .toList();
    }

    public int onlineUsers() {
        return webSocketHandler.onlineUsers();
    }

    private String toJson(NotificationMessage notification) {
        try {
            return objectMapper.writeValueAsString(notification);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not serialize notification", exception);
        }
    }

    private NotificationMessage fromJson(String json) {
        try {
            return objectMapper.readValue(json, NotificationMessage.class);
        } catch (JsonProcessingException exception) {
            return null;
        }
    }
}
