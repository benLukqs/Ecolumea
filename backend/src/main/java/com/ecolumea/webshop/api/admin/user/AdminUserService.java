package com.ecolumea.webshop.api.admin.user;

import java.security.SecureRandom;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class AdminUserService {

    private static final String PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final SecureRandom secureRandom = new SecureRandom();

    public AdminUserService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<AdminUserSummary> listUsers() {
        return jdbcTemplate.query(
                """
                SELECT u.id, u.email, u.first_name, u.last_name, u.is_active
                FROM users u
                ORDER BY u.created_at DESC, u.id DESC
                """,
                (rs, rowNum) -> {
                    long userId = rs.getLong("id");
                    return new AdminUserSummary(
                            userId,
                            rs.getString("email"),
                            rs.getString("first_name"),
                            rs.getString("last_name"),
                            rs.getBoolean("is_active"),
                            getRoles(userId)
                    );
                }
        );
    }

    public List<AdminRoleSummary> listRoles() {
        return jdbcTemplate.query(
                """
                SELECT code, name, is_active
                FROM roles
                ORDER BY code ASC
                """,
                (rs, rowNum) -> new AdminRoleSummary(
                        rs.getString("code"),
                        rs.getString("name"),
                        rs.getBoolean("is_active")
                )
        );
    }

    @Transactional
    public AdminPasswordResetResponse resetPassword(long userId) {
        requireUserExists(userId);

        String temporaryPassword = generateTemporaryPassword(12);
        String passwordHash = passwordEncoder.encode(temporaryPassword);

        jdbcTemplate.update(
                "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                passwordHash,
                userId
        );

        jdbcTemplate.update("DELETE FROM auth_sessions WHERE user_id = ?", userId);

        return new AdminPasswordResetResponse(userId, temporaryPassword);
    }

    @Transactional
    public AdminUserSummary assignRole(long actorUserId, long targetUserId, String roleCode) {
        requireUserExists(targetUserId);
        Long roleId = findActiveRoleId(roleCode);

        int inserted = jdbcTemplate.update(
            """
            INSERT OR IGNORE INTO user_roles (user_id, role_id)
            VALUES (?, ?)
            """,
            targetUserId,
            roleId
        );

        if (inserted == 0) {
            // idempotent no-op; role was already assigned
            return getUserSummary(targetUserId);
        }

        return getUserSummary(targetUserId);
    }

    @Transactional
    public AdminUserSummary removeRole(long actorUserId, long targetUserId, String roleCode) {
        requireUserExists(targetUserId);
        Long roleId = findActiveRoleId(roleCode);

        if ("SUPER_ADMIN".equals(roleCode) && countUsersWithRole("SUPER_ADMIN") <= 1) {
            throw new ResponseStatusException(BAD_REQUEST, "Cannot remove the last SUPER_ADMIN role");
        }

        int deleted = jdbcTemplate.update(
                "DELETE FROM user_roles WHERE user_id = ? AND role_id = ?",
                targetUserId,
                roleId
        );

        if (deleted == 0) {
            // idempotent no-op; role was not assigned
            return getUserSummary(targetUserId);
        }

        if ("SUPER_ADMIN".equals(roleCode) && actorUserId == targetUserId && countUsersWithRole("SUPER_ADMIN") <= 0) {
            throw new ResponseStatusException(BAD_REQUEST, "Operation would remove all SUPER_ADMIN users");
        }

        return getUserSummary(targetUserId);
    }

    private List<String> getRoles(long userId) {
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

    private AdminUserSummary getUserSummary(long userId) {
        return jdbcTemplate.query(
                """
                SELECT u.id, u.email, u.first_name, u.last_name, u.is_active
                FROM users u
                WHERE u.id = ?
                LIMIT 1
                """,
                (rs, rowNum) -> new AdminUserSummary(
                        rs.getLong("id"),
                        rs.getString("email"),
                        rs.getString("first_name"),
                        rs.getString("last_name"),
                        rs.getBoolean("is_active"),
                        getRoles(rs.getLong("id"))
                ),
                userId
        ).stream().findFirst().orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
    }

    private void requireUserExists(long userId) {
        boolean exists = jdbcTemplate.query(
                "SELECT id FROM users WHERE id = ? LIMIT 1",
                (rs, rowNum) -> rs.getLong("id"),
                userId
        ).stream().findFirst().isPresent();

        if (!exists) {
            throw new ResponseStatusException(NOT_FOUND, "User not found");
        }
    }

    private Long findActiveRoleId(String roleCode) {
        return jdbcTemplate.query(
                "SELECT id FROM roles WHERE code = ? AND is_active = 1 LIMIT 1",
                (rs, rowNum) -> rs.getLong("id"),
                roleCode
        ).stream().findFirst().orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Role not found or inactive"));
    }

    private long countUsersWithRole(String roleCode) {
        Long count = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(DISTINCT ur.user_id)
                FROM user_roles ur
                JOIN roles r ON r.id = ur.role_id
                WHERE r.code = ? AND r.is_active = 1
                """,
                Long.class,
                roleCode
        );
        return count == null ? 0L : count;
    }

    private String generateTemporaryPassword(int length) {
        StringBuilder builder = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int index = secureRandom.nextInt(PASSWORD_CHARS.length());
            builder.append(PASSWORD_CHARS.charAt(index));
        }
        return builder.toString();
    }
}
