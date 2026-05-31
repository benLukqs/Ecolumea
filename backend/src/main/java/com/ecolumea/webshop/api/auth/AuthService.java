package com.ecolumea.webshop.api.auth;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class AuthService {

    private final JdbcTemplate jdbcTemplate;
    private final AuthSessionService authSessionService;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(JdbcTemplate jdbcTemplate, AuthSessionService authSessionService) {
        this.jdbcTemplate = jdbcTemplate;
        this.authSessionService = authSessionService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        boolean exists = jdbcTemplate.query(
                "SELECT id FROM users WHERE lower(email) = lower(?) LIMIT 1",
                (rs, rowNum) -> rs.getLong("id"),
                request.email().trim()
        ).stream().findFirst().isPresent();

        if (exists) {
            throw new ResponseStatusException(BAD_REQUEST, "Email already registered");
        }

        String passwordHash = passwordEncoder.encode(request.password());

        jdbcTemplate.update(
                """
                INSERT INTO users (email, password_hash, first_name, last_name, is_active)
                VALUES (?, ?, ?, ?, 1)
                """,
                request.email().trim(),
                passwordHash,
                emptyToNull(request.firstName()),
                emptyToNull(request.lastName())
        );

        Long userId = jdbcTemplate.queryForObject("SELECT last_insert_rowid()", Long.class);
        if (userId == null) {
            throw new IllegalStateException("User creation failed");
        }

        assignBootstrapSuperAdminIfFirstUser(userId);

        AuthUserView user = getUserById(userId);
        String token = authSessionService.createSession(userId);
        return new AuthResponse(token, user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        List<UserAuthRow> rows = jdbcTemplate.query(
                """
                SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, u.is_active
                FROM users u
                WHERE lower(u.email) = lower(?)
                LIMIT 1
                """,
                (rs, rowNum) -> new UserAuthRow(
                        rs.getLong("id"),
                        rs.getString("email"),
                        rs.getString("password_hash"),
                        rs.getString("first_name"),
                        rs.getString("last_name"),
                        rs.getBoolean("is_active")
                ),
                request.email().trim()
        );

        if (rows.isEmpty()) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid credentials");
        }

        UserAuthRow userRow = rows.getFirst();
        if (!userRow.active()) {
            throw new ResponseStatusException(UNAUTHORIZED, "User account is inactive");
        }

        if (!passwordEncoder.matches(request.password(), userRow.passwordHash())) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid credentials");
        }

        jdbcTemplate.update("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?", userRow.id());
        String token = authSessionService.createSession(userRow.id());

        return new AuthResponse(
                token,
            getUserById(userRow.id())
        );
    }

    @Transactional
    public AuthUserView me(String authToken) {
        long userId = authSessionService.requireUserId(authToken);
        return getUserById(userId);
    }

    @Transactional
    public void logout(String authToken) {
        authSessionService.invalidateSession(authToken);
    }

    private AuthUserView getUserById(long id) {
        return jdbcTemplate.query(
                "SELECT u.id, u.email, u.first_name, u.last_name FROM users u WHERE u.id = ? LIMIT 1",
                (rs, rowNum) -> new AuthUserView(
                        rs.getLong("id"),
                        rs.getString("email"),
                        rs.getString("first_name"),
                        rs.getString("last_name"),
                        getRolesByUserId(rs.getLong("id"))
                ),
                id
        ).stream().findFirst().orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "User not found"));
    }

    private List<String> getRolesByUserId(long userId) {
        return jdbcTemplate.query(
                """
                SELECT r.code
                FROM user_roles ur
                JOIN roles r ON r.id = ur.role_id
                WHERE ur.user_id = ? AND r.is_active = 1
                ORDER BY r.code ASC
                """,
                (rs, rowNum) -> rs.getString("code"),
                userId
        );
    }

    private void assignBootstrapSuperAdminIfFirstUser(long userId) {
        Integer totalUsers = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
        if (totalUsers == null || totalUsers != 1) {
            return;
        }

        Long superAdminRoleId = jdbcTemplate.query(
                "SELECT id FROM roles WHERE code = 'SUPER_ADMIN' LIMIT 1",
                (rs, rowNum) -> rs.getLong("id")
        ).stream().findFirst().orElse(null);

        if (superAdminRoleId == null) {
            jdbcTemplate.update(
                    "INSERT INTO roles (code, name, description, is_active) VALUES ('SUPER_ADMIN', 'Super Admin', 'Bootstrap super admin role', 1)"
            );
            superAdminRoleId = jdbcTemplate.queryForObject("SELECT last_insert_rowid()", Long.class);
        }

        if (superAdminRoleId != null) {
            jdbcTemplate.update(
                """
                INSERT OR IGNORE INTO user_roles (user_id, role_id)
                VALUES (?, ?)
                """,
                userId,
                superAdminRoleId
            );
        }
    }

    private String emptyToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value;
    }

    private record UserAuthRow(
            long id,
            String email,
            String passwordHash,
            String firstName,
            String lastName,
            boolean active
    ) {
    }
}
