package com.ecolumea.webshop.api.account;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class AccountService {

    private final JdbcTemplate jdbcTemplate;

    public AccountService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<AccountAddressView> getAddresses(long userId) {
        return jdbcTemplate.query(
                """
            SELECT cp.id, cp.street, cp.house_number, cp.postal_code, cp.city, cp.country_code, cp.is_default
                FROM customer_profiles cp
                WHERE cp.user_id = ?
                ORDER BY cp.is_default DESC, cp.id ASC
                """,
                (rs, rowNum) -> new AccountAddressView(
                        rs.getLong("id"),
                        rs.getString("street"),
                        rs.getString("house_number"),
                        rs.getString("postal_code"),
                        rs.getString("city"),
                        rs.getString("country_code"),
                        rs.getBoolean("is_default")
                ),
                userId
        );
    }

    @Transactional
    public AccountAddressView createAddress(long userId, AccountAddressUpsertRequest request) {
        if (request.isDefault()) {
            clearDefaultAddress(userId);
        }

        jdbcTemplate.update(
                """
                INSERT INTO customer_profiles (
                                    user_id, street, house_number, postal_code, city, country_code, is_default
                )
                                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                userId,
                request.street(),
                request.houseNumber(),
                request.postalCode(),
                request.city(),
                request.countryCode().trim().toUpperCase(),
                request.isDefault()
        );

        Long id = jdbcTemplate.queryForObject("SELECT last_insert_rowid()", Long.class);
        if (id == null) {
            throw new IllegalStateException("Address creation failed");
        }
        return getAddressById(userId, id);
    }

    @Transactional
    public AccountAddressView updateAddress(long userId, long addressId, AccountAddressUpsertRequest request) {
        if (request.isDefault()) {
            clearDefaultAddress(userId);
        }

        int updated = jdbcTemplate.update(
                """
                UPDATE customer_profiles
                SET street = ?,
                    house_number = ?,
                    postal_code = ?,
                    city = ?,
                    country_code = ?,
                    is_default = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND user_id = ?
                """,
                request.street(),
                request.houseNumber(),
                request.postalCode(),
                request.city(),
                request.countryCode().trim().toUpperCase(),
                request.isDefault(),
                addressId,
                userId
        );

        if (updated == 0) {
            throw new ResponseStatusException(NOT_FOUND, "Address not found");
        }
        return getAddressById(userId, addressId);
    }

    public List<AccountOrderHistoryItem> getOrderHistory(long userId) {
        return jdbcTemplate.query(
                """
                SELECT o.id, o.order_number, o.total_amount, o.currency, o.order_status, o.payment_status, o.shipping_provider, o.created_at
                FROM orders o
                WHERE o.user_id = ?
                ORDER BY o.created_at DESC, o.id DESC
                """,
                (rs, rowNum) -> new AccountOrderHistoryItem(
                        rs.getLong("id"),
                        rs.getString("order_number"),
                        rs.getBigDecimal("total_amount"),
                        rs.getString("currency"),
                        rs.getString("order_status"),
                        rs.getString("payment_status"),
                        rs.getString("shipping_provider"),
                        rs.getString("created_at")
                ),
                userId
        );
    }

    private AccountAddressView getAddressById(long userId, long addressId) {
        return jdbcTemplate.query(
                """
            SELECT cp.id, cp.street, cp.house_number, cp.postal_code, cp.city, cp.country_code, cp.is_default
                FROM customer_profiles cp
                WHERE cp.user_id = ? AND cp.id = ?
                LIMIT 1
                """,
                (rs, rowNum) -> new AccountAddressView(
                        rs.getLong("id"),
                        rs.getString("street"),
                        rs.getString("house_number"),
                        rs.getString("postal_code"),
                        rs.getString("city"),
                        rs.getString("country_code"),
                        rs.getBoolean("is_default")
                ),
                userId,
                addressId
        ).stream().findFirst().orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Address not found"));
    }

    private void clearDefaultAddress(long userId) {
        jdbcTemplate.update("UPDATE customer_profiles SET is_default = 0 WHERE user_id = ?", userId);
    }
}
