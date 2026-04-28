package com.portfolio.notifications.notification;

import jakarta.validation.constraints.NotBlank;

public record CreateNotificationRequest(
        @NotBlank String targetUser,
        @NotBlank String title,
        @NotBlank String text,
        @NotBlank String tone,
        @NotBlank String type
) {
}
