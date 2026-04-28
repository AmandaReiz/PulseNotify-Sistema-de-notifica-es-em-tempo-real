package com.portfolio.notifications.notification;

import java.time.Instant;
import java.util.UUID;

public record NotificationMessage(
        String id,
        String targetUser,
        String title,
        String text,
        String tone,
        String type,
        Instant createdAt
) {
    public static NotificationMessage from(CreateNotificationRequest request) {
        return new NotificationMessage(
                UUID.randomUUID().toString(),
                normalizeUser(request.targetUser()),
                request.title(),
                request.text(),
                request.tone(),
                request.type(),
                Instant.now()
        );
    }

    public static String normalizeUser(String user) {
        return user.trim().toLowerCase();
    }
}
