package com.portfolio.notifications.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper;
    private final Map<String, Set<WebSocketSession>> sessionsByUser = new ConcurrentHashMap<>();
    private final Map<String, String> userBySessionId = new ConcurrentHashMap<>();

    public NotificationWebSocketHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String user = extractUser(session.getUri());
        sessionsByUser.computeIfAbsent(user, ignored -> ConcurrentHashMap.newKeySet()).add(session);
        userBySessionId.put(session.getId(), user);

        send(session, Map.of(
                "event", "connected",
                "user", user,
                "onlineUsers", onlineUsers()
        ));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String user = userBySessionId.remove(session.getId());
        if (user == null) {
            return;
        }

        Set<WebSocketSession> sessions = sessionsByUser.get(user);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                sessionsByUser.remove(user);
            }
        }
    }

    public void sendToUser(NotificationMessage notification) {
        Set<WebSocketSession> sessions = sessionsByUser.get(notification.targetUser());
        if (sessions == null) {
            return;
        }

        sessions.removeIf(session -> !session.isOpen());
        sessions.forEach(session -> send(session, Map.of(
                "event", "notification",
                "payload", notification
        )));
    }

    public int onlineUsers() {
        return sessionsByUser.values().stream()
                .mapToInt(Set::size)
                .sum();
    }

    private void send(WebSocketSession session, Object payload) {
        try {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(payload)));
        } catch (IOException ignored) {
            // Closed browser tabs are cleaned up on the next connection event.
        }
    }

    private String extractUser(URI uri) {
        if (uri == null) {
            return "guest";
        }

        String user = UriComponentsBuilder.fromUri(uri)
                .build()
                .getQueryParams()
                .getFirst("user");

        if (user == null || user.isBlank()) {
            return "guest";
        }

        return NotificationMessage.normalizeUser(user);
    }
}
