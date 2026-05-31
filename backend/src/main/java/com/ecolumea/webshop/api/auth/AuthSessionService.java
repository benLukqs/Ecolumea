package com.ecolumea.webshop.api.auth;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.sql.SQLException;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class AuthSessionService {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final JdbcTemplate jdbcTemplate;

    public AuthSessionService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public String createSession(long userId) {
        String token = UUID.randomUUID().toString();
        String expiresAt = LocalDateTime.now().plusDays(1).format(FORMATTER);

        jdbcTemplate.update(
                """
                INSERT INTO auth_sessions (user_id, token, expires_at)
                VALUES (?, ?, ?)
                """,
                userId,
                token,
                expiresAt
        );
        return token;
    }

    @Transactional
    public Long resolveUserIdOrNull(String authToken) {
        if (authToken == null || authToken.isBlank()) {
            return null;
        }

        List<Long> rows = jdbcTemplate.query(
                """
                SELECT s.user_id
                FROM auth_sessions s
                WHERE s.token = ?
                  AND s.expires_at >= CURRENT_TIMESTAMP
                LIMIT 1
                """,
                (rs, rowNum) -> rs.getLong("user_id"),
                authToken
        );

        if (rows.isEmpty()) {
            return null;
        }
        return rows.getFirst();
    }

    @Transactional
    public long requireUserId(String authToken) {
        Long userId = resolveUserIdOrNull(authToken);
        if (userId == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "Authentication required");
        }
        return userId;
    }

    @Transactional
    public void invalidateSession(String authToken) {
        if (authToken == null || authToken.isBlank()) {
            return;
        }
        jdbcTemplate.update("DELETE FROM auth_sessions WHERE token = ?", authToken);
    }

    
}
