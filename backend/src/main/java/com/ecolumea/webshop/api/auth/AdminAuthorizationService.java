package com.ecolumea.webshop.api.auth;

import java.util.Arrays;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.FORBIDDEN;

@Service
public class AdminAuthorizationService {

    private final AuthSessionService authSessionService;
    private final JdbcTemplate jdbcTemplate;

    public AdminAuthorizationService(AuthSessionService authSessionService, JdbcTemplate jdbcTemplate) {
        this.authSessionService = authSessionService;
        this.jdbcTemplate = jdbcTemplate;
    }

    public long requireAnyRole(String authToken, String... roleCodes) {
        long userId = authSessionService.requireUserId(authToken);

        List<String> roles = Arrays.asList(roleCodes);
        if (roles.isEmpty()) {
            throw new IllegalArgumentException("At least one role code must be provided");
        }

        boolean allowed = jdbcTemplate.query(
                """
                SELECT r.code
                FROM user_roles ur
                JOIN roles r ON r.id = ur.role_id
                WHERE ur.user_id = ? AND r.is_active = 1
                """,
                (rs, rowNum) -> rs.getString("code"),
                userId
        ).stream().anyMatch(roles::contains);

        if (!allowed) {
            throw new ResponseStatusException(FORBIDDEN, "Insufficient admin role");
        }
        return userId;
    }
}
